using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Application.Common.Models;
using Application.DTOs.Trip;

namespace Application.Services;

public interface ITripService
{
    Task<Result<TripResponse>> CreateTripAsync(CreateTripRequest request, Guid userId, CancellationToken cancellationToken = default);
    Task<Result<TripResponse>> GetTripAsync(Guid tripId, Guid userId, CancellationToken cancellationToken = default);
    Task<Result<IEnumerable<TripResponse>>> GetUserTripsAsync(Guid userId, bool includeArchived = false, CancellationToken cancellationToken = default);
    Task<Result<TripResponse>> UpdateTripAsync(Guid tripId, UpdateTripRequest request, Guid userId, CancellationToken cancellationToken = default);
    Task<Result> ArchiveTripAsync(Guid tripId, ArchiveTripRequest request, Guid userId, CancellationToken cancellationToken = default);
    Task<Result> DeleteTripAsync(Guid tripId, Guid userId, CancellationToken cancellationToken = default);
}
