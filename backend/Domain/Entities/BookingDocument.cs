using System;

namespace Domain.Entities;

public class BookingDocument
{
    public Guid Id { get; set; }
    public Guid BookingId { get; set; }
    public string FileName { get; set; } = string.Empty;
    public string FilePath { get; set; } = string.Empty;
    public long FileSize { get; set; }
    public string ContentType { get; set; } = string.Empty;
    public DateTime UploadedAt { get; set; }

    // Navigation property
    public Booking Booking { get; set; } = null!;
}