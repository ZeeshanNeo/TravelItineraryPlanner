using System;
using System.Collections.Generic;
using Domain.Common;

namespace Domain.Entities;

public class TravelChecklist : BaseEntity
{
    public Guid TripId { get; private set; }
    public string Title { get; private set; }

    // Navigation properties
    public Trip Trip { get; private set; } = null!;
    private readonly List<ChecklistItem> _items = new();
    public virtual IReadOnlyCollection<ChecklistItem> Items => _items.AsReadOnly();

    private TravelChecklist() { } // For EF

    public TravelChecklist(Guid tripId, string title)
    {
        if (tripId == Guid.Empty) throw new ArgumentException("TripId is required.", nameof(tripId));
        if (string.IsNullOrWhiteSpace(title)) throw new ArgumentException("Title is required.", nameof(title));

        Id = Guid.NewGuid();
        TripId = tripId;
        Title = title;
        CreatedAt = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
    }

    public void UpdateTitle(string title)
    {
        if (string.IsNullOrWhiteSpace(title)) throw new ArgumentException("Title is required.", nameof(title));
        Title = title;
        UpdatedAt = DateTime.UtcNow;
    }

    public void AddItem(string task, DateTime? dueDate)
    {
        if (string.IsNullOrWhiteSpace(task)) throw new ArgumentException("Task description is required.", nameof(task));

        _items.Add(new ChecklistItem(Id, task, dueDate));
        UpdatedAt = DateTime.UtcNow;
    }
}

public class ChecklistItem : BaseEntity
{
    public Guid ChecklistId { get; private set; }
    public string Task { get; private set; }
    public bool IsCompleted { get; private set; }
    public DateTime? DueDate { get; private set; }

    // Navigation properties
    public TravelChecklist Checklist { get; private set; } = null!;

    private ChecklistItem() { } // For EF

    public ChecklistItem(Guid checklistId, string task, DateTime? dueDate)
    {
        if (checklistId == Guid.Empty) throw new ArgumentException("ChecklistId is required.", nameof(checklistId));
        if (string.IsNullOrWhiteSpace(task)) throw new ArgumentException("Task description is required.", nameof(task));

        Id = Guid.NewGuid();
        ChecklistId = checklistId;
        Task = task;
        DueDate = dueDate;
        IsCompleted = false;
        CreatedAt = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetCompletedStatus(bool isCompleted)
    {
        IsCompleted = isCompleted;
        UpdatedAt = DateTime.UtcNow;
    }
}
