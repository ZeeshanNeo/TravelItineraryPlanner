using System;
using System.Collections.Generic;

namespace Domain.Entities;

public class TripBudget
{
    public Guid Id { get; set; }
    public Guid TripId { get; set; }
    public decimal TotalAmount { get; set; }
    public string Currency { get; set; } = "USD";
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navigation properties
    public Trip Trip { get; set; } = null!;
    public ICollection<CategoryBudget> CategoryBudgets { get; set; } = new List<CategoryBudget>();
}

public class CategoryBudget
{
    public Guid Id { get; set; }
    public Guid TripBudgetId { get; set; }
    public ExpenseCategory Category { get; set; }
    public decimal Amount { get; set; }

    // Navigation properties
    public TripBudget TripBudget { get; set; } = null!;
}
