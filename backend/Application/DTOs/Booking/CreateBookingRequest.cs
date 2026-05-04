using System;
using Domain.Entities;

namespace Application.DTOs.Booking;

public class CreateBookingRequest
{
    public Guid TripId { get; set; }
    public Guid? ActivityId { get; set; }
    public BookingCategory Category { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public BookingStatus Status { get; set; } = BookingStatus.Pending;
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public string? TimeZone { get; set; }
    public string? Location { get; set; }
    public string? Address { get; set; }
    public string? Provider { get; set; }
    public string? ConfirmationCode { get; set; }
    public decimal? Cost { get; set; }
    public string? Currency { get; set; }
    public string? Notes { get; set; }
    public string? ContactInfo { get; set; }
}