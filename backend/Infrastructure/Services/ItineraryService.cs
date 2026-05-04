using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Application.DTOs.Itinerary;
using Application.DTOs.ItineraryDay;
using Application.DTOs.Activity;
using Application.Services;
using Domain.Entities;
using Domain.Interfaces;

namespace Infrastructure.Services;

public class ItineraryService : IItineraryService
{
    private readonly IItineraryRepository _itineraryRepository;
    private readonly IItineraryDayRepository _itineraryDayRepository;
    private readonly IActivityRepository _activityRepository;
    private readonly ITripRepository _tripRepository;

    public ItineraryService(
        IItineraryRepository itineraryRepository,
        IItineraryDayRepository itineraryDayRepository,
        IActivityRepository activityRepository,
        ITripRepository tripRepository)
    {
        _itineraryRepository = itineraryRepository;
        _itineraryDayRepository = itineraryDayRepository;
        _activityRepository = activityRepository;
        _tripRepository = tripRepository;
    }

    // Itinerary operations
    public async Task<ItineraryResponse> CreateItineraryAsync(CreateItineraryRequest request, Guid userId, CancellationToken cancellationToken = default)
    {
        // Verify trip exists and belongs to user
        var trip = await _tripRepository.GetByIdAndUserIdAsync(request.TripId, userId, cancellationToken);
        if (trip == null)
            throw new KeyNotFoundException("Trip not found or you don't have access to it.");

        var totalDays = (int)(request.EndDate - request.StartDate).TotalDays + 1;

        var itinerary = new Itinerary
        {
            TripId = request.TripId,
            Title = request.Title,
            Description = request.Description,
            StartDate = request.StartDate,
            EndDate = request.EndDate,
            TotalDays = totalDays,
            TimeZone = request.TimeZone,
            Tags = SerializeTags(request.Tags),
            IsPublic = request.IsPublic,
            IsArchived = false,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _itineraryRepository.AddAsync(itinerary, cancellationToken);
        await _itineraryRepository.SaveChangesAsync(cancellationToken);

        return MapToResponse(itinerary);
    }

    public async Task<ItineraryResponse> GetItineraryAsync(Guid itineraryId, Guid userId, CancellationToken cancellationToken = default)
    {
        var itinerary = await _itineraryRepository.GetByIdAndUserIdAsync(itineraryId, userId, cancellationToken);
        if (itinerary == null)
            throw new KeyNotFoundException("Itinerary not found or you don't have access to it.");

        return MapToResponse(itinerary);
    }

    public async Task<IEnumerable<ItineraryResponse>> GetItinerariesByTripAsync(Guid tripId, Guid userId, bool includeArchived = false, CancellationToken cancellationToken = default)
    {
        // Verify trip belongs to user
        var trip = await _tripRepository.GetByIdAndUserIdAsync(tripId, userId, cancellationToken);
        if (trip == null)
            throw new KeyNotFoundException("Trip not found or you don't have access to it.");

        var itineraries = await _itineraryRepository.GetByTripIdAsync(tripId, includeArchived, cancellationToken);
        return itineraries.Select(MapToResponse);
    }

    public async Task<IEnumerable<ItineraryResponse>> GetItinerariesByUserAsync(Guid userId, bool includeArchived = false, CancellationToken cancellationToken = default)
    {
        var itineraries = await _itineraryRepository.GetByUserIdAsync(userId, includeArchived, cancellationToken);
        return itineraries.Select(MapToResponse);
    }

    public async Task<ItineraryResponse> UpdateItineraryAsync(Guid itineraryId, UpdateItineraryRequest request, Guid userId, CancellationToken cancellationToken = default)
    {
        var itinerary = await _itineraryRepository.GetByIdAndUserIdAsync(itineraryId, userId, cancellationToken);
        if (itinerary == null)
            throw new KeyNotFoundException("Itinerary not found or you don't have access to it.");

        if (request.Title != null) itinerary.Title = request.Title;
        if (request.Description != null) itinerary.Description = request.Description;
        if (request.StartDate.HasValue) itinerary.StartDate = request.StartDate.Value;
        if (request.EndDate.HasValue) itinerary.EndDate = request.EndDate.Value;
        if (request.TimeZone != null) itinerary.TimeZone = request.TimeZone;
        if (request.Tags != null) itinerary.Tags = SerializeTags(request.Tags);
        if (request.IsPublic.HasValue) itinerary.IsPublic = request.IsPublic.Value;

        // Recalculate total days if dates changed
        if (request.StartDate.HasValue || request.EndDate.HasValue)
        {
            itinerary.TotalDays = (int)(itinerary.EndDate - itinerary.StartDate).TotalDays + 1;
        }

        itinerary.UpdatedAt = DateTime.UtcNow;

        _itineraryRepository.Update(itinerary);
        await _itineraryRepository.SaveChangesAsync(cancellationToken);

        return MapToResponse(itinerary);
    }

    public async Task ArchiveItineraryAsync(Guid itineraryId, Guid userId, CancellationToken cancellationToken = default)
    {
        var itinerary = await _itineraryRepository.GetByIdAndUserIdAsync(itineraryId, userId, cancellationToken);
        if (itinerary == null)
            throw new KeyNotFoundException("Itinerary not found or you don't have access to it.");

        itinerary.IsArchived = true;
        itinerary.UpdatedAt = DateTime.UtcNow;

        _itineraryRepository.Update(itinerary);
        await _itineraryRepository.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteItineraryAsync(Guid itineraryId, Guid userId, CancellationToken cancellationToken = default)
    {
        var itinerary = await _itineraryRepository.GetByIdAndUserIdAsync(itineraryId, userId, cancellationToken);
        if (itinerary == null)
            throw new KeyNotFoundException("Itinerary not found or you don't have access to it.");

        await _itineraryRepository.DeleteAsync(itineraryId, cancellationToken);
        await _itineraryRepository.SaveChangesAsync(cancellationToken);
    }

    // ItineraryDay operations
    public async Task<ItineraryDayResponse> CreateItineraryDayAsync(CreateItineraryDayRequest request, Guid userId, CancellationToken cancellationToken = default)
    {
        // Verify itinerary exists and belongs to user
        var itinerary = await _itineraryRepository.GetByIdAndUserIdAsync(request.ItineraryId, userId, cancellationToken);
        if (itinerary == null)
            throw new KeyNotFoundException("Itinerary not found or you don't have access to it.");

        var day = new ItineraryDay
        {
            ItineraryId = request.ItineraryId,
            DayNumber = request.DayNumber,
            Date = request.Date,
            Title = request.Title,
            Notes = request.Notes,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _itineraryDayRepository.AddAsync(day, cancellationToken);
        await _itineraryDayRepository.SaveChangesAsync(cancellationToken);

        return MapToResponse(day);
    }

    public async Task<ItineraryDayResponse> GetItineraryDayAsync(Guid dayId, Guid userId, CancellationToken cancellationToken = default)
    {
        var day = await _itineraryDayRepository.GetByIdAndUserIdAsync(dayId, userId, cancellationToken);
        if (day == null)
            throw new KeyNotFoundException("Day not found or you don't have access to it.");

        return MapToResponse(day);
    }

    public async Task<IEnumerable<ItineraryDayResponse>> GetItineraryDaysAsync(Guid itineraryId, Guid userId, CancellationToken cancellationToken = default)
    {
        // Verify itinerary belongs to user
        var itinerary = await _itineraryRepository.GetByIdAndUserIdAsync(itineraryId, userId, cancellationToken);
        if (itinerary == null)
            throw new KeyNotFoundException("Itinerary not found or you don't have access to it.");

        var days = await _itineraryDayRepository.GetByItineraryIdAsync(itineraryId, cancellationToken);
        return days.Select(MapToResponse);
    }

    public async Task<ItineraryDayResponse> UpdateItineraryDayAsync(Guid dayId, UpdateItineraryDayRequest request, Guid userId, CancellationToken cancellationToken = default)
    {
        var day = await _itineraryDayRepository.GetByIdAndUserIdAsync(dayId, userId, cancellationToken);
        if (day == null)
            throw new KeyNotFoundException("Day not found or you don't have access to it.");

        if (request.DayNumber.HasValue) day.DayNumber = request.DayNumber.Value;
        if (request.Date.HasValue) day.Date = request.Date.Value;
        if (request.Title != null) day.Title = request.Title;
        if (request.Notes != null) day.Notes = request.Notes;

        day.UpdatedAt = DateTime.UtcNow;

        _itineraryDayRepository.Update(day);
        await _itineraryDayRepository.SaveChangesAsync(cancellationToken);

        return MapToResponse(day);
    }

    public async Task DeleteItineraryDayAsync(Guid dayId, Guid userId, CancellationToken cancellationToken = default)
    {
        var day = await _itineraryDayRepository.GetByIdAndUserIdAsync(dayId, userId, cancellationToken);
        if (day == null)
            throw new KeyNotFoundException("Day not found or you don't have access to it.");

        await _itineraryDayRepository.DeleteAsync(dayId, cancellationToken);
        await _itineraryDayRepository.SaveChangesAsync(cancellationToken);
    }

    // Activity operations
    public async Task<ActivityResponse> CreateActivityAsync(CreateActivityRequest request, Guid userId, CancellationToken cancellationToken = default)
    {
        // Verify day exists and belongs to user
        var day = await _itineraryDayRepository.GetByIdAndUserIdAsync(request.ItineraryDayId, userId, cancellationToken);
        if (day == null)
            throw new KeyNotFoundException("Day not found or you don't have access to it.");

        var activity = new Activity
        {
            ItineraryDayId = request.ItineraryDayId,
            Title = request.Title,
            Description = request.Description,
            ActivityType = request.ActivityType,
            StartTime = request.StartTime,
            EndTime = request.EndTime,
            Location = request.Location,
            Address = request.Address,
            Cost = request.Cost,
            Currency = request.Currency,
            Notes = request.Notes,
            Order = request.Order,
            TravelTimeMinutes = request.TravelTimeMinutes,
            IsFlexible = request.IsFlexible,
            BookingReference = request.BookingReference,
            ContactInfo = request.ContactInfo,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _activityRepository.AddAsync(activity, cancellationToken);
        await _activityRepository.SaveChangesAsync(cancellationToken);

        return MapToResponse(activity);
    }

    public async Task<ActivityResponse> GetActivityAsync(Guid activityId, Guid userId, CancellationToken cancellationToken = default)
    {
        var activity = await _activityRepository.GetByIdAndUserIdAsync(activityId, userId, cancellationToken);
        if (activity == null)
            throw new KeyNotFoundException("Activity not found or you don't have access to it.");

        return MapToResponse(activity);
    }

    public async Task<IEnumerable<ActivityResponse>> GetActivitiesByDayAsync(Guid dayId, Guid userId, CancellationToken cancellationToken = default)
    {
        // Verify day belongs to user
        var day = await _itineraryDayRepository.GetByIdAndUserIdAsync(dayId, userId, cancellationToken);
        if (day == null)
            throw new KeyNotFoundException("Day not found or you don't have access to it.");

        var activities = await _activityRepository.GetByItineraryDayIdAsync(dayId, cancellationToken);
        return activities.Select(MapToResponse);
    }

    public async Task<ActivityResponse> UpdateActivityAsync(Guid activityId, UpdateActivityRequest request, Guid userId, CancellationToken cancellationToken = default)
    {
        var activity = await _activityRepository.GetByIdAndUserIdAsync(activityId, userId, cancellationToken);
        if (activity == null)
            throw new KeyNotFoundException("Activity not found or you don't have access to it.");

        if (request.Title != null) activity.Title = request.Title;
        if (request.Description != null) activity.Description = request.Description;
        if (request.ActivityType.HasValue) activity.ActivityType = request.ActivityType.Value;
        if (request.StartTime.HasValue) activity.StartTime = request.StartTime.Value;
        if (request.EndTime.HasValue) activity.EndTime = request.EndTime.Value;
        if (request.Location != null) activity.Location = request.Location;
        if (request.Address != null) activity.Address = request.Address;
        if (request.Cost.HasValue) activity.Cost = request.Cost.Value;
        if (request.Currency != null) activity.Currency = request.Currency;
        if (request.Notes != null) activity.Notes = request.Notes;
        if (request.Order.HasValue) activity.Order = request.Order.Value;
        if (request.TravelTimeMinutes.HasValue) activity.TravelTimeMinutes = request.TravelTimeMinutes.Value;
        if (request.IsFlexible.HasValue) activity.IsFlexible = request.IsFlexible.Value;
        if (request.BookingReference != null) activity.BookingReference = request.BookingReference;
        if (request.ContactInfo != null) activity.ContactInfo = request.ContactInfo;

        activity.UpdatedAt = DateTime.UtcNow;

        _activityRepository.Update(activity);
        await _activityRepository.SaveChangesAsync(cancellationToken);

        return MapToResponse(activity);
    }

    public async Task DeleteActivityAsync(Guid activityId, Guid userId, CancellationToken cancellationToken = default)
    {
        var activity = await _activityRepository.GetByIdAndUserIdAsync(activityId, userId, cancellationToken);
        if (activity == null)
            throw new KeyNotFoundException("Activity not found or you don't have access to it.");

        await _activityRepository.DeleteAsync(activityId, cancellationToken);
        await _activityRepository.SaveChangesAsync(cancellationToken);
    }

    public async Task ReorderActivitiesAsync(Guid dayId, List<Guid> activityIdsInOrder, Guid userId, CancellationToken cancellationToken = default)
    {
        // Verify day belongs to user
        var day = await _itineraryDayRepository.GetByIdAndUserIdAsync(dayId, userId, cancellationToken);
        if (day == null)
            throw new KeyNotFoundException("Day not found or you don't have access to it.");

        await _activityRepository.UpdateOrderAsync(dayId, activityIdsInOrder, cancellationToken);
        await _activityRepository.SaveChangesAsync(cancellationToken);
    }

    // Helper methods
    private static JsonDocument? SerializeTags(List<string>? tags)
    {
        if (tags == null) return null;
        return JsonDocument.Parse(JsonSerializer.Serialize(tags));
    }

    private static List<string>? DeserializeTags(JsonDocument? document)
    {
        if (document == null) return null;
        return JsonSerializer.Deserialize<List<string>>(document.RootElement.GetRawText());
    }

    private static ItineraryResponse MapToResponse(Itinerary itinerary)
    {
        return new ItineraryResponse
        {
            Id = itinerary.Id,
            TripId = itinerary.TripId,
            Title = itinerary.Title,
            Description = itinerary.Description,
            StartDate = itinerary.StartDate,
            EndDate = itinerary.EndDate,
            TotalDays = itinerary.TotalDays,
            TimeZone = itinerary.TimeZone,
            Tags = DeserializeTags(itinerary.Tags),
            IsPublic = itinerary.IsPublic,
            IsArchived = itinerary.IsArchived,
            CreatedAt = itinerary.CreatedAt,
            UpdatedAt = itinerary.UpdatedAt,
            Days = itinerary.Days?.Select(MapToResponse).ToList() ?? new List<ItineraryDayResponse>()
        };
    }

    private static ItineraryDayResponse MapToResponse(ItineraryDay day)
    {
        return new ItineraryDayResponse
        {
            Id = day.Id,
            ItineraryId = day.ItineraryId,
            DayNumber = day.DayNumber,
            Date = day.Date,
            Title = day.Title,
            Notes = day.Notes,
            CreatedAt = day.CreatedAt,
            UpdatedAt = day.UpdatedAt,
            Activities = day.Activities?.Select(MapToResponse).OrderBy(a => a.Order).ToList() ?? new List<ActivityResponse>()
        };
    }

    private static ActivityResponse MapToResponse(Activity activity)
    {
        return new ActivityResponse
        {
            Id = activity.Id,
            ItineraryDayId = activity.ItineraryDayId,
            Title = activity.Title,
            Description = activity.Description,
            ActivityType = activity.ActivityType,
            StartTime = activity.StartTime,
            EndTime = activity.EndTime,
            Location = activity.Location,
            Address = activity.Address,
            Cost = activity.Cost,
            Currency = activity.Currency,
            Notes = activity.Notes,
            Order = activity.Order,
            TravelTimeMinutes = activity.TravelTimeMinutes,
            IsFlexible = activity.IsFlexible,
            BookingReference = activity.BookingReference,
            ContactInfo = activity.ContactInfo,
            CreatedAt = activity.CreatedAt,
            UpdatedAt = activity.UpdatedAt
        };
    }
}