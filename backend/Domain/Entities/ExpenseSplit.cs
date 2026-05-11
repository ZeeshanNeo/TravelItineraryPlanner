using System;
using Domain.Common;

namespace Domain.Entities;

public class ExpenseSplit : BaseEntity
{
    public Guid ExpenseId { get; private set; }
    public Guid UserId { get; private set; }
    public decimal Amount { get; private set; }
    public bool IsPaid { get; private set; }

    public virtual Expense Expense { get; private set; } = null!;
    public virtual User User { get; private set; } = null!;

    private ExpenseSplit() { } // For EF

    public ExpenseSplit(Guid expenseId, Guid userId, decimal amount)
    {
        if (expenseId == Guid.Empty) throw new ArgumentException("ExpenseId is required.", nameof(expenseId));
        if (userId == Guid.Empty) throw new ArgumentException("UserId is required.", nameof(userId));
        if (amount < 0) throw new ArgumentException("Amount cannot be negative.", nameof(amount));

        Id = Guid.NewGuid();
        ExpenseId = expenseId;
        UserId = userId;
        Amount = amount;
        IsPaid = false;
        CreatedAt = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
    }

    public void UpdateAmount(decimal amount)
    {
        if (amount < 0) throw new ArgumentException("Amount cannot be negative.", nameof(amount));
        Amount = amount;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetPaidStatus(bool isPaid)
    {
        IsPaid = isPaid;
        UpdatedAt = DateTime.UtcNow;
    }
}
