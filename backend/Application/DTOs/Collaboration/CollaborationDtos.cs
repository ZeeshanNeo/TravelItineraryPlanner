using System;
using System.Collections.Generic;
using Domain.Entities;

namespace Application.DTOs.Collaboration
{
    public class TripMemberDto
    {
        public Guid Id { get; set; }
        public Guid TripId { get; set; }
        public Guid UserId { get; set; }
        public string UserEmail { get; set; } = null!;
        public string UserName { get; set; } = null!;
        public string Role { get; set; } = null!;
        public DateTime JoinedAt { get; set; }
    }

    public class CommentDto
    {
        public Guid Id { get; set; }
        public Guid TripId { get; set; }
        public Guid UserId { get; set; }
        public string UserName { get; set; } = null!;
        public Guid? ActivityId { get; set; }
        public string Text { get; set; } = null!;
        public DateTime CreatedAt { get; set; }
    }

    public class TripTaskDto
    {
        public Guid Id { get; set; }
        public Guid TripId { get; set; }
        public Guid? AssignedToUserId { get; set; }
        public string? AssignedToUserName { get; set; }
        public string Title { get; set; } = null!;
        public string Description { get; set; } = null!;
        public string Status { get; set; } = null!;
        public DateTime? DueDate { get; set; }
    }

    public class ExpenseSplitDto
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public string UserName { get; set; } = null!;
        public decimal Amount { get; set; }
        public bool IsPaid { get; set; }
    }

    // Request Models
    public class InviteMemberRequest
    {
        public string Email { get; set; } = null!;
        public string Role { get; set; } = null!;
    }

    public class CreateCommentRequest
    {
        public Guid? ActivityId { get; set; }
        public string Text { get; set; } = null!;
    }

    public class CreateTaskRequest
    {
        public string Title { get; set; } = null!;
        public string Description { get; set; } = null!;
        public Guid? AssignedToUserId { get; set; }
        public DateTime? DueDate { get; set; }
    }

    public class ExpenseSplitRequest
    {
        public Guid UserId { get; set; }
        public decimal Amount { get; set; }
    }
}
