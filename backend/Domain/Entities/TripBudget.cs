using System;
using System.Collections.Generic;
using System.Linq;
using Domain.Common;

namespace Domain.Entities;

public class TripBudget : BaseEntity
{
    public Guid TripId { get; private set; }
    public decimal TotalAmount { get; private set; }
    public string Currency { get; private set; } = null!;

    // Navigation properties
    public Trip Trip { get; private set; } = null!;
    private readonly List<CategoryBudget> _categoryBudgets = new();
    public virtual IReadOnlyCollection<CategoryBudget> CategoryBudgets => _categoryBudgets.AsReadOnly();

    private TripBudget() { } // For EF

    public TripBudget(Guid tripId, decimal totalAmount, string currency)
    {
        if (tripId == Guid.Empty) throw new ArgumentException("TripId is required.", nameof(tripId));
        if (totalAmount < 0) throw new ArgumentException("Total amount cannot be negative.", nameof(totalAmount));
        if (string.IsNullOrWhiteSpace(currency)) throw new ArgumentException("Currency is required.", nameof(currency));

        Id = Guid.NewGuid();
        TripId = tripId;
        TotalAmount = totalAmount;
        Currency = currency;
        CreatedAt = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
    }

    public void UpdateBudget(decimal totalAmount, string currency)
    {
        if (totalAmount < 0) throw new ArgumentException("Total amount cannot be negative.", nameof(totalAmount));
        if (string.IsNullOrWhiteSpace(currency)) throw new ArgumentException("Currency is required.", nameof(currency));

        TotalAmount = totalAmount;
        Currency = currency;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SyncCategories(IEnumerable<(ExpenseCategory Category, decimal Amount)> categories)
    {
        _categoryBudgets.Clear();
        foreach (var (category, amount) in categories)
        {
            _categoryBudgets.Add(new CategoryBudget(Id, category, amount));
        }
        UpdatedAt = DateTime.UtcNow;
    }
}

public class CategoryBudget : BaseEntity
{
    public Guid TripBudgetId { get; private set; }
    public ExpenseCategory Category { get; private set; }
    public decimal Amount { get; private set; }

    // Navigation properties
    public TripBudget TripBudget { get; private set; } = null!;

    private CategoryBudget() { } // For EF

    public CategoryBudget(Guid tripBudgetId, ExpenseCategory category, decimal amount)
    {
        if (tripBudgetId == Guid.Empty) throw new ArgumentException("TripBudgetId is required.", nameof(tripBudgetId));
        if (amount < 0) throw new ArgumentException("Amount cannot be negative.", nameof(amount));

        Id = Guid.NewGuid();
        TripBudgetId = tripBudgetId;
        Category = category;
        Amount = amount;
        CreatedAt = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
    }

    public void UpdateAmount(decimal amount)
    {
        if (amount < 0) throw new ArgumentException("Amount cannot be negative.", nameof(amount));
        Amount = amount;
        UpdatedAt = DateTime.UtcNow;
    }
}
