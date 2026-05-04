using System;
using System.Collections.Generic;
using Domain.Entities;

namespace Application.DTOs.Trip;

public class CreateTripRequest
{
    public string Title { get; set; } = string.Empty;
    public string Destination { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public TravelType TravelType { get; set; }
    public string? Purpose { get; set; }
    public string? Notes { get; set; }
    public List<string>? TravelCompanions { get; set; }
}
