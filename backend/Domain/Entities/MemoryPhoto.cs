using System;
using System.Collections.Generic;

namespace Domain.Entities
{
    public class MemoryPhoto
    {
        public Guid Id { get; set; }
        public Guid TripId { get; set; }
        public string Title { get; set; }
        public string? Description { get; set; }
        public string FilePath { get; set; }
        public string ContentType { get; set; }
        public long FileSize { get; set; }
        public DateTime TakenAt { get; set; }
        public string Location { get; set; }
        public DateTime UploadedAt { get; set; }

        public virtual Trip Trip { get; set; }
        public virtual ICollection<MemoryTagMapping> Tags { get; set; } = new List<MemoryTagMapping>();
    }
}
