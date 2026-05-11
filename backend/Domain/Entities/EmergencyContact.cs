using System;
using Domain.Common;

namespace Domain.Entities;

public class EmergencyContact : BaseEntity
{
    public Guid TripId { get; private set; }
    public string Name { get; private set; }
    public string Relationship { get; private set; }
    public string PhoneNumber { get; private set; }
    public string Email { get; private set; }
    public bool IsLocal { get; private set; }
    public string Notes { get; private set; }

    // Navigation properties
    public Trip Trip { get; private set; } = null!;

    private EmergencyContact() { } // For EF

    public EmergencyContact(
        Guid tripId,
        string name,
        string relationship,
        string phoneNumber,
        string email,
        bool isLocal,
        string notes)
    {
        if (tripId == Guid.Empty) throw new ArgumentException("TripId is required.", nameof(tripId));
        if (string.IsNullOrWhiteSpace(name)) throw new ArgumentException("Name is required.", nameof(name));

        Id = Guid.NewGuid();
        TripId = tripId;
        Name = name;
        Relationship = relationship;
        PhoneNumber = phoneNumber;
        Email = email;
        IsLocal = isLocal;
        Notes = notes;
        CreatedAt = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
    }

    public void UpdateDetails(
        string name,
        string relationship,
        string phoneNumber,
        string email,
        bool isLocal,
        string notes)
    {
        if (string.IsNullOrWhiteSpace(name)) throw new ArgumentException("Name is required.", nameof(name));

        Name = name;
        Relationship = relationship;
        PhoneNumber = phoneNumber;
        Email = email;
        IsLocal = isLocal;
        Notes = notes;
        UpdatedAt = DateTime.UtcNow;
    }
}
