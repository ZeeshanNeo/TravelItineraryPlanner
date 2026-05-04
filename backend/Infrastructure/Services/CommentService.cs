using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.DTOs.Collaboration;
using Application.Interfaces;
using Domain.Entities;
using Domain.Interfaces;

namespace Infrastructure.Services
{
    public class CommentService : ICommentService
    {
        private readonly ICommentRepository _commentRepo;

        public CommentService(ICommentRepository commentRepo)
        {
            _commentRepo = commentRepo;
        }

        public async Task<CommentDto> AddCommentAsync(Guid tripId, Guid userId, CreateCommentRequest request)
        {
            var comment = new Comment
            {
                Id = Guid.NewGuid(),
                TripId = tripId,
                UserId = userId,
                ActivityId = request.ActivityId,
                Text = request.Text,
                CreatedAt = DateTime.UtcNow
            };

            await _commentRepo.AddAsync(comment);
            return MapToDto(comment);
        }

        public async Task<IEnumerable<CommentDto>> GetTripCommentsAsync(Guid tripId)
        {
            var comments = await _commentRepo.GetByTripIdAsync(tripId);
            return comments.Select(MapToDto);
        }

        public async Task<IEnumerable<CommentDto>> GetActivityCommentsAsync(Guid activityId)
        {
            var comments = await _commentRepo.GetByActivityIdAsync(activityId);
            return comments.Select(MapToDto);
        }

        public async Task DeleteCommentAsync(Guid commentId, Guid userId)
        {
            var comment = await _commentRepo.GetByIdAsync(commentId);
            if (comment != null && comment.UserId == userId)
            {
                await _commentRepo.DeleteAsync(comment);
            }
        }

        private CommentDto MapToDto(Comment c) => new CommentDto
        {
            Id = c.Id,
            TripId = c.TripId,
            UserId = c.UserId,
            UserName = c.User != null ? $"{c.User.FirstName} {c.User.LastName}" : "Anonymous",
            ActivityId = c.ActivityId,
            Text = c.Text,
            CreatedAt = c.CreatedAt
        };
    }
}
