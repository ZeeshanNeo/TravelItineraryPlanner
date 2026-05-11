using System;
using Domain.Common;

namespace Domain.Entities;

public enum TripTaskStatus
{
    ToDo,
    InProgress,
    Completed,
    Cancelled
}

public class TripTask : BaseEntity
{
    public Guid TripId { get; private set; }
    public Guid? AssignedToUserId { get; private set; }
    public string Title { get; private set; }
    public string Description { get; private set; }
    public TripTaskStatus Status { get; private set; }
    public DateTime? DueDate { get; private set; }

    // Navigation properties
    public virtual Trip Trip { get; private set; } = null!;
    public virtual User? AssignedToUser { get; private set; }

    private TripTask() { } // For EF

    public TripTask(Guid tripId, string title, string description, DateTime? dueDate = null, Guid? assignedToUserId = null)
    {
        if (tripId == Guid.Empty) throw new ArgumentException("TripId is required.", nameof(tripId));
        if (string.IsNullOrWhiteSpace(title)) throw new ArgumentException("Title is required.", nameof(title));

        Id = Guid.NewGuid();
        TripId = tripId;
        Title = title;
        Description = description;
        Status = TripTaskStatus.ToDo;
        DueDate = dueDate;
        AssignedToUserId = assignedToUserId;
        CreatedAt = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
    }

    public void UpdateDetails(string title, string description, DateTime? dueDate, Guid? assignedToUserId)
    {
        if (string.IsNullOrWhiteSpace(title)) throw new ArgumentException("Title is required.", nameof(title));
        Title = title;
        Description = description;
        DueDate = dueDate;
        AssignedToUserId = assignedToUserId;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetStatus(TripTaskStatus status)
    {
        Status = status;
        UpdatedAt = DateTime.UtcNow;
    }
}
