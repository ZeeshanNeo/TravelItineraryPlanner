using System;

namespace Domain.Entities
{
    public enum TripTaskStatus
    {
        ToDo,
        InProgress,
        Completed,
        Cancelled
    }

    public class TripTask
    {
        public Guid Id { get; set; }
        public Guid TripId { get; set; }
        public Guid? AssignedToUserId { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public TripTaskStatus Status { get; set; }
        public DateTime? DueDate { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

        public virtual Trip Trip { get; set; }
        public virtual User AssignedToUser { get; set; }
    }
}
