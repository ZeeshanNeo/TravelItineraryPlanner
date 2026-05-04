using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Application.DTOs.Budget;
using Application.DTOs.Expense;

namespace Application.Services;

public interface IBudgetService
{
    Task<TripBudgetResponse> GetBudgetAsync(Guid tripId, Guid userId, CancellationToken cancellationToken = default);
    Task<TripBudgetResponse> UpdateBudgetAsync(Guid tripId, UpdateTripBudgetRequest request, Guid userId, CancellationToken cancellationToken = default);
    Task<BudgetSummaryResponse> GetBudgetSummaryAsync(Guid tripId, Guid userId, CancellationToken cancellationToken = default);
}

public interface IExpenseService
{
    Task<ExpenseResponse> CreateExpenseAsync(CreateExpenseRequest request, Guid userId, CancellationToken cancellationToken = default);
    Task<ExpenseResponse?> GetExpenseAsync(Guid id, Guid userId, CancellationToken cancellationToken = default);
    Task<IEnumerable<ExpenseResponse>> GetTripExpensesAsync(Guid tripId, Guid userId, CancellationToken cancellationToken = default);
    Task<ExpenseResponse> UpdateExpenseAsync(Guid id, UpdateExpenseRequest request, Guid userId, CancellationToken cancellationToken = default);
    Task DeleteExpenseAsync(Guid id, Guid userId, CancellationToken cancellationToken = default);
}
