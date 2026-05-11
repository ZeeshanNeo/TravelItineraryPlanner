using System;
using System.Collections.Generic;
using System.Text.Json;
using Domain.Common;

namespace Domain.Entities;

public class Itinerary : BaseEntity
{
    public Guid TripId { get; private set; }
    public string Title { get; private set; } = string.Empty;
    public string? Description { get; private set; }
    public DateTime StartDate { get; private set; }
    public DateTime EndDate { get; private set; }
    public int TotalDays { get; private set; }
    public string? TimeZone { get; private set; }
    public JsonDocument? Tags { get; private set; } // JSON array of strings
    public bool IsPublic { get; private set; }
    public bool IsArchived { get; private set; }
    public string? ShareToken { get; private set; }
    public DateTime? ShareTokenExpiresAt { get; private set; }

    // Navigation properties
    public Trip Trip { get; set; } = null!;
    public ICollection<ItineraryDay> Days { get; set; } = new List<ItineraryDay>();

    // Required for EF Core
    private Itinerary() { }

    public Itinerary(
        Guid tripId,
        string title,
        string? description,
        DateTime startDate,
        DateTime endDate,
        string? timeZone,
        JsonDocument? tags,
        bool isPublic)
    {
        if (endDate < startDate)
            throw new ArgumentException("End date cannot be before start date.");

        TripId = tripId;
        Title = title;
        Description = description;
        StartDate = startDate;
        EndDate = endDate;
        TimeZone = timeZone;
        Tags = tags;
        IsPublic = isPublic;
        IsArchived = false;
        TotalDays = (endDate - startDate).Days + 1;
        CreatedAt = DateTime.UtcNow;
    }

    public void UpdateDetails(
        string title,
        string? description,
        DateTime startDate,
        DateTime endDate,
        string? timeZone,
        JsonDocument? tags,
        bool? isPublic)
    {
        if (endDate < startDate)
            throw new ArgumentException("End date cannot be before start date.");

        Title = title;
        Description = description;
        StartDate = startDate;
        EndDate = endDate;
        TimeZone = timeZone;
        Tags = tags;
        
        if (isPublic.HasValue)
            IsPublic = isPublic.Value;

        TotalDays = (endDate - startDate).Days + 1;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetArchiveStatus(bool isArchived)
    {
        IsArchived = isArchived;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetPublicStatus(bool isPublic)
    {
        IsPublic = isPublic;
        UpdatedAt = DateTime.UtcNow;
    }

    public void GenerateShareToken(int expiryDays = 30)
    {
        ShareToken = Guid.NewGuid().ToString("N");
        ShareTokenExpiresAt = DateTime.UtcNow.AddDays(expiryDays);
        IsPublic = true;
        UpdatedAt = DateTime.UtcNow;
    }

    public void RevokeShareToken()
    {
        ShareToken = null;
        ShareTokenExpiresAt = null;
        UpdatedAt = DateTime.UtcNow;
    }
}