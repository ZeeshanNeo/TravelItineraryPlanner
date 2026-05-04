using System;

namespace Domain.Entities;

public class Activity
{
    public Guid Id { get; set; }
    public Guid ItineraryDayId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public ActivityType ActivityType { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public string? Location { get; set; }
    public string? Address { get; set; }
    public decimal? Cost { get; set; }
    public string? Currency { get; set; }
    public string? Notes { get; set; }
    public int Order { get; set; }
    public int? TravelTimeMinutes { get; set; }
    public bool IsFlexible { get; set; }
    public string? BookingReference { get; set; }
    public string? ContactInfo { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navigation properties
    public ItineraryDay ItineraryDay { get; set; } = null!;
}