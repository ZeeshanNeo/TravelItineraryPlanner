using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Application.Common.Models;
using Application.DTOs.Budget;
using Application.DTOs.Expense;
using Application.Services;
using Domain.Entities;
using Domain.Interfaces;
using Mapster;

namespace Infrastructure.Services;

public class BudgetService : IBudgetService
{
    private readonly ITripBudgetRepository _budgetRepository;
    private readonly IExpenseRepository _expenseRepository;
    private readonly ITripRepository _tripRepository;

    public BudgetService(
        ITripBudgetRepository budgetRepository, 
        IExpenseRepository expenseRepository,
        ITripRepository tripRepository)
    {
        _budgetRepository = budgetRepository;
        _expenseRepository = expenseRepository;
        _tripRepository = tripRepository;
    }

    public async Task<Result<TripBudgetResponse>> GetBudgetAsync(Guid tripId, Guid userId, CancellationToken cancellationToken = default)
    {
        var trip = await _tripRepository.GetByIdAndUserIdAsync(tripId, userId, cancellationToken);
        if (trip == null)
            return Result<TripBudgetResponse>.Failure("Trip not found or you don't have permission to access it.");

        var budget = await _budgetRepository.GetByTripIdAndUserIdAsync(tripId, userId, cancellationToken);
        if (budget == null)
            return Result<TripBudgetResponse>.Success(new TripBudgetResponse { TripId = tripId });

        return Result<TripBudgetResponse>.Success(budget.Adapt<TripBudgetResponse>());
    }

    public async Task<Result<TripBudgetResponse>> UpdateBudgetAsync(Guid tripId, UpdateTripBudgetRequest request, Guid userId, CancellationToken cancellationToken = default)
    {
        var trip = await _tripRepository.GetByIdAndUserIdAsync(tripId, userId, cancellationToken);
        if (trip == null)
            return Result<TripBudgetResponse>.Failure("Trip not found or you don't have permission to access it.");

        var budget = await _budgetRepository.GetByTripIdAndUserIdAsync(tripId, userId, cancellationToken);
        
        try
        {
            if (budget == null)
            {
                budget = new TripBudget(tripId, request.TotalAmount, request.Currency);
                await _budgetRepository.AddAsync(budget, cancellationToken);
            }
            else
            {
                budget.UpdateBudget(request.TotalAmount, request.Currency);
            }

            var categoryItems = request.CategoryBudgets
                .Where(cb => Enum.TryParse<ExpenseCategory>(cb.Category, true, out _))
                .Select(cb => (Enum.Parse<ExpenseCategory>(cb.Category, true), cb.Amount));

            budget.SyncCategories(categoryItems);

            await _budgetRepository.SaveChangesAsync(cancellationToken);
            return Result<TripBudgetResponse>.Success(budget.Adapt<TripBudgetResponse>());
        }
        catch (ArgumentException ex)
        {
            return Result<TripBudgetResponse>.Failure(ex.Message);
        }
    }

    public async Task<Result<BudgetSummaryResponse>> GetBudgetSummaryAsync(Guid tripId, Guid userId, CancellationToken cancellationToken = default)
    {
        var trip = await _tripRepository.GetByIdAndUserIdAsync(tripId, userId, cancellationToken);
        if (trip == null)
            return Result<BudgetSummaryResponse>.Failure("Trip not found or you don't have permission to access it.");

        var budget = await _budgetRepository.GetByTripIdAndUserIdAsync(tripId, userId, cancellationToken);
        var expenses = await _expenseRepository.GetByTripIdAsync(tripId, cancellationToken);

        var totalBudget = budget?.TotalAmount ?? 0;
        var currency = budget?.Currency ?? "USD";
        var totalSpent = expenses.Sum(e => e.Amount * e.ExchangeRate);

        var summary = new BudgetSummaryResponse
        {
            TotalBudget = totalBudget,
            TotalSpent = totalSpent,
            RemainingBudget = totalBudget - totalSpent,
            Currency = currency
        };

        var categories = Enum.GetValues<ExpenseCategory>();
        foreach (var category in categories)
        {
            var budgeted = budget?.CategoryBudgets.FirstOrDefault(cb => cb.Category == category)?.Amount ?? 0;
            var spent = expenses.Where(e => e.Category == category).Sum(e => e.Amount * e.ExchangeRate);

            summary.CategorySummaries.Add(new CategorySummaryResponse
            {
                Category = category.ToString(),
                BudgetedAmount = budgeted,
                SpentAmount = spent,
                RemainingAmount = budgeted - spent,
                PercentageSpent = budgeted > 0 ? (spent / budgeted) * 100 : 0
            });
        }

        return Result<BudgetSummaryResponse>.Success(summary);
    }
}

public class ExpenseService : IExpenseService
{
    private readonly IExpenseRepository _expenseRepository;
    private readonly ITripRepository _tripRepository;

    public ExpenseService(IExpenseRepository expenseRepository, ITripRepository tripRepository)
    {
        _expenseRepository = expenseRepository;
        _tripRepository = tripRepository;
    }

    public async Task<Result<ExpenseResponse>> CreateExpenseAsync(CreateExpenseRequest request, Guid userId, CancellationToken cancellationToken = default)
    {
        var trip = await _tripRepository.GetByIdAndUserIdAsync(request.TripId, userId, cancellationToken);
        if (trip == null)
            return Result<ExpenseResponse>.Failure("Trip not found or you don't have permission to access it.");

        if (!Enum.TryParse<ExpenseCategory>(request.Category, true, out var category))
            return Result<ExpenseResponse>.Failure("Invalid expense category.");

        try
        {
            var expense = new Expense(
                request.TripId,
                request.Title,
                category,
                request.Amount,
                request.Currency,
                userId,
                request.Date,
                request.Description,
                request.ExchangeRate,
                request.BookingId,
                request.ActivityId
            );

            await _expenseRepository.AddAsync(expense, cancellationToken);
            await _expenseRepository.SaveChangesAsync(cancellationToken);

            var response = expense.Adapt<ExpenseResponse>();
            response.AmountInBaseCurrency = expense.Amount * expense.ExchangeRate;
            return Result<ExpenseResponse>.Success(response);
        }
        catch (ArgumentException ex)
        {
            return Result<ExpenseResponse>.Failure(ex.Message);
        }
    }

    public async Task<Result<ExpenseResponse>> GetExpenseAsync(Guid id, Guid userId, CancellationToken cancellationToken = default)
    {
        var expense = await _expenseRepository.GetByIdAndUserIdAsync(id, userId, cancellationToken);
        if (expense == null)
            return Result<ExpenseResponse>.Failure("Expense not found or you don't have permission to access it.");

        var response = expense.Adapt<ExpenseResponse>();
        response.AmountInBaseCurrency = expense.Amount * expense.ExchangeRate;
        return Result<ExpenseResponse>.Success(response);
    }

    public async Task<Result<IEnumerable<ExpenseResponse>>> GetTripExpensesAsync(Guid tripId, Guid userId, CancellationToken cancellationToken = default)
    {
        var trip = await _tripRepository.GetByIdAndUserIdAsync(tripId, userId, cancellationToken);
        if (trip == null)
            return Result<IEnumerable<ExpenseResponse>>.Failure("Trip not found or you don't have permission to access it.");

        var expenses = await _expenseRepository.GetByUserIdAsync(userId, tripId, cancellationToken);
        return Result<IEnumerable<ExpenseResponse>>.Success(expenses.Select(e => 
        {
            var r = e.Adapt<ExpenseResponse>();
            r.AmountInBaseCurrency = e.Amount * e.ExchangeRate;
            return r;
        }));
    }

    public async Task<Result<ExpenseResponse>> UpdateExpenseAsync(Guid id, UpdateExpenseRequest request, Guid userId, CancellationToken cancellationToken = default)
    {
        var expense = await _expenseRepository.GetByIdAndUserIdAsync(id, userId, cancellationToken);
        if (expense == null)
            return Result<ExpenseResponse>.Failure("Expense not found or you don't have permission to access it.");

        try
        {
            ExpenseCategory category = expense.Category;
            if (request.Category != null && Enum.TryParse<ExpenseCategory>(request.Category, true, out var parsedCategory))
                category = parsedCategory;

            expense.UpdateDetails(
                request.Title ?? expense.Title,
                category,
                request.Amount ?? expense.Amount,
                request.Currency ?? expense.Currency,
                request.Date ?? expense.Date,
                request.Description ?? expense.Description,
                request.ExchangeRate ?? expense.ExchangeRate,
                request.BookingId ?? expense.BookingId,
                request.ActivityId ?? expense.ActivityId
            );

            await _expenseRepository.SaveChangesAsync(cancellationToken);

            var response = expense.Adapt<ExpenseResponse>();
            response.AmountInBaseCurrency = expense.Amount * expense.ExchangeRate;
            return Result<ExpenseResponse>.Success(response);
        }
        catch (ArgumentException ex)
        {
            return Result<ExpenseResponse>.Failure(ex.Message);
        }
    }

    public async Task<Result> DeleteExpenseAsync(Guid id, Guid userId, CancellationToken cancellationToken = default)
    {
        var expense = await _expenseRepository.GetByIdAndUserIdAsync(id, userId, cancellationToken);
        if (expense == null)
            return Result.Failure("Expense not found or you don't have permission to access it.");

        await _expenseRepository.DeleteAsync(id, cancellationToken);
        await _expenseRepository.SaveChangesAsync(cancellationToken);
        return Result.Success();
    }
}
