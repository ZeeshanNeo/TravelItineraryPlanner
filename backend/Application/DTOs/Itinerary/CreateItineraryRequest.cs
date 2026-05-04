using System;
using System.Collections.Generic;

namespace Application.DTOs.Itinerary;

public class CreateItineraryRequest
{
    public Guid TripId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public string? TimeZone { get; set; }
    public List<string>? Tags { get; set; }
    public bool IsPublic { get; set; }
}