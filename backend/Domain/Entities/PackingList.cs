using System;
using System.Collections.Generic;
using System.Linq;
using Domain.Common;

namespace Domain.Entities;

public class PackingList : BaseEntity
{
    public Guid? TripId { get; private set; }
    public string Title { get; private set; }
    public string Category { get; private set; }
    public bool IsTemplate { get; private set; }
    public string? TemplateCategory { get; private set; } // e.g., Business, Adventure

    // Navigation properties
    public Trip? Trip { get; private set; }
    private readonly List<PackingItem> _items = new();
    public virtual IReadOnlyCollection<PackingItem> Items => _items.AsReadOnly();

    private PackingList() { } // For EF

    public PackingList(Guid? tripId, string title, string category, bool isTemplate = false, string? templateCategory = null)
    {
        if (!tripId.HasValue && !isTemplate) throw new ArgumentException("TripId is required for non-template lists.", nameof(tripId));
        if (string.IsNullOrWhiteSpace(title)) throw new ArgumentException("Title is required.", nameof(title));

        Id = Guid.NewGuid();
        TripId = tripId;
        Title = title;
        Category = category;
        IsTemplate = isTemplate;
        TemplateCategory = templateCategory;
        CreatedAt = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
    }

    public void UpdateDetails(string title, string category, string? templateCategory = null)
    {
        if (string.IsNullOrWhiteSpace(title)) throw new ArgumentException("Title is required.", nameof(title));
        Title = title;
        Category = category;
        TemplateCategory = templateCategory;
        UpdatedAt = DateTime.UtcNow;
    }

    public void AddItem(string name, int quantity)
    {
        if (string.IsNullOrWhiteSpace(name)) throw new ArgumentException("Item name is required.", nameof(name));
        if (quantity < 1) throw new ArgumentException("Quantity must be at least 1.", nameof(quantity));

        _items.Add(new PackingItem(Id, name, quantity));
        UpdatedAt = DateTime.UtcNow;
    }
}

public class PackingItem : BaseEntity
{
    public Guid PackingListId { get; private set; }
    public string Name { get; private set; }
    public int Quantity { get; private set; }
    public bool IsPacked { get; private set; }

    // Navigation properties
    public PackingList PackingList { get; private set; } = null!;

    private PackingItem() { } // For EF

    public PackingItem(Guid packingListId, string name, int quantity)
    {
        if (packingListId == Guid.Empty) throw new ArgumentException("PackingListId is required.", nameof(packingListId));
        if (string.IsNullOrWhiteSpace(name)) throw new ArgumentException("Item name is required.", nameof(name));
        if (quantity < 1) throw new ArgumentException("Quantity must be at least 1.", nameof(quantity));

        Id = Guid.NewGuid();
        PackingListId = packingListId;
        Name = name;
        Quantity = quantity;
        IsPacked = false;
        CreatedAt = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetPackedStatus(bool isPacked)
    {
        IsPacked = isPacked;
        UpdatedAt = DateTime.UtcNow;
    }
}
