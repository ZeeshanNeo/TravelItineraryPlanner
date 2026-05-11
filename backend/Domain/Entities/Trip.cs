using System;
using System.Collections.Generic;
using System.Text.Json;
using Domain.Common;

namespace Domain.Entities;

public class Trip : BaseEntity
{
    public Guid UserId { get; private set; }
    public string Title { get; private set; } = string.Empty;
    public string Destination { get; private set; } = string.Empty;
    public DateTime StartDate { get; private set; }
    public DateTime EndDate { get; private set; }
    public TravelType TravelType { get; private set; }
    public string? Purpose { get; private set; }
    public string? Notes { get; private set; }
    public JsonDocument? TravelCompanions { get; private set; }
    public bool IsArchived { get; private set; }
    public string? DestinationTimeZoneId { get; private set; } // e.g., "Pacific Standard Time"

    // Navigation properties
    public User User { get; set; } = null!;
    public ICollection<Itinerary> Itineraries { get; set; } = new List<Itinerary>();

    // Required for EF Core
    private Trip() { }

    public Trip(
        Guid userId, 
        string title, 
        string destination, 
        DateTime startDate, 
        DateTime endDate, 
        TravelType travelType,
        string? purpose = null,
        string? notes = null,
        JsonDocument? travelCompanions = null,
        string? destinationTimeZoneId = null)
    {
        if (endDate < startDate)
            throw new ArgumentException("End date cannot be before start date.");

        UserId = userId;
        Title = title;
        Destination = destination;
        StartDate = startDate;
        EndDate = endDate;
        TravelType = travelType;
        Purpose = purpose;
        Notes = notes;
        TravelCompanions = travelCompanions;
        DestinationTimeZoneId = destinationTimeZoneId;
        IsArchived = false;
        CreatedAt = DateTime.UtcNow;
    }

    public void UpdateDetails(
        string title, 
        string destination, 
        DateTime startDate, 
        DateTime endDate, 
        TravelType travelType,
        string? purpose,
        string? notes,
        JsonDocument? travelCompanions)
    {
        if (endDate < startDate)
            throw new ArgumentException("End date cannot be before start date.");

        Title = title;
        Destination = destination;
        StartDate = startDate;
        EndDate = endDate;
        TravelType = travelType;
        Purpose = purpose;
        Notes = notes;
        TravelCompanions = travelCompanions;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetArchiveStatus(bool isArchived)
    {
        IsArchived = isArchived;
        UpdatedAt = DateTime.UtcNow;
    }
}
