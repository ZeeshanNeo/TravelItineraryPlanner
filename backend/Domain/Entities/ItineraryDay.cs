using System;
using System.Collections.Generic;
using Domain.Common;

namespace Domain.Entities;

public class ItineraryDay : BaseEntity
{
    public Guid ItineraryId { get; private set; }
    public DateOnly Date { get; private set; }
    public int DayNumber { get; private set; }
    public string? Title { get; private set; }
    public string? Notes { get; private set; }

    // Navigation properties
    public Itinerary Itinerary { get; set; } = null!;
    public ICollection<Activity> Activities { get; set; } = new List<Activity>();

    // Required for EF Core
    private ItineraryDay() { }

    public ItineraryDay(Guid itineraryId, DateOnly date, int dayNumber, string? title = null, string? notes = null)
    {
        ItineraryId = itineraryId;
        Date = date;
        DayNumber = dayNumber;
        Title = title;
        Notes = notes;
        CreatedAt = DateTime.UtcNow;
    }

    public void UpdateDetails(string? title, string? notes)
    {
        Title = title;
        Notes = notes;
        UpdatedAt = DateTime.UtcNow;
    }

    public void UpdateDate(DateOnly date, int dayNumber)
    {
        Date = date;
        DayNumber = dayNumber;
        UpdatedAt = DateTime.UtcNow;
    }
}