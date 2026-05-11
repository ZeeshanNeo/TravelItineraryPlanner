using System;
using Domain.Common;

namespace Domain.Entities
{
    public class Comment : BaseEntity
    {
        public Guid TripId { get; private set; }
        public Guid UserId { get; private set; }
        public Guid? ActivityId { get; private set; }
        public string Text { get; private set; }

        // Navigation properties
        public virtual Trip Trip { get; private set; } = null!;
        public virtual User User { get; private set; } = null!;
        public virtual Activity? Activity { get; private set; }

        private Comment() { } // For EF

        public Comment(Guid tripId, Guid userId, string text, Guid? activityId = null)
        {
            if (tripId == Guid.Empty) throw new ArgumentException("TripId is required.", nameof(tripId));
            if (userId == Guid.Empty) throw new ArgumentException("UserId is required.", nameof(userId));
            if (string.IsNullOrWhiteSpace(text)) throw new ArgumentException("Comment text is required.", nameof(text));

            Id = Guid.NewGuid();
            TripId = tripId;
            UserId = userId;
            Text = text;
            ActivityId = activityId;
            CreatedAt = DateTime.UtcNow;
            UpdatedAt = DateTime.UtcNow;
        }

        public void UpdateText(string text)
        {
            if (string.IsNullOrWhiteSpace(text)) throw new ArgumentException("Comment text is required.", nameof(text));
            Text = text;
            UpdatedAt = DateTime.UtcNow;
        }
    }
}
