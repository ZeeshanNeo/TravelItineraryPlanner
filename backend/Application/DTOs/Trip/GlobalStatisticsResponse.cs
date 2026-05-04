using System;

namespace Application.DTOs.Trip;

public class GlobalStatisticsResponse
{
    public int TotalTrips { get; set; }
    public int UpcomingTrips { get; set; }
    public int CompletedTrips { get; set; }
    public int CountriesVisited { get; set; }
    public int TotalTravelDays { get; set; }
    public decimal TotalSpend { get; set; }
    public string BaseCurrency { get; set; } = "USD";
    public int TotalCollaborators { get; set; }
    public int SecureDocumentsCount { get; set; }
}
