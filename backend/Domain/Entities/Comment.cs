using System;

namespace Domain.Entities
{
    public class Comment
    {
        public Guid Id { get; set; }
        public Guid TripId { get; set; }
        public Guid UserId { get; set; }
        public Guid? ActivityId { get; set; } // Can be linked to a specific activity
        public string Text { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }

        public virtual Trip Trip { get; set; }
        public virtual User User { get; set; }
        public virtual Activity Activity { get; set; }
    }
}
