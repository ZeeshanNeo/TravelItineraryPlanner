using System;

namespace Domain.Entities
{
    public class EmergencyContact
    {
        public Guid Id { get; set; }
        public Guid TripId { get; set; }
        public string Name { get; set; }
        public string Relationship { get; set; }
        public string PhoneNumber { get; set; }
        public string Email { get; set; }
        public bool IsLocal { get; set; }
        public string Notes { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

        // Navigation properties
        public Trip Trip { get; set; }
    }
}
