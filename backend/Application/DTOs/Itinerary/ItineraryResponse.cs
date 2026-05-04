using System;
using System.Collections.Generic;
using Application.DTOs.ItineraryDay;

namespace Application.DTOs.Itinerary;

public class ItineraryResponse
{
    public Guid Id { get; set; }
    public Guid TripId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public int TotalDays { get; set; }
    public string? TimeZone { get; set; }
    public List<string>? Tags { get; set; }
    public bool IsPublic { get; set; }
    public bool IsArchived { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public List<ItineraryDayResponse> Days { get; set; } = new();
}