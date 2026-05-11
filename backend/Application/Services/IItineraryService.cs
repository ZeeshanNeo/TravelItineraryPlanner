using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Application.Common.Models;
using Application.DTOs.Itinerary;
using Application.DTOs.ItineraryDay;
using Application.DTOs.Activity;
using Application.Common.Interfaces;

namespace Application.Services;

public interface IItineraryService
{
    // Itinerary operations
    Task<Result<ItineraryResponse>> CreateItineraryAsync(CreateItineraryRequest request, Guid userId, CancellationToken cancellationToken = default);
    Task<Result<ItineraryResponse>> GetItineraryAsync(Guid itineraryId, Guid userId, CancellationToken cancellationToken = default);
    Task<Result<IEnumerable<ItineraryResponse>>> GetItinerariesByTripAsync(Guid tripId, Guid userId, bool includeArchived = false, CancellationToken cancellationToken = default);
    Task<Result<IEnumerable<ItineraryResponse>>> GetItinerariesByUserAsync(Guid userId, bool includeArchived = false, CancellationToken cancellationToken = default);
    Task<Result<ItineraryResponse>> UpdateItineraryAsync(Guid itineraryId, UpdateItineraryRequest request, Guid userId, CancellationToken cancellationToken = default);
    Task<Result> ArchiveItineraryAsync(Guid itineraryId, Guid userId, CancellationToken cancellationToken = default);
    Task<Result> DeleteItineraryAsync(Guid itineraryId, Guid userId, CancellationToken cancellationToken = default);
    
    // Sharing
    Task<Result<string>> GenerateShareLinkAsync(Guid itineraryId, Guid userId, CancellationToken cancellationToken = default);
    Task<Result> RevokeShareLinkAsync(Guid itineraryId, Guid userId, CancellationToken cancellationToken = default);
    Task<Result<ItineraryResponse>> GetPublicItineraryAsync(string shareToken, CancellationToken cancellationToken = default);

    // Utilities
    Task<Result<WeatherForecastResponse>> GetItineraryWeatherAsync(Guid itineraryId, DateTime date, Guid userId, CancellationToken cancellationToken = default);

    // ItineraryDay operations
    Task<Result<ItineraryDayResponse>> CreateItineraryDayAsync(CreateItineraryDayRequest request, Guid userId, CancellationToken cancellationToken = default);
    Task<Result<ItineraryDayResponse>> GetItineraryDayAsync(Guid dayId, Guid userId, CancellationToken cancellationToken = default);
    Task<Result<IEnumerable<ItineraryDayResponse>>> GetItineraryDaysAsync(Guid itineraryId, Guid userId, CancellationToken cancellationToken = default);
    Task<Result<ItineraryDayResponse>> UpdateItineraryDayAsync(Guid dayId, UpdateItineraryDayRequest request, Guid userId, CancellationToken cancellationToken = default);
    Task<Result> DeleteItineraryDayAsync(Guid dayId, Guid userId, CancellationToken cancellationToken = default);

    // Activity operations
    Task<Result<ActivityResponse>> CreateActivityAsync(CreateActivityRequest request, Guid userId, CancellationToken cancellationToken = default);
    Task<Result<ActivityResponse>> GetActivityAsync(Guid activityId, Guid userId, CancellationToken cancellationToken = default);
    Task<Result<IEnumerable<ActivityResponse>>> GetActivitiesByDayAsync(Guid dayId, Guid userId, CancellationToken cancellationToken = default);
    Task<Result<ActivityResponse>> UpdateActivityAsync(Guid activityId, UpdateActivityRequest request, Guid userId, CancellationToken cancellationToken = default);
    Task<Result> DeleteActivityAsync(Guid activityId, Guid userId, CancellationToken cancellationToken = default);
    Task<Result> ReorderActivitiesAsync(Guid dayId, List<Guid> activityIdsInOrder, Guid userId, CancellationToken cancellationToken = default);
}