using System;
using System.Collections.Generic;
using Domain.Common;

namespace Domain.Entities;

public class Booking : BaseEntity
{
    public Guid TripId { get; private set; }
    public Guid? ActivityId { get; private set; }
    public BookingCategory Category { get; private set; }
    public string Title { get; private set; } = string.Empty;
    public string? Description { get; private set; }
    public BookingStatus Status { get; private set; }
    public DateTime? StartDate { get; private set; }
    public DateTime? EndDate { get; private set; }
    public string? TimeZone { get; private set; }
    public string? Location { get; private set; }
    public string? Address { get; private set; }
    public string? Provider { get; private set; }
    public string? ConfirmationCode { get; private set; }
    public decimal? Cost { get; private set; }
    public string? Currency { get; private set; }
    public string? Notes { get; private set; }
    public string? ContactInfo { get; private set; }
    public bool IsArchived { get; private set; }

    // Navigation properties
    public Trip Trip { get; private set; } = null!;
    public Activity? Activity { get; private set; }
    public ICollection<BookingDocument> Documents { get; private set; } = new List<BookingDocument>();

    // Constructor for EF
    private Booking() { }

    public Booking(
        Guid tripId,
        BookingCategory category,
        string title,
        string? description,
        DateTime? startDate,
        DateTime? endDate,
        string? timeZone,
        string? location,
        string? address,
        string? provider,
        string? confirmationCode,
        decimal? cost,
        string? currency,
        string? notes,
        string? contactInfo,
        Guid? activityId = null)
    {
        if (string.IsNullOrWhiteSpace(title))
            throw new ArgumentException("Title cannot be empty.", nameof(title));

        if (startDate.HasValue && endDate.HasValue && endDate < startDate)
            throw new ArgumentException("End date cannot be before start date.");

        TripId = tripId;
        Category = category;
        Title = title;
        Description = description;
        StartDate = startDate;
        EndDate = endDate;
        TimeZone = timeZone;
        Location = location;
        Address = address;
        Provider = provider;
        ConfirmationCode = confirmationCode;
        Cost = cost;
        Currency = currency;
        Notes = notes;
        ContactInfo = contactInfo;
        ActivityId = activityId;
        Status = BookingStatus.Pending;
        IsArchived = false;
        CreatedAt = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
    }

    public void UpdateDetails(
        string title,
        string? description,
        BookingCategory category,
        DateTime? startDate,
        DateTime? endDate,
        string? timeZone,
        string? location,
        string? address,
        string? provider,
        string? confirmationCode,
        decimal? cost,
        string? currency,
        string? notes,
        string? contactInfo,
        Guid? activityId)
    {
        if (string.IsNullOrWhiteSpace(title))
            throw new ArgumentException("Title cannot be empty.", nameof(title));

        if (startDate.HasValue && endDate.HasValue && endDate < startDate)
            throw new ArgumentException("End date cannot be before start date.");

        Title = title;
        Description = description;
        Category = category;
        StartDate = startDate;
        EndDate = endDate;
        TimeZone = timeZone;
        Location = location;
        Address = address;
        Provider = provider;
        ConfirmationCode = confirmationCode;
        Cost = cost;
        Currency = currency;
        Notes = notes;
        ContactInfo = contactInfo;
        ActivityId = activityId;
        UpdatedAt = DateTime.UtcNow;
    }

    public void UpdateStatus(BookingStatus status)
    {
        Status = status;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetArchiveStatus(bool isArchived)
    {
        IsArchived = isArchived;
        UpdatedAt = DateTime.UtcNow;
    }
}