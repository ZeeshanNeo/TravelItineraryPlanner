using System;
using System.Collections.Generic;

namespace Domain.Entities;

public class ItineraryDay
{
    public Guid Id { get; set; }
    public Guid ItineraryId { get; set; }
    public DateOnly Date { get; set; }
    public int DayNumber { get; set; }
    public string? Title { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navigation properties
    public Itinerary Itinerary { get; set; } = null!;
    public ICollection<Activity> Activities { get; set; } = new List<Activity>();
}