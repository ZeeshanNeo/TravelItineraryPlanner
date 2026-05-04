using System;
using System.Text.Json;

namespace Domain.Entities;

public class Trip
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Destination { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public TravelType TravelType { get; set; }
    public string? Purpose { get; set; }
    public string? Notes { get; set; }
    public JsonDocument? TravelCompanions { get; set; } // JSON array of strings
    public bool IsArchived { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navigation properties
    public User User { get; set; } = null!;
    public ICollection<Itinerary> Itineraries { get; set; } = new List<Itinerary>();
}
