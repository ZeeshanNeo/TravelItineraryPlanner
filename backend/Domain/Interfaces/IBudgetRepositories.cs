using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Domain.Entities;

namespace Domain.Interfaces;

public interface IExpenseRepository
{
    Task<Expense?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<Expense?> GetByIdAndUserIdAsync(Guid id, Guid userId, CancellationToken cancellationToken = default);
    Task<IEnumerable<Expense>> GetByTripIdAsync(Guid tripId, CancellationToken cancellationToken = default);
    Task<IEnumerable<Expense>> GetByUserIdAsync(Guid userId, Guid? tripId = null, CancellationToken cancellationToken = default);
    Task AddAsync(Expense expense, CancellationToken cancellationToken = default);
    void Update(Expense expense);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
    Task SaveChangesAsync(CancellationToken cancellationToken = default);
}

public interface ITripBudgetRepository
{
    Task<TripBudget?> GetByTripIdAsync(Guid tripId, CancellationToken cancellationToken = default);
    Task<TripBudget?> GetByTripIdAndUserIdAsync(Guid tripId, Guid userId, CancellationToken cancellationToken = default);
    Task AddAsync(TripBudget budget, CancellationToken cancellationToken = default);
    void Update(TripBudget budget);
    Task SyncBudgetCategoriesAsync(TripBudget budget, IEnumerable<CategoryBudget> newCategories, CancellationToken cancellationToken = default);
    Task SaveChangesAsync(CancellationToken cancellationToken = default);
}
