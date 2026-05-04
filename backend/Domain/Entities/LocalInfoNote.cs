using System;

namespace Domain.Entities
{
    public class LocalInfoNote
    {
        public Guid Id { get; set; }
        public Guid TripId { get; set; }
        public string Title { get; set; }
        public LocalInfoCategory Category { get; set; }
        public string Content { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

        // Navigation properties
        public Trip Trip { get; set; }
    }
}
