using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Domain.Entities;
using Domain.Interfaces;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Data.Repositories;

public class ExpenseRepository : IExpenseRepository
{
    private readonly ApplicationDbContext _context;

    public ExpenseRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Expense?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Expenses
            .Include(e => e.Booking)
            .Include(e => e.Activity)
            .FirstOrDefaultAsync(e => e.Id == id, cancellationToken);
    }

    public async Task<Expense?> GetByIdAndUserIdAsync(Guid id, Guid userId, CancellationToken cancellationToken = default)
    {
        return await _context.Expenses
            .Include(e => e.Booking)
            .Include(e => e.Activity)
            .Include(e => e.Trip)
            .FirstOrDefaultAsync(e => e.Id == id && e.Trip.UserId == userId, cancellationToken);
    }

    public async Task<IEnumerable<Expense>> GetByTripIdAsync(Guid tripId, CancellationToken cancellationToken = default)
    {
        return await _context.Expenses
            .Where(e => e.TripId == tripId)
            .OrderByDescending(e => e.Date)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Expense>> GetByUserIdAsync(Guid userId, Guid? tripId = null, CancellationToken cancellationToken = default)
    {
        var query = _context.Expenses
            .Include(e => e.Trip)
            .Where(e => e.Trip.UserId == userId);

        if (tripId.HasValue)
        {
            query = query.Where(e => e.TripId == tripId.Value);
        }

        return await query.OrderByDescending(e => e.Date).ToListAsync(cancellationToken);
    }

    public async Task AddAsync(Expense expense, CancellationToken cancellationToken = default)
    {
        await _context.Expenses.AddAsync(expense, cancellationToken);
    }

    public void Update(Expense expense)
    {
        expense.UpdatedAt = DateTime.UtcNow;
        _context.Expenses.Update(expense);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var expense = await _context.Expenses.FindAsync(new object[] { id }, cancellationToken);
        if (expense != null)
        {
            _context.Expenses.Remove(expense);
        }
    }

    public async Task SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        await _context.SaveChangesAsync(cancellationToken);
    }
}

public class TripBudgetRepository : ITripBudgetRepository
{
    private readonly ApplicationDbContext _context;

    public TripBudgetRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<TripBudget?> GetByTripIdAsync(Guid tripId, CancellationToken cancellationToken = default)
    {
        return await _context.TripBudgets
            .Include(b => b.CategoryBudgets)
            .FirstOrDefaultAsync(b => b.TripId == tripId, cancellationToken);
    }

    public async Task<TripBudget?> GetByTripIdAndUserIdAsync(Guid tripId, Guid userId, CancellationToken cancellationToken = default)
    {
        return await _context.TripBudgets
            .Include(b => b.CategoryBudgets)
            .Include(b => b.Trip)
            .FirstOrDefaultAsync(b => b.TripId == tripId && b.Trip.UserId == userId, cancellationToken);
    }

    public async Task AddAsync(TripBudget budget, CancellationToken cancellationToken = default)
    {
        await _context.TripBudgets.AddAsync(budget, cancellationToken);
    }

    public void Update(TripBudget budget)
    {
        budget.UpdatedAt = DateTime.UtcNow;
        // EF Core will track changes automatically since the entity was loaded from the context
    }

    public async Task SyncBudgetCategoriesAsync(TripBudget budget, IEnumerable<CategoryBudget> newCategories, CancellationToken cancellationToken = default)
    {
        // 1. Clear existing categories directly in DB
        await _context.CategoryBudgets
            .Where(cb => cb.TripBudgetId == budget.Id)
            .ExecuteDeleteAsync(cancellationToken);

        // 2. Clear change tracker to ensure no stale state
        _context.ChangeTracker.Clear();

        // 3. Update the budget entity itself
        budget.UpdatedAt = DateTime.UtcNow;
        _context.TripBudgets.Update(budget);

        // 4. Add the new categories
        foreach (var category in newCategories)
        {
            // Since TripBudgetId is private set, we should ideally use a constructor.
            // But if we already have the objects, we might need a workaround or better architecture.
            // For now, I'll update the SyncBudgetCategoriesAsync to accept a more flexible input if possible, 
            // but let's try to fix it by using the constructor if they are being recreated.
            var newCategory = new CategoryBudget(budget.Id, category.Category, category.Amount);
            await _context.CategoryBudgets.AddAsync(newCategory, cancellationToken);
        }

        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        await _context.SaveChangesAsync(cancellationToken);
    }
}
