using System;

namespace Application.DTOs.TravelDocs
{
    public class EmergencyContactDto
    {
        public Guid Id { get; set; }
        public Guid TripId { get; set; }
        public string Name { get; set; }
        public string Relationship { get; set; }
        public string PhoneNumber { get; set; }
        public string Email { get; set; }
        public bool IsLocal { get; set; }
        public string Notes { get; set; }
    }

    public class CreateEmergencyContactRequest
    {
        public string Name { get; set; }
        public string Relationship { get; set; }
        public string PhoneNumber { get; set; }
        public string Email { get; set; }
        public bool IsLocal { get; set; }
        public string Notes { get; set; }
    }
}
