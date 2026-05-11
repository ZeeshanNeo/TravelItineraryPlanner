using System;

namespace Domain.Entities
{
    public enum TripRole
    {
        Owner,
        Collaborator,
        Viewer
    }

    public class TripMember
    {
        public Guid Id { get; set; }
        public Guid TripId { get; set; }
        public Guid UserId { get; set; }
        public TripRole Role { get; set; }
        public DateTime JoinedAt { get; set; }

        public virtual Trip Trip { get; set; } = null!;
        public virtual User User { get; set; } = null!;
    }
}
