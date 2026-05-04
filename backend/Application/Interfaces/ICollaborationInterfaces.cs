using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Application.DTOs.Collaboration;

namespace Application.Interfaces
{
    public interface ICollaborationService
    {
        Task<TripMemberDto> InviteMemberAsync(Guid tripId, InviteMemberRequest request);
        Task<IEnumerable<TripMemberDto>> GetTripMembersAsync(Guid tripId);
        Task UpdateMemberRoleAsync(Guid memberId, string role);
        Task RemoveMemberAsync(Guid memberId);
        Task<bool> HasPermissionAsync(Guid tripId, Guid userId, string requiredRole);
    }

    public interface ICommentService
    {
        Task<CommentDto> AddCommentAsync(Guid tripId, Guid userId, CreateCommentRequest request);
        Task<IEnumerable<CommentDto>> GetTripCommentsAsync(Guid tripId);
        Task<IEnumerable<CommentDto>> GetActivityCommentsAsync(Guid activityId);
        Task DeleteCommentAsync(Guid commentId, Guid userId);
    }

    public interface ITaskService
    {
        Task<TripTaskDto> CreateTaskAsync(Guid tripId, CreateTaskRequest request);
        Task<IEnumerable<TripTaskDto>> GetTripTasksAsync(Guid tripId);
        Task<TripTaskDto> UpdateTaskStatusAsync(Guid taskId, string status);
        Task<TripTaskDto> AssignTaskAsync(Guid taskId, Guid? userId);
        Task DeleteTaskAsync(Guid taskId);
    }

    public interface ISharedExpenseService
    {
        Task SplitExpenseAsync(Guid expenseId, List<ExpenseSplitRequest> splits);
        Task<IEnumerable<ExpenseSplitDto>> GetExpenseSplitsAsync(Guid expenseId);
        Task MarkSplitAsPaidAsync(Guid splitId);
        Task<object> GetTripBalancesAsync(Guid tripId);
    }
}
