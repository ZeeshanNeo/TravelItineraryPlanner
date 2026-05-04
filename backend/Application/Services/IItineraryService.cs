using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Application.DTOs.Itinerary;
using Application.DTOs.ItineraryDay;
using Application.DTOs.Activity;

namespace Application.Services;

public interface IItineraryService
{
    // Itinerary operations
    Task<ItineraryResponse> CreateItineraryAsync(CreateItineraryRequest request, Guid userId, CancellationToken cancellationToken = default);
    Task<ItineraryResponse> GetItineraryAsync(Guid itineraryId, Guid userId, CancellationToken cancellationToken = default);
    Task<IEnumerable<ItineraryResponse>> GetItinerariesByTripAsync(Guid tripId, Guid userId, bool includeArchived = false, CancellationToken cancellationToken = default);
    Task<IEnumerable<ItineraryResponse>> GetItinerariesByUserAsync(Guid userId, bool includeArchived = false, CancellationToken cancellationToken = default);
    Task<ItineraryResponse> UpdateItineraryAsync(Guid itineraryId, UpdateItineraryRequest request, Guid userId, CancellationToken cancellationToken = default);
    Task ArchiveItineraryAsync(Guid itineraryId, Guid userId, CancellationToken cancellationToken = default);
    Task DeleteItineraryAsync(Guid itineraryId, Guid userId, CancellationToken cancellationToken = default);

    // ItineraryDay operations
    Task<ItineraryDayResponse> CreateItineraryDayAsync(CreateItineraryDayRequest request, Guid userId, CancellationToken cancellationToken = default);
    Task<ItineraryDayResponse> GetItineraryDayAsync(Guid dayId, Guid userId, CancellationToken cancellationToken = default);
    Task<IEnumerable<ItineraryDayResponse>> GetItineraryDaysAsync(Guid itineraryId, Guid userId, CancellationToken cancellationToken = default);
    Task<ItineraryDayResponse> UpdateItineraryDayAsync(Guid dayId, UpdateItineraryDayRequest request, Guid userId, CancellationToken cancellationToken = default);
    Task DeleteItineraryDayAsync(Guid dayId, Guid userId, CancellationToken cancellationToken = default);

    // Activity operations
    Task<ActivityResponse> CreateActivityAsync(CreateActivityRequest request, Guid userId, CancellationToken cancellationToken = default);
    Task<ActivityResponse> GetActivityAsync(Guid activityId, Guid userId, CancellationToken cancellationToken = default);
    Task<IEnumerable<ActivityResponse>> GetActivitiesByDayAsync(Guid dayId, Guid userId, CancellationToken cancellationToken = default);
    Task<ActivityResponse> UpdateActivityAsync(Guid activityId, UpdateActivityRequest request, Guid userId, CancellationToken cancellationToken = default);
    Task DeleteActivityAsync(Guid activityId, Guid userId, CancellationToken cancellationToken = default);
    Task ReorderActivitiesAsync(Guid dayId, List<Guid> activityIdsInOrder, Guid userId, CancellationToken cancellationToken = default);
}