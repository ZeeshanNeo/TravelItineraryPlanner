using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Application.DTOs.Trip;
using Application.Services;
using Domain.Entities;
using Domain.Interfaces;

namespace Infrastructure.Services;

public class TripService : ITripService
{
    private readonly ITripRepository _tripRepository;
    private readonly IExpenseRepository _expenseRepository;
    private readonly ITripMemberRepository _tripMemberRepository;
    private readonly ITravelDocumentRepository _travelDocumentRepository;
    private readonly ITripBudgetRepository _tripBudgetRepository;

    public TripService(
        ITripRepository tripRepository, 
        IExpenseRepository expenseRepository,
        ITripMemberRepository tripMemberRepository,
        ITravelDocumentRepository travelDocumentRepository,
        ITripBudgetRepository tripBudgetRepository)
    {
        _tripRepository = tripRepository;
        _expenseRepository = expenseRepository;
        _tripMemberRepository = tripMemberRepository;
        _travelDocumentRepository = travelDocumentRepository;
        _tripBudgetRepository = tripBudgetRepository;
    }

    public async Task<TripResponse> CreateTripAsync(CreateTripRequest request, Guid userId, CancellationToken cancellationToken = default)
    {
        var trip = new Trip
        {
            UserId = userId,
            Title = request.Title,
            Destination = request.Destination,
            StartDate = request.StartDate,
            EndDate = request.EndDate,
            TravelType = request.TravelType,
            Purpose = request.Purpose,
            Notes = request.Notes,
            TravelCompanions = SerializeCompanions(request.TravelCompanions),
            IsArchived = false,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _tripRepository.AddAsync(trip, cancellationToken);
        await _tripRepository.SaveChangesAsync(cancellationToken);

        return MapToResponse(trip);
    }

    public async Task<TripResponse> GetTripAsync(Guid tripId, Guid userId, CancellationToken cancellationToken = default)
    {
        var trip = await _tripRepository.GetByIdAndUserIdAsync(tripId, userId, cancellationToken);
        if (trip == null)
            throw new KeyNotFoundException("Trip not found.");

        return MapToResponse(trip);
    }

    public async Task<IEnumerable<TripResponse>> GetUserTripsAsync(Guid userId, bool includeArchived = false, CancellationToken cancellationToken = default)
    {
        var trips = await _tripRepository.GetByUserIdAsync(userId, includeArchived, cancellationToken);
        return trips.Select(MapToResponse);
    }

    public async Task<TripResponse> UpdateTripAsync(Guid tripId, UpdateTripRequest request, Guid userId, CancellationToken cancellationToken = default)
    {
        var trip = await _tripRepository.GetByIdAndUserIdAsync(tripId, userId, cancellationToken);
        if (trip == null)
            throw new KeyNotFoundException("Trip not found.");

        if (request.Title != null) trip.Title = request.Title;
        if (request.Destination != null) trip.Destination = request.Destination;
        if (request.StartDate.HasValue) trip.StartDate = request.StartDate.Value;
        if (request.EndDate.HasValue) trip.EndDate = request.EndDate.Value;
        if (request.TravelType.HasValue) trip.TravelType = request.TravelType.Value;
        if (request.Purpose != null) trip.Purpose = request.Purpose;
        if (request.Notes != null) trip.Notes = request.Notes;
        if (request.TravelCompanions != null) trip.TravelCompanions = SerializeCompanions(request.TravelCompanions);

        trip.UpdatedAt = DateTime.UtcNow;

        _tripRepository.Update(trip);
        await _tripRepository.SaveChangesAsync(cancellationToken);

        return MapToResponse(trip);
    }

    public async Task ArchiveTripAsync(Guid tripId, ArchiveTripRequest request, Guid userId, CancellationToken cancellationToken = default)
    {
        var trip = await _tripRepository.GetByIdAndUserIdAsync(tripId, userId, cancellationToken);
        if (trip == null)
            throw new KeyNotFoundException("Trip not found.");

        trip.IsArchived = request.IsArchived;
        trip.UpdatedAt = DateTime.UtcNow;

        _tripRepository.Update(trip);
        await _tripRepository.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteTripAsync(Guid tripId, Guid userId, CancellationToken cancellationToken = default)
    {
        var trip = await _tripRepository.GetByIdAndUserIdAsync(tripId, userId, cancellationToken);
        if (trip == null)
            throw new KeyNotFoundException("Trip not found.");

        await _tripRepository.DeleteAsync(tripId, cancellationToken);
        await _tripRepository.SaveChangesAsync(cancellationToken);
    }

    public async Task<GlobalStatisticsResponse> GetGlobalStatisticsAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var trips = (await _tripRepository.GetByUserIdAsync(userId, true, cancellationToken)).ToList();
        
        var now = DateTime.UtcNow;
        var upcomingTrips = trips.Count(t => !t.IsArchived && t.StartDate > now);
        var completedTrips = trips.Count(t => t.EndDate < now);
        var activeTrips = trips.Count(t => !t.IsArchived);
        
        var countries = new HashSet<string>();
        int totalDays = 0;
        
        foreach (var trip in trips.Where(t => !t.IsArchived))
        {
            var destinationParts = trip.Destination.Split(',');
            if (destinationParts.Length > 0)
            {
                countries.Add(destinationParts.Last().Trim());
            }
            
            totalDays += (trip.EndDate - trip.StartDate).Days + 1;
        }

        // Real calculations
        decimal totalSpend = 0;
        decimal totalBudget = 0;
        int totalDocuments = 0;

        foreach (var trip in trips.Where(t => !t.IsArchived))
        {
            var expenses = await _expenseRepository.GetByTripIdAsync(trip.Id, cancellationToken);
            totalSpend += expenses.Sum(e => e.Amount);

            var budget = await _tripBudgetRepository.GetByTripIdAsync(trip.Id, cancellationToken);
            if (budget != null)
            {
                totalBudget += budget.TotalAmount;
            }

            var docs = await _travelDocumentRepository.GetByTripIdAsync(trip.Id);
            totalDocuments += docs.Count();
        }

        // For collaborators, we might want unique users across all trips (excluding self)
        var uniqueCollaborators = new HashSet<Guid>();
        foreach (var trip in trips.Where(t => !t.IsArchived))
        {
            var members = await _tripMemberRepository.GetByTripIdAsync(trip.Id);
            foreach (var m in members)
            {
                if (m.UserId != userId) uniqueCollaborators.Add(m.UserId);
            }
        }

        return new GlobalStatisticsResponse
        {
            TotalTrips = activeTrips,
            UpcomingTrips = upcomingTrips,
            CompletedTrips = completedTrips,
            CountriesVisited = countries.Count,
            TotalTravelDays = totalDays,
            TotalSpend = totalSpend,
            TotalBudget = totalBudget,
            TotalCollaborators = uniqueCollaborators.Count,
            SecureDocumentsCount = totalDocuments
        };
    }

    private static JsonDocument? SerializeCompanions(List<string>? companions)
    {
        if (companions == null) return null;
        return JsonDocument.Parse(JsonSerializer.Serialize(companions));
    }

    private static List<string>? DeserializeCompanions(JsonDocument? document)
    {
        if (document == null) return null;
        return JsonSerializer.Deserialize<List<string>>(document.RootElement.GetRawText());
    }

    private static TripResponse MapToResponse(Trip trip)
    {
        return new TripResponse
        {
            Id = trip.Id,
            UserId = trip.UserId,
            Title = trip.Title,
            Destination = trip.Destination,
            StartDate = trip.StartDate,
            EndDate = trip.EndDate,
            TravelType = trip.TravelType.ToString(),
            Purpose = trip.Purpose,
            Notes = trip.Notes,
            TravelCompanions = DeserializeCompanions(trip.TravelCompanions),
            IsArchived = trip.IsArchived,
            CreatedAt = trip.CreatedAt,
            UpdatedAt = trip.UpdatedAt
        };
    }
}
