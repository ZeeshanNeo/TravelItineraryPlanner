using System;

namespace Application.DTOs.ItineraryDay;

public class CreateItineraryDayRequest
{
    public Guid ItineraryId { get; set; }
    public DateOnly Date { get; set; }
    public int DayNumber { get; set; }
    public string? Title { get; set; }
    public string? Notes { get; set; }
}