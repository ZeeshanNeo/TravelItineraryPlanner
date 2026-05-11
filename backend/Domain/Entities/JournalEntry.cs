using System;
using Domain.Common;

namespace Domain.Entities;

public class JournalEntry : BaseEntity
{
    public Guid TripId { get; private set; }
    public string Title { get; private set; }
    public string Content { get; private set; }
    public DateTime EntryDate { get; private set; }
    public string Location { get; private set; }
    public Guid? ActivityId { get; private set; }

    // Navigation properties
    public virtual Trip Trip { get; private set; } = null!;
    public virtual Activity? Activity { get; private set; }

    private JournalEntry() { } // For EF

    public JournalEntry(Guid tripId, string title, string content, DateTime entryDate, string location, Guid? activityId = null)
    {
        if (tripId == Guid.Empty) throw new ArgumentException("TripId is required.", nameof(tripId));
        if (string.IsNullOrWhiteSpace(title)) throw new ArgumentException("Title is required.", nameof(title));
        if (string.IsNullOrWhiteSpace(content)) throw new ArgumentException("Content is required.", nameof(content));

        Id = Guid.NewGuid();
        TripId = tripId;
        Title = title;
        Content = content;
        EntryDate = entryDate;
        Location = location;
        ActivityId = activityId;
        CreatedAt = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
    }

    public void UpdateDetails(string title, string content, DateTime entryDate, string location, Guid? activityId = null)
    {
        if (string.IsNullOrWhiteSpace(title)) throw new ArgumentException("Title is required.", nameof(title));
        if (string.IsNullOrWhiteSpace(content)) throw new ArgumentException("Content is required.", nameof(content));

        Title = title;
        Content = content;
        EntryDate = entryDate;
        Location = location;
        ActivityId = activityId;
        UpdatedAt = DateTime.UtcNow;
    }
}
