using System;

namespace Domain.Entities
{
    public class ExpenseSplit
    {
        public Guid Id { get; set; }
        public Guid ExpenseId { get; set; }
        public Guid UserId { get; set; }
        public decimal Amount { get; set; } // The amount this user owes
        public bool IsPaid { get; set; }

        public virtual Expense Expense { get; set; }
        public virtual User User { get; set; }
    }
}
