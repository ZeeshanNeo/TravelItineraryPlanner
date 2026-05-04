using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Application.DTOs.Trip;

namespace Application.Services;

public interface ITripService
{
    Task<TripResponse> CreateTripAsync(CreateTripRequest request, Guid userId, CancellationToken cancellationToken = default);
    Task<TripResponse> GetTripAsync(Guid tripId, Guid userId, CancellationToken cancellationToken = default);
    Task<IEnumerable<TripResponse>> GetUserTripsAsync(Guid userId, bool includeArchived = false, CancellationToken cancellationToken = default);
    Task<TripResponse> UpdateTripAsync(Guid tripId, UpdateTripRequest request, Guid userId, CancellationToken cancellationToken = default);
    Task ArchiveTripAsync(Guid tripId, ArchiveTripRequest request, Guid userId, CancellationToken cancellationToken = default);
    Task DeleteTripAsync(Guid tripId, Guid userId, CancellationToken cancellationToken = default);
    Task<GlobalStatisticsResponse> GetGlobalStatisticsAsync(Guid userId, CancellationToken cancellationToken = default);
}
