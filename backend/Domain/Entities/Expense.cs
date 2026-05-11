using System;
using System.Collections.Generic;
using System.Linq;
using Domain.Common;

namespace Domain.Entities;

public class Expense : BaseEntity
{
    public Guid TripId { get; private set; }
    public Guid? BookingId { get; private set; }
    public Guid? ActivityId { get; private set; }
    public string Title { get; private set; } = string.Empty;
    public string? Description { get; private set; }
    public ExpenseCategory Category { get; private set; }
    public decimal Amount { get; private set; }
    public string Currency { get; private set; } = string.Empty;
    public decimal ExchangeRate { get; private set; }
    public Guid PaidByUserId { get; private set; }
    public DateTime Date { get; private set; }

    // Navigation properties
    public Trip Trip { get; private set; } = null!;
    public User PaidByUser { get; private set; } = null!;
    public Booking? Booking { get; private set; }
    public Activity? Activity { get; private set; }
    private readonly List<ExpenseSplit> _splits = new();
    public virtual IReadOnlyCollection<ExpenseSplit> Splits => _splits.AsReadOnly();

    private Expense() { } // For EF

    public Expense(
        Guid tripId,
        string title,
        ExpenseCategory category,
        decimal amount,
        string currency,
        Guid paidByUserId,
        DateTime date,
        string? description = null,
        decimal exchangeRate = 1.0m,
        Guid? bookingId = null,
        Guid? activityId = null)
    {
        if (tripId == Guid.Empty) throw new ArgumentException("TripId is required.", nameof(tripId));
        if (string.IsNullOrWhiteSpace(title)) throw new ArgumentException("Title is required.", nameof(title));
        if (amount < 0) throw new ArgumentException("Amount cannot be negative.", nameof(amount));
        if (string.IsNullOrWhiteSpace(currency)) throw new ArgumentException("Currency is required.", nameof(currency));
        if (paidByUserId == Guid.Empty) throw new ArgumentException("PaidByUserId is required.", nameof(paidByUserId));

        Id = Guid.NewGuid();
        TripId = tripId;
        Title = title;
        Category = category;
        Amount = amount;
        Currency = currency;
        PaidByUserId = paidByUserId;
        Date = date;
        Description = description;
        ExchangeRate = exchangeRate;
        BookingId = bookingId;
        ActivityId = activityId;
        CreatedAt = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
    }

    public void UpdateDetails(
        string title,
        ExpenseCategory category,
        decimal amount,
        string currency,
        DateTime date,
        string? description = null,
        decimal exchangeRate = 1.0m,
        Guid? bookingId = null,
        Guid? activityId = null)
    {
        if (string.IsNullOrWhiteSpace(title)) throw new ArgumentException("Title is required.", nameof(title));
        if (amount < 0) throw new ArgumentException("Amount cannot be negative.", nameof(amount));
        if (string.IsNullOrWhiteSpace(currency)) throw new ArgumentException("Currency is required.", nameof(currency));

        Title = title;
        Category = category;
        Amount = amount;
        Currency = currency;
        Date = date;
        Description = description;
        ExchangeRate = exchangeRate;
        BookingId = bookingId;
        ActivityId = activityId;
        UpdatedAt = DateTime.UtcNow;
    }

    public void AddSplit(Guid userId, decimal amount)
    {
        if (userId == Guid.Empty) throw new ArgumentException("UserId is required.", nameof(userId));
        if (amount < 0) throw new ArgumentException("Split amount cannot be negative.", nameof(amount));

        var existingSplit = _splits.FirstOrDefault(s => s.UserId == userId);
        if (existingSplit != null)
        {
            existingSplit.UpdateAmount(amount);
        }
        else
        {
            _splits.Add(new ExpenseSplit(Id, userId, amount));
        }
        UpdatedAt = DateTime.UtcNow;
    }

    public void RemoveSplit(Guid userId)
    {
        var split = _splits.FirstOrDefault(s => s.UserId == userId);
        if (split != null)
        {
            _splits.Remove(split);
            UpdatedAt = DateTime.UtcNow;
        }
    }

    public void ClearSplits()
    {
        _splits.Clear();
        UpdatedAt = DateTime.UtcNow;
    }
}
