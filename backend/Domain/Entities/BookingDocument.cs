using System;
using Domain.Common;

namespace Domain.Entities;

public class BookingDocument : BaseEntity
{
    public Guid BookingId { get; private set; }
    public string FileName { get; private set; } = string.Empty;
    public string FilePath { get; private set; } = string.Empty;
    public long FileSize { get; private set; }
    public string ContentType { get; private set; } = string.Empty;
    public DateTime UploadedAt { get; private set; }

    // Navigation property
    public Booking Booking { get; private set; } = null!;

    // Constructor for EF
    private BookingDocument() { }

    public BookingDocument(Guid bookingId, string fileName, string filePath, long fileSize, string contentType)
    {
        if (string.IsNullOrWhiteSpace(fileName))
            throw new ArgumentException("File name cannot be empty.", nameof(fileName));
        if (string.IsNullOrWhiteSpace(filePath))
            throw new ArgumentException("File path cannot be empty.", nameof(filePath));

        BookingId = bookingId;
        FileName = fileName;
        FilePath = filePath;
        FileSize = fileSize;
        ContentType = contentType;
        UploadedAt = DateTime.UtcNow;
        CreatedAt = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
    }
}