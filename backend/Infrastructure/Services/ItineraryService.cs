using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Application.Common.Models;
using Application.DTOs.Itinerary;
using Application.DTOs.ItineraryDay;
using Application.DTOs.Activity;
using Application.Services;
using Domain.Entities;
using Domain.Interfaces;
using Application.Common.Interfaces;
using Mapster;

namespace Infrastructure.Services;

public class ItineraryService : IItineraryService
{
    private readonly IItineraryRepository _itineraryRepository;
    private readonly IItineraryDayRepository _itineraryDayRepository;
    private readonly IActivityRepository _activityRepository;
    private readonly ITripRepository _tripRepository;
    private readonly IWeatherService _weatherService;
    private readonly ITimeZoneService _timeZoneService;

    public ItineraryService(
        IItineraryRepository itineraryRepository,
        IItineraryDayRepository itineraryDayRepository,
        IActivityRepository activityRepository,
        ITripRepository tripRepository,
        IWeatherService weatherService,
        ITimeZoneService timeZoneService)
    {
        _itineraryRepository = itineraryRepository;
        _itineraryDayRepository = itineraryDayRepository;
        _activityRepository = activityRepository;
        _tripRepository = tripRepository;
        _weatherService = weatherService;
        _timeZoneService = timeZoneService;
    }

    // Itinerary operations
    public async Task<Result<ItineraryResponse>> CreateItineraryAsync(CreateItineraryRequest request, Guid userId, CancellationToken cancellationToken = default)
    {
        var trip = await _tripRepository.GetByIdAndUserIdAsync(request.TripId, userId, cancellationToken);
        if (trip == null)
            return Result<ItineraryResponse>.Failure("Trip not found or you don't have access to it.");

        try
        {
            var itinerary = new Itinerary(
                request.TripId,
                request.Title,
                request.Description,
                request.StartDate,
                request.EndDate,
                request.TimeZone,
                request.Tags != null ? JsonDocument.Parse(JsonSerializer.Serialize(request.Tags)) : null,
                request.IsPublic
            );

            await _itineraryRepository.AddAsync(itinerary, cancellationToken);
            await _itineraryRepository.SaveChangesAsync(cancellationToken);

            return Result<ItineraryResponse>.Success(itinerary.Adapt<ItineraryResponse>());
        }
        catch (ArgumentException ex)
        {
            return Result<ItineraryResponse>.Failure(ex.Message);
        }
    }

    public async Task<Result<ItineraryResponse>> GetItineraryAsync(Guid itineraryId, Guid userId, CancellationToken cancellationToken = default)
    {
        var itinerary = await _itineraryRepository.GetByIdAndUserIdAsync(itineraryId, userId, cancellationToken);
        if (itinerary == null)
            return Result<ItineraryResponse>.Failure("Itinerary not found or you don't have access to it.");

        return Result<ItineraryResponse>.Success(itinerary.Adapt<ItineraryResponse>());
    }

    public async Task<Result<IEnumerable<ItineraryResponse>>> GetItinerariesByTripAsync(Guid tripId, Guid userId, bool includeArchived = false, CancellationToken cancellationToken = default)
    {
        var trip = await _tripRepository.GetByIdAndUserIdAsync(tripId, userId, cancellationToken);
        if (trip == null)
            return Result<IEnumerable<ItineraryResponse>>.Failure("Trip not found or you don't have access to it.");

        var itineraries = await _itineraryRepository.GetByTripIdAsync(tripId, includeArchived, cancellationToken);
        return Result<IEnumerable<ItineraryResponse>>.Success(itineraries.Select(i => i.Adapt<ItineraryResponse>()));
    }

    public async Task<Result<IEnumerable<ItineraryResponse>>> GetItinerariesByUserAsync(Guid userId, bool includeArchived = false, CancellationToken cancellationToken = default)
    {
        var itineraries = await _itineraryRepository.GetByUserIdAsync(userId, includeArchived, cancellationToken);
        return Result<IEnumerable<ItineraryResponse>>.Success(itineraries.Select(i => i.Adapt<ItineraryResponse>()));
    }

    public async Task<Result<ItineraryResponse>> UpdateItineraryAsync(Guid itineraryId, UpdateItineraryRequest request, Guid userId, CancellationToken cancellationToken = default)
    {
        var itinerary = await _itineraryRepository.GetByIdAndUserIdAsync(itineraryId, userId, cancellationToken);
        if (itinerary == null)
            return Result<ItineraryResponse>.Failure("Itinerary not found or you don't have access to it.");

        try
        {
            itinerary.UpdateDetails(
                request.Title ?? itinerary.Title,
                request.Description ?? itinerary.Description,
                request.StartDate ?? itinerary.StartDate,
                request.EndDate ?? itinerary.EndDate,
                request.TimeZone ?? itinerary.TimeZone,
                request.Tags != null ? JsonDocument.Parse(JsonSerializer.Serialize(request.Tags)) : itinerary.Tags,
                request.IsPublic
            );

            if (request.IsArchived.HasValue)
                itinerary.SetArchiveStatus(request.IsArchived.Value);

            _itineraryRepository.Update(itinerary);
            await _itineraryRepository.SaveChangesAsync(cancellationToken);

            return Result<ItineraryResponse>.Success(itinerary.Adapt<ItineraryResponse>());
        }
        catch (ArgumentException ex)
        {
            return Result<ItineraryResponse>.Failure(ex.Message);
        }
    }

    public async Task<Result> ArchiveItineraryAsync(Guid itineraryId, Guid userId, CancellationToken cancellationToken = default)
    {
        var itinerary = await _itineraryRepository.GetByIdAndUserIdAsync(itineraryId, userId, cancellationToken);
        if (itinerary == null)
            return Result.Failure("Itinerary not found or you don't have access to it.");

        itinerary.SetArchiveStatus(true);

        _itineraryRepository.Update(itinerary);
        await _itineraryRepository.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }

    public async Task<Result> DeleteItineraryAsync(Guid itineraryId, Guid userId, CancellationToken cancellationToken = default)
    {
        var itinerary = await _itineraryRepository.GetByIdAndUserIdAsync(itineraryId, userId, cancellationToken);
        if (itinerary == null)
            return Result.Failure("Itinerary not found or you don't have access to it.");

        await _itineraryRepository.DeleteAsync(itineraryId, cancellationToken);
        await _itineraryRepository.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }

    public async Task<Result<string>> GenerateShareLinkAsync(Guid itineraryId, Guid userId, CancellationToken cancellationToken = default)
    {
        var itinerary = await _itineraryRepository.GetByIdAndUserIdAsync(itineraryId, userId, cancellationToken);
        if (itinerary == null)
            return Result<string>.Failure("Itinerary not found.");

        itinerary.GenerateShareToken();
        _itineraryRepository.Update(itinerary);
        await _itineraryRepository.SaveChangesAsync(cancellationToken);

        return Result<string>.Success(itinerary.ShareToken!);
    }

    public async Task<Result> RevokeShareLinkAsync(Guid itineraryId, Guid userId, CancellationToken cancellationToken = default)
    {
        var itinerary = await _itineraryRepository.GetByIdAndUserIdAsync(itineraryId, userId, cancellationToken);
        if (itinerary == null)
            return Result.Failure("Itinerary not found.");

        itinerary.RevokeShareToken();
        _itineraryRepository.Update(itinerary);
        await _itineraryRepository.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }

    public async Task<Result<ItineraryResponse>> GetPublicItineraryAsync(string shareToken, CancellationToken cancellationToken = default)
    {
        var itinerary = await _itineraryRepository.GetByShareTokenAsync(shareToken, cancellationToken);
        if (itinerary == null)
            return Result<ItineraryResponse>.Failure("Invalid or expired share link.");

        return Result<ItineraryResponse>.Success(itinerary.Adapt<ItineraryResponse>());
    }

    public async Task<Result<WeatherForecastResponse>> GetItineraryWeatherAsync(Guid itineraryId, DateTime date, Guid userId, CancellationToken cancellationToken = default)
    {
        var itinerary = await _itineraryRepository.GetByIdAndUserIdAsync(itineraryId, userId, cancellationToken);
        if (itinerary == null)
            return Result<WeatherForecastResponse>.Failure("Itinerary not found.");

        var trip = itinerary.Trip; // Loaded via Include in GetByIdAndUserIdAsync
        var weather = await _weatherService.GetForecastAsync(trip.Destination, date);
        
        return weather != null 
            ? Result<WeatherForecastResponse>.Success(weather)
            : Result<WeatherForecastResponse>.Failure("Weather data unavailable.");
    }

    // ItineraryDay operations
    public async Task<Result<ItineraryDayResponse>> CreateItineraryDayAsync(CreateItineraryDayRequest request, Guid userId, CancellationToken cancellationToken = default)
    {
        var itinerary = await _itineraryRepository.GetByIdAndUserIdAsync(request.ItineraryId, userId, cancellationToken);
        if (itinerary == null)
            return Result<ItineraryDayResponse>.Failure("Itinerary not found or you don't have access to it.");

        var day = new ItineraryDay(
            request.ItineraryId,
            request.Date,
            request.DayNumber,
            request.Title,
            request.Notes
        );

        await _itineraryDayRepository.AddAsync(day, cancellationToken);
        await _itineraryDayRepository.SaveChangesAsync(cancellationToken);

        return Result<ItineraryDayResponse>.Success(day.Adapt<ItineraryDayResponse>());
    }

    public async Task<Result<ItineraryDayResponse>> GetItineraryDayAsync(Guid dayId, Guid userId, CancellationToken cancellationToken = default)
    {
        var day = await _itineraryDayRepository.GetByIdAndUserIdAsync(dayId, userId, cancellationToken);
        if (day == null)
            return Result<ItineraryDayResponse>.Failure("Day not found or you don't have access to it.");

        return Result<ItineraryDayResponse>.Success(day.Adapt<ItineraryDayResponse>());
    }

    public async Task<Result<IEnumerable<ItineraryDayResponse>>> GetItineraryDaysAsync(Guid itineraryId, Guid userId, CancellationToken cancellationToken = default)
    {
        var itinerary = await _itineraryRepository.GetByIdAndUserIdAsync(itineraryId, userId, cancellationToken);
        if (itinerary == null)
            return Result<IEnumerable<ItineraryDayResponse>>.Failure("Itinerary not found or you don't have access to it.");

        var days = await _itineraryDayRepository.GetByItineraryIdAsync(itineraryId, cancellationToken);
        return Result<IEnumerable<ItineraryDayResponse>>.Success(days.Select(d => d.Adapt<ItineraryDayResponse>()));
    }

    public async Task<Result<ItineraryDayResponse>> UpdateItineraryDayAsync(Guid dayId, UpdateItineraryDayRequest request, Guid userId, CancellationToken cancellationToken = default)
    {
        var day = await _itineraryDayRepository.GetByIdAndUserIdAsync(dayId, userId, cancellationToken);
        if (day == null)
            return Result<ItineraryDayResponse>.Failure("Day not found or you don't have access to it.");

        if (request.Date.HasValue || request.DayNumber.HasValue)
        {
            day.UpdateDate(
                request.Date ?? day.Date,
                request.DayNumber ?? day.DayNumber
            );
        }

        day.UpdateDetails(
            request.Title ?? day.Title,
            request.Notes ?? day.Notes
        );

        _itineraryDayRepository.Update(day);
        await _itineraryDayRepository.SaveChangesAsync(cancellationToken);

        return Result<ItineraryDayResponse>.Success(day.Adapt<ItineraryDayResponse>());
    }

    public async Task<Result> DeleteItineraryDayAsync(Guid dayId, Guid userId, CancellationToken cancellationToken = default)
    {
        var day = await _itineraryDayRepository.GetByIdAndUserIdAsync(dayId, userId, cancellationToken);
        if (day == null)
            return Result.Failure("Day not found or you don't have access to it.");

        await _itineraryDayRepository.DeleteAsync(dayId, cancellationToken);
        await _itineraryDayRepository.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }

    // Activity operations
    public async Task<Result<ActivityResponse>> CreateActivityAsync(CreateActivityRequest request, Guid userId, CancellationToken cancellationToken = default)
    {
        var day = await _itineraryDayRepository.GetByIdAndUserIdAsync(request.ItineraryDayId, userId, cancellationToken);
        if (day == null)
            return Result<ActivityResponse>.Failure("Day not found or you don't have access to it.");

        try
        {
            var activity = new Activity(
                request.ItineraryDayId,
                request.Title,
                request.Description,
                request.ActivityType,
                request.StartTime,
                request.EndTime,
                request.Location,
                request.Address,
                request.Cost,
                request.Currency,
                request.Notes,
                request.Order,
                request.TravelTimeMinutes,
                request.IsFlexible,
                request.BookingReference,
                request.ContactInfo
            );

            await _activityRepository.AddAsync(activity, cancellationToken);
            await _activityRepository.SaveChangesAsync(cancellationToken);

            return Result<ActivityResponse>.Success(activity.Adapt<ActivityResponse>());
        }
        catch (ArgumentException ex)
        {
            return Result<ActivityResponse>.Failure(ex.Message);
        }
    }

    public async Task<Result<ActivityResponse>> GetActivityAsync(Guid activityId, Guid userId, CancellationToken cancellationToken = default)
    {
        var activity = await _activityRepository.GetByIdAndUserIdAsync(activityId, userId, cancellationToken);
        if (activity == null)
            return Result<ActivityResponse>.Failure("Activity not found or you don't have access to it.");

        return Result<ActivityResponse>.Success(activity.Adapt<ActivityResponse>());
    }

    public async Task<Result<IEnumerable<ActivityResponse>>> GetActivitiesByDayAsync(Guid dayId, Guid userId, CancellationToken cancellationToken = default)
    {
        var day = await _itineraryDayRepository.GetByIdAndUserIdAsync(dayId, userId, cancellationToken);
        if (day == null)
            return Result<IEnumerable<ActivityResponse>>.Failure("Day not found or you don't have access to it.");

        var activities = await _activityRepository.GetByItineraryDayIdAsync(dayId, cancellationToken);
        return Result<IEnumerable<ActivityResponse>>.Success(activities.Select(a => a.Adapt<ActivityResponse>()));
    }

    public async Task<Result<ActivityResponse>> UpdateActivityAsync(Guid activityId, UpdateActivityRequest request, Guid userId, CancellationToken cancellationToken = default)
    {
        var activity = await _activityRepository.GetByIdAndUserIdAsync(activityId, userId, cancellationToken);
        if (activity == null)
            return Result<ActivityResponse>.Failure("Activity not found or you don't have access to it.");

        try
        {
            activity.UpdateDetails(
                request.Title ?? activity.Title,
                request.Description ?? activity.Description,
                request.ActivityType ?? activity.ActivityType,
                request.StartTime ?? activity.StartTime,
                request.EndTime ?? activity.EndTime,
                request.Location ?? activity.Location,
                request.Address ?? activity.Address,
                request.Cost ?? activity.Cost,
                request.Currency ?? activity.Currency,
                request.Notes ?? activity.Notes,
                request.Order ?? activity.Order,
                request.TravelTimeMinutes ?? activity.TravelTimeMinutes,
                request.IsFlexible ?? activity.IsFlexible,
                request.BookingReference ?? activity.BookingReference,
                request.ContactInfo ?? activity.ContactInfo
            );

            _activityRepository.Update(activity);
            await _activityRepository.SaveChangesAsync(cancellationToken);

            return Result<ActivityResponse>.Success(activity.Adapt<ActivityResponse>());
        }
        catch (ArgumentException ex)
        {
            return Result<ActivityResponse>.Failure(ex.Message);
        }
    }

    public async Task<Result> DeleteActivityAsync(Guid activityId, Guid userId, CancellationToken cancellationToken = default)
    {
        var activity = await _activityRepository.GetByIdAndUserIdAsync(activityId, userId, cancellationToken);
        if (activity == null)
            return Result.Failure("Activity not found or you don't have access to it.");

        await _activityRepository.DeleteAsync(activityId, cancellationToken);
        await _activityRepository.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }

    public async Task<Result> ReorderActivitiesAsync(Guid dayId, List<Guid> activityIdsInOrder, Guid userId, CancellationToken cancellationToken = default)
    {
        var day = await _itineraryDayRepository.GetByIdAndUserIdAsync(dayId, userId, cancellationToken);
        if (day == null)
            return Result.Failure("Day not found or you don't have access to it.");

        await _activityRepository.UpdateOrderAsync(dayId, activityIdsInOrder, cancellationToken);
        await _activityRepository.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}