using System;
using System.Collections.Generic;

namespace Application.DTOs.TravelDocs
{
    public class ChecklistDto
    {
        public Guid Id { get; set; }
        public Guid TripId { get; set; }
        public string Title { get; set; }
        public List<ChecklistItemDto> Items { get; set; } = new List<ChecklistItemDto>();
    }

    public class ChecklistItemDto
    {
        public Guid Id { get; set; }
        public string Task { get; set; }
        public bool IsCompleted { get; set; }
        public DateTime? DueDate { get; set; }
    }

    public class CreateChecklistRequest
    {
        public string Title { get; set; }
    }

    public class AddChecklistItemRequest
    {
        public string Task { get; set; }
        public DateTime? DueDate { get; set; }
    }

    public class UpdateChecklistItemRequest
    {
        public bool IsCompleted { get; set; }
    }
}
