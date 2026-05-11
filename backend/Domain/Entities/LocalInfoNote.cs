using System;
using Domain.Common;

namespace Domain.Entities
{
    public class LocalInfoNote : BaseEntity
    {
        public Guid TripId { get; private set; }
        public string Title { get; private set; }
        public LocalInfoCategory Category { get; private set; }
        public string Content { get; private set; }

        // Navigation properties
        public Trip Trip { get; private set; } = null!;

        private LocalInfoNote() { } // For EF

        public LocalInfoNote(Guid tripId, string title, LocalInfoCategory category, string content)
        {
            if (tripId == Guid.Empty) throw new ArgumentException("TripId is required.", nameof(tripId));
            if (string.IsNullOrWhiteSpace(title)) throw new ArgumentException("Title is required.", nameof(title));

            Id = Guid.NewGuid();
            TripId = tripId;
            Title = title;
            Category = category;
            Content = content;
            CreatedAt = DateTime.UtcNow;
            UpdatedAt = DateTime.UtcNow;
        }

        public void UpdateDetails(string title, LocalInfoCategory category, string content)
        {
            if (string.IsNullOrWhiteSpace(title)) throw new ArgumentException("Title is required.", nameof(title));

            Title = title;
            Category = category;
            Content = content;
            UpdatedAt = DateTime.UtcNow;
        }
    }
}
