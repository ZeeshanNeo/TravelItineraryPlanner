using System;
using System.Collections.Generic;
using Domain.Common;

namespace Domain.Entities;

public class MemoryPhoto : BaseEntity
{
    public Guid TripId { get; private set; }
    public string Title { get; private set; }
    public string? Description { get; private set; }
    public string FilePath { get; private set; }
    public string ContentType { get; private set; }
    public long FileSize { get; private set; }
    public DateTime TakenAt { get; private set; }
    public string Location { get; private set; }
    public DateTime UploadedAt { get; private set; }
    public Guid? ActivityId { get; private set; }

    // Navigation properties
    public virtual Trip Trip { get; private set; } = null!;
    public virtual Activity? Activity { get; private set; }
    private readonly List<MemoryTagMapping> _tags = new();
    public virtual IReadOnlyCollection<MemoryTagMapping> Tags => _tags.AsReadOnly();

    private MemoryPhoto() { } // For EF

    public MemoryPhoto(
        Guid tripId,
        string title,
        string? description,
        string filePath,
        string contentType,
        long fileSize,
        DateTime takenAt,
        string location,
        Guid? activityId = null)
    {
        if (tripId == Guid.Empty) throw new ArgumentException("TripId is required.", nameof(tripId));
        if (string.IsNullOrWhiteSpace(title)) throw new ArgumentException("Title is required.", nameof(title));
        if (string.IsNullOrWhiteSpace(filePath)) throw new ArgumentException("FilePath is required.", nameof(filePath));

        Id = Guid.NewGuid();
        TripId = tripId;
        Title = title;
        Description = description;
        FilePath = filePath;
        ContentType = contentType;
        FileSize = fileSize;
        TakenAt = takenAt;
        Location = location;
        ActivityId = activityId;
        UploadedAt = DateTime.UtcNow;
        CreatedAt = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
    }

    public void UpdateDetails(string title, string? description, string location, Guid? activityId = null)
    {
        if (string.IsNullOrWhiteSpace(title)) throw new ArgumentException("Title is required.", nameof(title));
        Title = title;
        Description = description;
        Location = location;
        ActivityId = activityId;
        UpdatedAt = DateTime.UtcNow;
    }
}
