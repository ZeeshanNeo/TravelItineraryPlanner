using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Application.Common.Models;
using Application.DTOs.Booking;
using Application.Services;
using Domain.Entities;
using Domain.Interfaces;
using Mapster;

namespace Infrastructure.Services;

public class BookingService : IBookingService
{
    private readonly IBookingRepository _bookingRepository;
    private readonly ITripRepository _tripRepository;
    private readonly IActivityRepository _activityRepository;

    public BookingService(
        IBookingRepository bookingRepository,
        ITripRepository tripRepository,
        IActivityRepository activityRepository)
    {
        _bookingRepository = bookingRepository;
        _tripRepository = tripRepository;
        _activityRepository = activityRepository;
    }

    public async Task<Result<BookingResponse>> CreateBookingAsync(CreateBookingRequest request, Guid userId, CancellationToken cancellationToken = default)
    {
        var trip = await _tripRepository.GetByIdAndUserIdAsync(request.TripId, userId, cancellationToken);
        if (trip == null)
            return Result<BookingResponse>.Failure("Trip not found or you don't have permission to access it.");

        if (request.ActivityId.HasValue)
        {
            var activity = await _activityRepository.GetByIdAndTripIdAsync(request.ActivityId.Value, request.TripId, cancellationToken);
            if (activity == null)
                return Result<BookingResponse>.Failure("Activity not found or doesn't belong to the specified trip.");
        }

        try
        {
            var booking = new Booking(
                request.TripId,
                request.Category,
                request.Title,
                request.Description,
                request.StartDate,
                request.EndDate,
                request.TimeZone,
                request.Location,
                request.Address,
                request.Provider,
                request.ConfirmationCode,
                request.Cost,
                request.Currency,
                request.Notes,
                request.ContactInfo,
                request.ActivityId
            );

            if (request.Status != BookingStatus.Pending)
                booking.UpdateStatus(request.Status);

            await _bookingRepository.AddAsync(booking, cancellationToken);
            await _bookingRepository.SaveChangesAsync(cancellationToken);

            return Result<BookingResponse>.Success(booking.Adapt<BookingResponse>());
        }
        catch (ArgumentException ex)
        {
            return Result<BookingResponse>.Failure(ex.Message);
        }
    }

    public async Task<Result<BookingResponse>> GetBookingAsync(Guid bookingId, Guid userId, CancellationToken cancellationToken = default)
    {
        var booking = await _bookingRepository.GetByIdAndUserIdAsync(bookingId, userId, cancellationToken);
        if (booking == null)
            return Result<BookingResponse>.Failure("Booking not found or you don't have permission to access it.");

        return Result<BookingResponse>.Success(booking.Adapt<BookingResponse>());
    }

    public async Task<Result<IEnumerable<BookingResponse>>> GetUserBookingsAsync(
        Guid userId,
        Guid? tripId = null,
        string? category = null,
        string? status = null,
        bool includeArchived = false,
        CancellationToken cancellationToken = default)
    {
        BookingCategory? categoryEnum = null;
        if (!string.IsNullOrEmpty(category) && Enum.TryParse<BookingCategory>(category, true, out var parsedCategory))
        {
            categoryEnum = parsedCategory;
        }

        BookingStatus? statusEnum = null;
        if (!string.IsNullOrEmpty(status) && Enum.TryParse<BookingStatus>(status, true, out var parsedStatus))
        {
            statusEnum = parsedStatus;
        }

        var bookings = await _bookingRepository.GetByUserIdWithFiltersAsync(
            userId,
            tripId,
            null, // activityId
            categoryEnum,
            statusEnum,
            includeArchived ? null : false,
            cancellationToken);

        return Result<IEnumerable<BookingResponse>>.Success(bookings.Select(b => b.Adapt<BookingResponse>()));
    }

    public async Task<Result<BookingResponse>> UpdateBookingAsync(Guid bookingId, UpdateBookingRequest request, Guid userId, CancellationToken cancellationToken = default)
    {
        var booking = await _bookingRepository.GetByIdAndUserIdAsync(bookingId, userId, cancellationToken);
        if (booking == null)
            return Result<BookingResponse>.Failure("Booking not found or you don't have permission to access it.");

        if (request.TripId.HasValue && request.TripId.Value != booking.TripId)
        {
            var trip = await _tripRepository.GetByIdAndUserIdAsync(request.TripId.Value, userId, cancellationToken);
            if (trip == null)
                return Result<BookingResponse>.Failure("New trip not found or you don't have permission to access it.");
        }

        if (request.ActivityId.HasValue && request.ActivityId.Value != booking.ActivityId && request.ActivityId.Value != Guid.Empty)
        {
            var activity = await _activityRepository.GetByIdAndTripIdAsync(request.ActivityId.Value, request.TripId ?? booking.TripId, cancellationToken);
            if (activity == null)
                return Result<BookingResponse>.Failure("Activity not found or doesn't belong to the trip.");
        }

        try
        {
            booking.UpdateDetails(
                request.Title ?? booking.Title,
                request.Description ?? booking.Description,
                request.Category ?? booking.Category,
                request.StartDate ?? booking.StartDate,
                request.EndDate ?? booking.EndDate,
                request.TimeZone ?? booking.TimeZone,
                request.Location ?? booking.Location,
                request.Address ?? booking.Address,
                request.Provider ?? booking.Provider,
                request.ConfirmationCode ?? booking.ConfirmationCode,
                request.Cost ?? booking.Cost,
                request.Currency ?? booking.Currency,
                request.Notes ?? booking.Notes,
                request.ContactInfo ?? booking.ContactInfo,
                request.ActivityId == Guid.Empty ? null : (request.ActivityId ?? booking.ActivityId)
            );

            if (request.Status.HasValue)
                booking.UpdateStatus(request.Status.Value);

            if (request.IsArchived.HasValue)
                booking.SetArchiveStatus(request.IsArchived.Value);

            await _bookingRepository.SaveChangesAsync(cancellationToken);

            return Result<BookingResponse>.Success(booking.Adapt<BookingResponse>());
        }
        catch (ArgumentException ex)
        {
            return Result<BookingResponse>.Failure(ex.Message);
        }
    }

    public async Task<Result> ArchiveBookingAsync(Guid bookingId, bool isArchived, Guid userId, CancellationToken cancellationToken = default)
    {
        var booking = await _bookingRepository.GetByIdAndUserIdAsync(bookingId, userId, cancellationToken);
        if (booking == null)
            return Result.Failure("Booking not found or you don't have permission to access it.");

        booking.SetArchiveStatus(isArchived);

        await _bookingRepository.SaveChangesAsync(cancellationToken);
        return Result.Success();
    }

    public async Task<Result> DeleteBookingAsync(Guid bookingId, Guid userId, CancellationToken cancellationToken = default)
    {
        var booking = await _bookingRepository.GetByIdAndUserIdAsync(bookingId, userId, cancellationToken);
        if (booking == null)
            return Result.Failure("Booking not found or you don't have permission to access it.");

        await _bookingRepository.DeleteAsync(bookingId, cancellationToken);
        await _bookingRepository.SaveChangesAsync(cancellationToken);
        return Result.Success();
    }

    public async Task<Result<BookingSummaryResponse>> GetBookingSummaryAsync(Guid userId, Guid tripId, CancellationToken cancellationToken = default)
    {
        var trip = await _tripRepository.GetByIdAndUserIdAsync(tripId, userId, cancellationToken);
        if (trip == null)
            return Result<BookingSummaryResponse>.Failure("Trip not found or you don't have permission to access it.");

        var bookings = await _bookingRepository.GetByUserIdWithFiltersAsync(
            userId,
            tripId,
            null,
            null,
            null,
            null,
            cancellationToken);

        var list = bookings.ToList();

        return Result<BookingSummaryResponse>.Success(new BookingSummaryResponse
        {
            TotalBookings = list.Count,
            ConfirmedCount = list.Count(b => b.Status == BookingStatus.Confirmed),
            PendingCount = list.Count(b => b.Status == BookingStatus.Pending),
            TotalCost = list.Sum(b => b.Cost ?? 0)
        });
    }
}