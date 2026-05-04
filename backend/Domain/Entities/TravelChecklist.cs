using System;
using System.Collections.Generic;

namespace Domain.Entities
{
    public class TravelChecklist
    {
        public Guid Id { get; set; }
        public Guid TripId { get; set; }
        public string Title { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

        // Navigation properties
        public Trip Trip { get; set; }
        public ICollection<ChecklistItem> Items { get; set; } = new List<ChecklistItem>();
    }

    public class ChecklistItem
    {
        public Guid Id { get; set; }
        public Guid ChecklistId { get; set; }
        public string Task { get; set; }
        public bool IsCompleted { get; set; }
        public DateTime? DueDate { get; set; }

        // Navigation properties
        public TravelChecklist Checklist { get; set; }
    }
}
