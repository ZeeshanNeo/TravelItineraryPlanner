using System;

namespace Application.DTOs.ItineraryDay;

public class UpdateItineraryDayRequest
{
    public DateOnly? Date { get; set; }
    public int? DayNumber { get; set; }
    public string? Title { get; set; }
    public string? Notes { get; set; }
}