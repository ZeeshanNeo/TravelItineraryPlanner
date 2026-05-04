using System;
using System.Collections.Generic;
using Domain.Entities;

namespace Application.DTOs.Booking;

public class BookingResponse
{
    public Guid Id { get; set; }
    public Guid TripId { get; set; }
    public Guid? ActivityId { get; set; }
    public string Category { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Status { get; set; } = string.Empty;
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
    public bool IsArchived { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public List<BookingDocumentResponse> Documents { get; set; } = new();
}