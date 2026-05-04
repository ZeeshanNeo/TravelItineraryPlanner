using System;
using System.Collections.Generic;
using Application.DTOs.Activity;

namespace Application.DTOs.ItineraryDay;

public class ItineraryDayResponse
{
    public Guid Id { get; set; }
    public Guid ItineraryId { get; set; }
    public DateOnly Date { get; set; }
    public int DayNumber { get; set; }
    public string? Title { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public List<ActivityResponse> Activities { get; set; } = new();
}