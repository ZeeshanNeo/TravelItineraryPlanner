using System;
using Domain.Common;

namespace Domain.Entities;

public class Activity : BaseEntity
{
    public Guid ItineraryDayId { get; private set; }
    public string Title { get; private set; } = string.Empty;
    public string? Description { get; private set; }
    public ActivityType ActivityType { get; private set; }
    public DateTime StartTime { get; private set; }
    public DateTime EndTime { get; private set; }
    public string? Location { get; private set; }
    public string? Address { get; private set; }
    public decimal? Cost { get; private set; }
    public string? Currency { get; private set; }
    public string? Notes { get; private set; }
    public int Order { get; private set; }
    public int? TravelTimeMinutes { get; private set; }
    public bool IsFlexible { get; private set; }
    public string? BookingReference { get; private set; }
    public string? ContactInfo { get; private set; }

    // Navigation properties
    public ItineraryDay ItineraryDay { get; set; } = null!;

    // Required for EF Core
    private Activity() { }

    public Activity(
        Guid itineraryDayId,
        string title,
        string? description,
        ActivityType activityType,
        DateTime startTime,
        DateTime endTime,
        string? location,
        string? address,
        decimal? cost,
        string? currency,
        string? notes,
        int order,
        int? travelTimeMinutes,
        bool isFlexible,
        string? bookingReference,
        string? contactInfo)
    {
        if (endTime < startTime)
            throw new ArgumentException("End time cannot be before start time.");

        ItineraryDayId = itineraryDayId;
        Title = title;
        Description = description;
        ActivityType = activityType;
        StartTime = startTime;
        EndTime = endTime;
        Location = location;
        Address = address;
        Cost = cost;
        Currency = currency;
        Notes = notes;
        Order = order;
        TravelTimeMinutes = travelTimeMinutes;
        IsFlexible = isFlexible;
        BookingReference = bookingReference;
        ContactInfo = contactInfo;
        CreatedAt = DateTime.UtcNow;
    }

    public void UpdateDetails(
        string title,
        string? description,
        ActivityType activityType,
        DateTime startTime,
        DateTime endTime,
        string? location,
        string? address,
        decimal? cost,
        string? currency,
        string? notes,
        int order,
        int? travelTimeMinutes,
        bool isFlexible,
        string? bookingReference,
        string? contactInfo)
    {
        if (endTime < startTime)
            throw new ArgumentException("End time cannot be before start time.");

        Title = title;
        Description = description;
        ActivityType = activityType;
        StartTime = startTime;
        EndTime = endTime;
        Location = location;
        Address = address;
        Cost = cost;
        Currency = currency;
        Notes = notes;
        Order = order;
        TravelTimeMinutes = travelTimeMinutes;
        IsFlexible = isFlexible;
        BookingReference = bookingReference;
        ContactInfo = contactInfo;
        UpdatedAt = DateTime.UtcNow;
    }

    public void UpdateOrder(int order)
    {
        Order = order;
        UpdatedAt = DateTime.UtcNow;
    }
}