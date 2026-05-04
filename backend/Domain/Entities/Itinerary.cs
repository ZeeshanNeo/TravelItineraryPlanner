using System;
using System.Collections.Generic;
using System.Text.Json;

namespace Domain.Entities;

public class Itinerary
{
    public Guid Id { get; set; }
    public Guid TripId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public int TotalDays { get; set; }
    public string? TimeZone { get; set; }
    public JsonDocument? Tags { get; set; } // JSON array of strings
    public bool IsPublic { get; set; }
    public bool IsArchived { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navigation properties
    public Trip Trip { get; set; } = null!;
    public ICollection<ItineraryDay> Days { get; set; } = new List<ItineraryDay>();
}