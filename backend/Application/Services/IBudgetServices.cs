using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Application.Common.Models;
using Application.DTOs.Budget;
using Application.DTOs.Expense;

namespace Application.Services;

public interface IBudgetService
{
    Task<Result<TripBudgetResponse>> GetBudgetAsync(Guid tripId, Guid userId, CancellationToken cancellationToken = default);
    Task<Result<TripBudgetResponse>> UpdateBudgetAsync(Guid tripId, UpdateTripBudgetRequest request, Guid userId, CancellationToken cancellationToken = default);
    Task<Result<BudgetSummaryResponse>> GetBudgetSummaryAsync(Guid tripId, Guid userId, CancellationToken cancellationToken = default);
}

public interface IExpenseService
{
    Task<Result<ExpenseResponse>> CreateExpenseAsync(CreateExpenseRequest request, Guid userId, CancellationToken cancellationToken = default);
    Task<Result<ExpenseResponse>> GetExpenseAsync(Guid id, Guid userId, CancellationToken cancellationToken = default);
    Task<Result<IEnumerable<ExpenseResponse>>> GetTripExpensesAsync(Guid tripId, Guid userId, CancellationToken cancellationToken = default);
    Task<Result<ExpenseResponse>> UpdateExpenseAsync(Guid id, UpdateExpenseRequest request, Guid userId, CancellationToken cancellationToken = default);
    Task<Result> DeleteExpenseAsync(Guid id, Guid userId, CancellationToken cancellationToken = default);
}
