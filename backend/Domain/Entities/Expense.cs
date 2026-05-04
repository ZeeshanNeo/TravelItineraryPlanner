using System;

namespace Domain.Entities;

public class Expense
{
    public Guid Id { get; set; }
    public Guid TripId { get; set; }
    public Guid? BookingId { get; set; }
    public Guid? ActivityId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public ExpenseCategory Category { get; set; }
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "USD";
    public decimal ExchangeRate { get; set; } = 1.0m;
    public Guid PaidByUserId { get; set; }
    public DateTime Date { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navigation properties
    public Trip Trip { get; set; } = null!;
    public User PaidByUser { get; set; } = null!;
    public Booking? Booking { get; set; }
    public Activity? Activity { get; set; }
    public virtual ICollection<ExpenseSplit> Splits { get; set; } = new List<ExpenseSplit>();
}
