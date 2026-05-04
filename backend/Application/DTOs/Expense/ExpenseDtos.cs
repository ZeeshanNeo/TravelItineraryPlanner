using System;

namespace Application.DTOs.Expense;

public class ExpenseResponse
{
    public Guid Id { get; set; }
    public Guid TripId { get; set; }
    public Guid? BookingId { get; set; }
    public Guid? ActivityId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Category { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "USD";
    public decimal ExchangeRate { get; set; }
    public decimal AmountInBaseCurrency { get; set; }
    public DateTime Date { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateExpenseRequest
{
    public Guid TripId { get; set; }
    public Guid? BookingId { get; set; }
    public Guid? ActivityId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Category { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "USD";
    public decimal ExchangeRate { get; set; } = 1.0m;
    public DateTime Date { get; set; }
}

public class UpdateExpenseRequest
{
    public string? Title { get; set; }
    public string? Description { get; set; }
    public string? Category { get; set; }
    public decimal? Amount { get; set; }
    public string? Currency { get; set; }
    public decimal? ExchangeRate { get; set; }
    public DateTime? Date { get; set; }
}
