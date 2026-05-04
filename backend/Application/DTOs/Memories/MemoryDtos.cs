using System;
using System.Collections.Generic;

namespace Application.DTOs.Memories
{
    public class MemoryPhotoDto
    {
        public Guid Id { get; set; }
        public Guid TripId { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public string FilePath { get; set; }
        public DateTime TakenAt { get; set; }
        public string Location { get; set; }
        public List<MemoryTagDto> Tags { get; set; } = new List<MemoryTagDto>();
    }

    public class JournalEntryDto
    {
        public Guid Id { get; set; }
        public Guid TripId { get; set; }
        public string Title { get; set; }
        public string Content { get; set; }
        public DateTime EntryDate { get; set; }
        public string Location { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class MemoryTagDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string Category { get; set; }
    }

    public class MemoryTimelineItemDto
    {
        public string Type { get; set; } // "Photo" or "Journal"
        public DateTime Date { get; set; }
        public object Data { get; set; }
    }

    public class TripSummaryDto
    {
        public int TotalPhotos { get; set; }
        public int TotalJournals { get; set; }
        public List<string> TopLocations { get; set; }
        public List<string> TopTags { get; set; }
        public int TotalDays { get; set; }
    }

    // Request Models
    public class CreateJournalRequest
    {
        public string Title { get; set; }
        public string Content { get; set; }
        public DateTime EntryDate { get; set; }
        public string Location { get; set; }
    }

    public class UpdatePhotoRequest
    {
        public string Title { get; set; }
        public string Description { get; set; }
        public string Location { get; set; }
    }
}
