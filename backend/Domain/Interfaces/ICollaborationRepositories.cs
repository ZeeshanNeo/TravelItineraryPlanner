using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Domain.Entities;

namespace Domain.Interfaces
{
    public interface ITripMemberRepository
    {
        Task<TripMember> GetByIdAsync(Guid id);
        Task<IEnumerable<TripMember>> GetByTripIdAsync(Guid tripId);
        Task<TripMember> GetByTripAndUserAsync(Guid tripId, Guid userId);
        Task<TripMember> AddAsync(TripMember member);
        Task UpdateAsync(TripMember member);
        Task DeleteAsync(TripMember member);
        Task SaveChangesAsync();
    }

    public interface ICommentRepository
    {
        Task<Comment> GetByIdAsync(Guid id);
        Task<IEnumerable<Comment>> GetByTripIdAsync(Guid tripId);
        Task<IEnumerable<Comment>> GetByActivityIdAsync(Guid activityId);
        Task<Comment> AddAsync(Comment comment);
        Task DeleteAsync(Comment comment);
        Task SaveChangesAsync();
    }

    public interface ITaskRepository
    {
        Task<TripTask> GetByIdAsync(Guid id);
        Task<IEnumerable<TripTask>> GetByTripIdAsync(Guid tripId);
        Task<TripTask> AddAsync(TripTask task);
        Task UpdateAsync(TripTask task);
        Task DeleteAsync(TripTask task);
        Task SaveChangesAsync();
    }

    public interface IExpenseSplitRepository
    {
        Task<IEnumerable<ExpenseSplit>> GetByExpenseIdAsync(Guid expenseId);
        Task<IEnumerable<ExpenseSplit>> GetByUserIdAsync(Guid userId);
        Task AddRangeAsync(IEnumerable<ExpenseSplit> splits);
        Task UpdateAsync(ExpenseSplit split);
        Task DeleteByExpenseIdAsync(Guid expenseId);
        Task SaveChangesAsync();
    }
}
