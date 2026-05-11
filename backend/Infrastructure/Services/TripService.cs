using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Application.Common.Models;
using Application.DTOs.Trip;
using Application.Services;
using Domain.Entities;
using Domain.Interfaces;
using Mapster;

namespace Infrastructure.Services;

public class TripService : ITripService
{
    private readonly ITripRepository _tripRepository;

    public TripService(ITripRepository tripRepository)
    {
        _tripRepository = tripRepository;
    }

    public async Task<Result<TripResponse>> CreateTripAsync(CreateTripRequest request, Guid userId, CancellationToken cancellationToken = default)
    {
        try
        {
            var travelCompanionsJson = request.TravelCompanions != null && request.TravelCompanions.Any()
                ? JsonDocument.Parse(JsonSerializer.Serialize(request.TravelCompanions))
                : null;

            var trip = new Trip(
                userId,
                request.Title,
                request.Destination,
                request.StartDate,
                request.EndDate,
                request.TravelType,
                request.Purpose,
                request.Notes,
                travelCompanionsJson
            );

            await _tripRepository.AddAsync(trip, cancellationToken);
            await _tripRepository.SaveChangesAsync(cancellationToken);

            var response = trip.Adapt<TripResponse>();
            
            // Manually map TravelCompanions to avoid Mapster issues with JsonDocument
            if (trip.TravelCompanions != null)
            {
                response.TravelCompanions = JsonSerializer.Deserialize<List<string>>(trip.TravelCompanions.RootElement.GetRawText());
            }

            return Result<TripResponse>.Success(response);
        }
        catch (ArgumentException ex)
        {
            return Result<TripResponse>.Failure(ex.Message);
        }
        catch (Exception ex)
        {
            // Log the detailed error (simulated here since I can't see logs)
            // Returning the message helps debug the 500 error
            return Result<TripResponse>.Failure($"Internal Server Error: {ex.Message}");
        }
    }

    public async Task<Result<TripResponse>> GetTripAsync(Guid tripId, Guid userId, CancellationToken cancellationToken = default)
    {
        var trip = await _tripRepository.GetByIdAndUserIdAsync(tripId, userId, cancellationToken);
        if (trip == null)
            return Result<TripResponse>.Failure("Trip not found.");

        return Result<TripResponse>.Success(trip.Adapt<TripResponse>());
    }

    public async Task<Result<IEnumerable<TripResponse>>> GetUserTripsAsync(Guid userId, bool includeArchived = false, CancellationToken cancellationToken = default)
    {
        var trips = await _tripRepository.GetByUserIdAsync(userId, includeArchived, cancellationToken);
        var responses = trips.Select(t => t.Adapt<TripResponse>());
        return Result<IEnumerable<TripResponse>>.Success(responses);
    }

    public async Task<Result<TripResponse>> UpdateTripAsync(Guid tripId, UpdateTripRequest request, Guid userId, CancellationToken cancellationToken = default)
    {
        var trip = await _tripRepository.GetByIdAndUserIdAsync(tripId, userId, cancellationToken);
        if (trip == null)
            return Result<TripResponse>.Failure("Trip not found.");

        try
        {
            trip.UpdateDetails(
                request.Title ?? trip.Title,
                request.Destination ?? trip.Destination,
                request.StartDate ?? trip.StartDate,
                request.EndDate ?? trip.EndDate,
                request.TravelType ?? trip.TravelType,
                request.Purpose ?? trip.Purpose,
                request.Notes ?? trip.Notes,
                request.TravelCompanions != null ? JsonDocument.Parse(JsonSerializer.Serialize(request.TravelCompanions)) : trip.TravelCompanions
            );

            _tripRepository.Update(trip);
            await _tripRepository.SaveChangesAsync(cancellationToken);

            return Result<TripResponse>.Success(trip.Adapt<TripResponse>());
        }
        catch (ArgumentException ex)
        {
            return Result<TripResponse>.Failure(ex.Message);
        }
    }

    public async Task<Result> ArchiveTripAsync(Guid tripId, ArchiveTripRequest request, Guid userId, CancellationToken cancellationToken = default)
    {
        var trip = await _tripRepository.GetByIdAndUserIdAsync(tripId, userId, cancellationToken);
        if (trip == null)
            return Result.Failure("Trip not found.");

        trip.SetArchiveStatus(request.IsArchived);

        _tripRepository.Update(trip);
        await _tripRepository.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }

    public async Task<Result> DeleteTripAsync(Guid tripId, Guid userId, CancellationToken cancellationToken = default)
    {
        var trip = await _tripRepository.GetByIdAndUserIdAsync(tripId, userId, cancellationToken);
        if (trip == null)
            return Result.Failure("Trip not found.");

        await _tripRepository.DeleteAsync(tripId, cancellationToken);
        await _tripRepository.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
