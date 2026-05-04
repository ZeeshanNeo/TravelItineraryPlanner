using System;
using System.Collections.Generic;

namespace Domain.Entities
{
    public class PackingList
    {
        public Guid Id { get; set; }
        public Guid TripId { get; set; }
        public string Title { get; set; }
        public string Category { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

        // Navigation properties
        public Trip Trip { get; set; }
        public ICollection<PackingItem> Items { get; set; } = new List<PackingItem>();
    }

    public class PackingItem
    {
        public Guid Id { get; set; }
        public Guid PackingListId { get; set; }
        public string Name { get; set; }
        public int Quantity { get; set; } = 1;
        public bool IsPacked { get; set; }

        // Navigation properties
        public PackingList PackingList { get; set; }
    }
}
