using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Application.DTOs.Budget;
using Application.DTOs.Expense;
using Application.Services;
using Domain.Entities;
using Domain.Interfaces;

namespace Infrastructure.Services;

public class BudgetService : IBudgetService
{
    private readonly ITripBudgetRepository _budgetRepository;
    private readonly IExpenseRepository _expenseRepository;

    public BudgetService(ITripBudgetRepository budgetRepository, IExpenseRepository expenseRepository)
    {
        _budgetRepository = budgetRepository;
        _expenseRepository = expenseRepository;
    }

    public async Task<TripBudgetResponse> GetBudgetAsync(Guid tripId, Guid userId, CancellationToken cancellationToken = default)
    {
        var budget = await _budgetRepository.GetByTripIdAndUserIdAsync(tripId, userId, cancellationToken);
        if (budget == null)
        {
            return new TripBudgetResponse { TripId = tripId };
        }

        return MapToResponse(budget);
    }

    public async Task<TripBudgetResponse> UpdateBudgetAsync(Guid tripId, UpdateTripBudgetRequest request, Guid userId, CancellationToken cancellationToken = default)
    {
        var budget = await _budgetRepository.GetByTripIdAndUserIdAsync(tripId, userId, cancellationToken);
        
        bool isNew = false;
        if (budget == null)
        {
            isNew = true;
            budget = new TripBudget 
            { 
                Id = Guid.NewGuid(),
                TripId = tripId,
                CreatedAt = DateTime.UtcNow,
                CategoryBudgets = new List<CategoryBudget>()
            };
        }

        budget.TotalAmount = request.TotalAmount;
        budget.Currency = request.Currency;
        budget.UpdatedAt = DateTime.UtcNow;

        var newCategories = new List<CategoryBudget>();
        foreach (var cb in request.CategoryBudgets)
        {
            if (Enum.TryParse<ExpenseCategory>(cb.Category, true, out var category))
            {
                newCategories.Add(new CategoryBudget
                {
                    Id = Guid.NewGuid(),
                    Category = category,
                    Amount = cb.Amount
                });
            }
        }

        if (isNew)
        {
            budget.CategoryBudgets = newCategories;
            await _budgetRepository.AddAsync(budget, cancellationToken);
            await _budgetRepository.SaveChangesAsync(cancellationToken);
        }
        else
        {
            await _budgetRepository.SyncBudgetCategoriesAsync(budget, newCategories, cancellationToken);
        }

        return MapToResponse(budget);
    }

    public async Task<BudgetSummaryResponse> GetBudgetSummaryAsync(Guid tripId, Guid userId, CancellationToken cancellationToken = default)
    {
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

        return summary;
    }

    private TripBudgetResponse MapToResponse(TripBudget budget)
    {
        return new TripBudgetResponse
        {
            Id = budget.Id,
            TripId = budget.TripId,
            TotalAmount = budget.TotalAmount,
            Currency = budget.Currency,
            CategoryBudgets = budget.CategoryBudgets.Select(cb => new CategoryBudgetResponse
            {
                Id = cb.Id,
                Category = cb.Category.ToString(),
                Amount = cb.Amount
            }).ToList()
        };
    }
}

public class ExpenseService : IExpenseService
{
    private readonly IExpenseRepository _expenseRepository;

    public ExpenseService(IExpenseRepository expenseRepository)
    {
        _expenseRepository = expenseRepository;
    }

    public async Task<ExpenseResponse> CreateExpenseAsync(CreateExpenseRequest request, Guid userId, CancellationToken cancellationToken = default)
    {
        if (!Enum.TryParse<ExpenseCategory>(request.Category, true, out var category))
        {
            throw new ArgumentException("Invalid expense category.");
        }

        var expense = new Expense
        {
            TripId = request.TripId,
            BookingId = request.BookingId,
            ActivityId = request.ActivityId,
            Title = request.Title,
            Description = request.Description,
            Category = category,
            Amount = request.Amount,
            Currency = request.Currency,
            ExchangeRate = request.ExchangeRate,
            PaidByUserId = userId,
            Date = request.Date,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _expenseRepository.AddAsync(expense, cancellationToken);
        await _expenseRepository.SaveChangesAsync(cancellationToken);

        return MapToResponse(expense);
    }

    public async Task<ExpenseResponse?> GetExpenseAsync(Guid id, Guid userId, CancellationToken cancellationToken = default)
    {
        var expense = await _expenseRepository.GetByIdAndUserIdAsync(id, userId, cancellationToken);
        return expense == null ? null : MapToResponse(expense);
    }

    public async Task<IEnumerable<ExpenseResponse>> GetTripExpensesAsync(Guid tripId, Guid userId, CancellationToken cancellationToken = default)
    {
        var expenses = await _expenseRepository.GetByUserIdAsync(userId, tripId, cancellationToken);
        return expenses.Select(MapToResponse);
    }

    public async Task<ExpenseResponse> UpdateExpenseAsync(Guid id, UpdateExpenseRequest request, Guid userId, CancellationToken cancellationToken = default)
    {
        var expense = await _expenseRepository.GetByIdAndUserIdAsync(id, userId, cancellationToken);
        if (expense == null)
        {
            throw new KeyNotFoundException("Expense not found.");
        }

        if (request.Title != null) expense.Title = request.Title;
        if (request.Description != null) expense.Description = request.Description;
        if (request.Amount.HasValue) expense.Amount = request.Amount.Value;
        if (request.Currency != null) expense.Currency = request.Currency;
        if (request.ExchangeRate.HasValue) expense.ExchangeRate = request.ExchangeRate.Value;
        if (request.Date.HasValue) expense.Date = request.Date.Value;
        
        if (request.Category != null && Enum.TryParse<ExpenseCategory>(request.Category, true, out var category))
        {
            expense.Category = category;
        }

        _expenseRepository.Update(expense);
        await _expenseRepository.SaveChangesAsync(cancellationToken);

        return MapToResponse(expense);
    }

    public async Task DeleteExpenseAsync(Guid id, Guid userId, CancellationToken cancellationToken = default)
    {
        var expense = await _expenseRepository.GetByIdAndUserIdAsync(id, userId, cancellationToken);
        if (expense == null)
        {
            throw new KeyNotFoundException("Expense not found.");
        }

        await _expenseRepository.DeleteAsync(id, cancellationToken);
        await _expenseRepository.SaveChangesAsync(cancellationToken);
    }

    private ExpenseResponse MapToResponse(Expense expense)
    {
        return new ExpenseResponse
        {
            Id = expense.Id,
            TripId = expense.TripId,
            BookingId = expense.BookingId,
            ActivityId = expense.ActivityId,
            Title = expense.Title,
            Description = expense.Description,
            Category = expense.Category.ToString(),
            Amount = expense.Amount,
            Currency = expense.Currency,
            ExchangeRate = expense.ExchangeRate,
            AmountInBaseCurrency = expense.Amount * expense.ExchangeRate,
            Date = expense.Date,
            CreatedAt = expense.CreatedAt
        };
    }
}
