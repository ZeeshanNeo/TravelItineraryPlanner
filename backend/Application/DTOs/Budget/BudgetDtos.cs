using System;
using System.Collections.Generic;

namespace Application.DTOs.Budget;

public class TripBudgetResponse
{
    public Guid Id { get; set; }
    public Guid TripId { get; set; }
    public decimal TotalAmount { get; set; }
    public string Currency { get; set; } = "USD";
    public List<CategoryBudgetResponse> CategoryBudgets { get; set; } = new();
}

public class CategoryBudgetResponse
{
    public Guid Id { get; set; }
    public string Category { get; set; } = string.Empty;
    public decimal Amount { get; set; }
}

public class UpdateTripBudgetRequest
{
    public decimal TotalAmount { get; set; }
    public string Currency { get; set; } = "USD";
    public List<UpdateCategoryBudgetRequest> CategoryBudgets { get; set; } = new();
}

public class UpdateCategoryBudgetRequest
{
    public string Category { get; set; } = string.Empty;
    public decimal Amount { get; set; }
}

public class BudgetSummaryResponse
{
    public decimal TotalBudget { get; set; }
    public decimal TotalSpent { get; set; }
    public decimal RemainingBudget { get; set; }
    public string Currency { get; set; } = "USD";
    public List<CategorySummaryResponse> CategorySummaries { get; set; } = new();
}

public class CategorySummaryResponse
{
    public string Category { get; set; } = string.Empty;
    public decimal BudgetedAmount { get; set; }
    public decimal SpentAmount { get; set; }
    public decimal RemainingAmount { get; set; }
    public decimal PercentageSpent { get; set; }
}
