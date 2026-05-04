using System;
using System.Collections.Generic;

namespace Domain.Entities
{
    public class MemoryTag
    {
        public Guid Id { get; set; }
        public string Name { get; set; } // e.g., "Family", "Paris", "Dinner"
        public string? Category { get; set; } // e.g., "People", "Location", "Activity"

        public virtual ICollection<MemoryTagMapping> Photos { get; set; } = new List<MemoryTagMapping>();
    }

    public class MemoryTagMapping
    {
        public Guid PhotoId { get; set; }
        public Guid TagId { get; set; }

        public virtual MemoryPhoto Photo { get; set; }
        public virtual MemoryTag Tag { get; set; }
    }
}
