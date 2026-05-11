using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Domain.Entities;
using Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Data.Repositories
{
    public class TripMemberRepository : ITripMemberRepository
    {
        private readonly ApplicationDbContext _context;
        public TripMemberRepository(ApplicationDbContext context) => _context = context;

        public async Task<TripMember> GetByIdAsync(Guid id) => await _context.TripMembers.FindAsync(id);
        
        public async Task<IEnumerable<TripMember>> GetByTripIdAsync(Guid tripId) =>
            await _context.TripMembers
                .Include(m => m.User)
                .Where(m => m.TripId == tripId)
                .ToListAsync();

        public async Task<TripMember> GetByTripAndUserAsync(Guid tripId, Guid userId) =>
            await _context.TripMembers
                .FirstOrDefaultAsync(m => m.TripId == tripId && m.UserId == userId);

        public async Task<TripMember> AddAsync(TripMember member)
        {
            _context.TripMembers.Add(member);
            await _context.SaveChangesAsync();
            return member;
        }

        public async Task UpdateAsync(TripMember member)
        {
            _context.TripMembers.Update(member);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(TripMember member)
        {
            _context.TripMembers.Remove(member);
            await _context.SaveChangesAsync();
        }

        public async Task SaveChangesAsync() => await _context.SaveChangesAsync();
    }

    public class CommentRepository : ICommentRepository
    {
        private readonly ApplicationDbContext _context;
        public CommentRepository(ApplicationDbContext context) => _context = context;

        public async Task<Comment> GetByIdAsync(Guid id) => await _context.Comments.FindAsync(id);

        public async Task<IEnumerable<Comment>> GetByTripIdAsync(Guid tripId) =>
            await _context.Comments
                .Include(c => c.User)
                .Where(c => c.TripId == tripId)
                .OrderByDescending(c => c.CreatedAt)
                .ToListAsync();

        public async Task<IEnumerable<Comment>> GetByActivityIdAsync(Guid activityId) =>
            await _context.Comments
                .Include(c => c.User)
                .Where(c => c.ActivityId == activityId)
                .OrderBy(c => c.CreatedAt)
                .ToListAsync();

        public async Task<Comment> AddAsync(Comment comment)
        {
            _context.Comments.Add(comment);
            await _context.SaveChangesAsync();
            return comment;
        }

        public async Task DeleteAsync(Comment comment)
        {
            _context.Comments.Remove(comment);
            await _context.SaveChangesAsync();
        }

        public async Task SaveChangesAsync() => await _context.SaveChangesAsync();
    }

    public class TaskRepository : ITaskRepository
    {
        private readonly ApplicationDbContext _context;
        public TaskRepository(ApplicationDbContext context) => _context = context;

        public async Task<TripTask> GetByIdAsync(Guid id) => await _context.TripTasks.FindAsync(id);

        public async Task<IEnumerable<TripTask>> GetByTripIdAsync(Guid tripId) =>
            await _context.TripTasks
                .Include(t => t.AssignedToUser)
                .Where(t => t.TripId == tripId)
                .OrderBy(t => t.DueDate)
                .ToListAsync();

        public async Task<TripTask> AddAsync(TripTask task)
        {
            _context.TripTasks.Add(task);
            await _context.SaveChangesAsync();
            return task;
        }

        public async Task UpdateAsync(TripTask task)
        {
            _context.TripTasks.Update(task);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(TripTask task)
        {
            _context.TripTasks.Remove(task);
            await _context.SaveChangesAsync();
        }

        public async Task SaveChangesAsync() => await _context.SaveChangesAsync();
    }

    public class ExpenseSplitRepository : IExpenseSplitRepository
    {
        private readonly ApplicationDbContext _context;
        public ExpenseSplitRepository(ApplicationDbContext context) => _context = context;

        public async Task<IEnumerable<ExpenseSplit>> GetByExpenseIdAsync(Guid expenseId) =>
            await _context.ExpenseSplits
                .Include(s => s.User)
                .Where(s => s.ExpenseId == expenseId)
                .ToListAsync();

        public async Task<IEnumerable<ExpenseSplit>> GetByUserIdAsync(Guid userId) =>
            await _context.ExpenseSplits
                .Include(s => s.Expense)
                .Where(s => s.UserId == userId)
                .ToListAsync();

        public async Task AddRangeAsync(IEnumerable<ExpenseSplit> splits)
        {
            _context.ExpenseSplits.AddRange(splits);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(ExpenseSplit split)
        {
            _context.ExpenseSplits.Update(split);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteByExpenseIdAsync(Guid expenseId)
        {
            var splits = await _context.ExpenseSplits.Where(s => s.ExpenseId == expenseId).ToListAsync();
            _context.ExpenseSplits.RemoveRange(splits);
            await _context.SaveChangesAsync();
        }

        public async Task SaveChangesAsync() => await _context.SaveChangesAsync();
    }
}
