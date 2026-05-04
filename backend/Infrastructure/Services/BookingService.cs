using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Application.DTOs.Booking;
using Application.Services;
using Domain.Entities;
using Domain.Interfaces;

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

    public async Task<BookingResponse> CreateBookingAsync(CreateBookingRequest request, Guid userId, CancellationToken cancellationToken = default)
    {
        // Validate that the trip exists and belongs to the user
        var trip = await _tripRepository.GetByIdAndUserIdAsync(request.TripId, userId, cancellationToken);
        if (trip == null)
            throw new KeyNotFoundException("Trip not found or you don't have permission to access it.");

        // If ActivityId is provided, validate it belongs to the same trip
        if (request.ActivityId.HasValue)
        {
            var activity = await _activityRepository.GetByIdAndTripIdAsync(request.ActivityId.Value, request.TripId, cancellationToken);
            if (activity == null)
                throw new KeyNotFoundException("Activity not found or doesn't belong to the specified trip.");
        }

        var booking = new Booking
        {
            TripId = request.TripId,
            ActivityId = request.ActivityId,
            Category = request.Category,
            Title = request.Title,
            Description = request.Description,
            Status = request.Status,
            StartDate = request.StartDate,
            EndDate = request.EndDate,
            TimeZone = request.TimeZone,
            Location = request.Location,
            Address = request.Address,
            Provider = request.Provider,
            ConfirmationCode = request.ConfirmationCode,
            Cost = request.Cost,
            Currency = request.Currency,
            Notes = request.Notes,
            ContactInfo = request.ContactInfo,
            IsArchived = false,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _bookingRepository.AddAsync(booking, cancellationToken);
        await _bookingRepository.SaveChangesAsync(cancellationToken);

        return MapToResponse(booking);
    }

    public async Task<BookingResponse?> GetBookingAsync(Guid bookingId, Guid userId, CancellationToken cancellationToken = default)
    {
        var booking = await _bookingRepository.GetByIdAndUserIdAsync(bookingId, userId, cancellationToken);
        if (booking == null)
            return null;

        return MapToResponse(booking);
    }

    public async Task<IEnumerable<BookingResponse>> GetUserBookingsAsync(
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
            includeArchived ? null : false, // if includeArchived is false, filter out archived
            cancellationToken);

        return bookings.Select(MapToResponse);
    }

    public async Task<BookingResponse> UpdateBookingAsync(Guid bookingId, UpdateBookingRequest request, Guid userId, CancellationToken cancellationToken = default)
    {
        var booking = await _bookingRepository.GetByIdAndUserIdAsync(bookingId, userId, cancellationToken);
        if (booking == null)
            throw new KeyNotFoundException("Booking not found or you don't have permission to access it.");

        // If TripId is being updated, validate the new trip belongs to the user
        if (request.TripId.HasValue && request.TripId.Value != booking.TripId)
        {
            var trip = await _tripRepository.GetByIdAndUserIdAsync(request.TripId.Value, userId, cancellationToken);
            if (trip == null)
                throw new KeyNotFoundException("Trip not found or you don't have permission to access it.");
            booking.TripId = request.TripId.Value;
        }

        // If ActivityId is being updated, validate it belongs to the trip
        if (request.ActivityId.HasValue && request.ActivityId.Value != booking.ActivityId)
        {
            if (request.ActivityId.Value == Guid.Empty)
            {
                booking.ActivityId = null;
            }
            else
            {
                var activity = await _activityRepository.GetByIdAndTripIdAsync(request.ActivityId.Value, booking.TripId, cancellationToken);
                if (activity == null)
                    throw new KeyNotFoundException("Activity not found or doesn't belong to the trip.");
                booking.ActivityId = request.ActivityId.Value;
            }
        }

        // Update other properties if provided
        if (request.Category.HasValue)
            booking.Category = request.Category.Value;

        if (!string.IsNullOrEmpty(request.Title))
            booking.Title = request.Title;

        if (request.Description != null)
            booking.Description = request.Description;

        if (request.Status.HasValue)
            booking.Status = request.Status.Value;

        if (request.StartDate.HasValue)
            booking.StartDate = request.StartDate.Value;

        if (request.EndDate.HasValue)
            booking.EndDate = request.EndDate.Value;

        if (request.TimeZone != null)
            booking.TimeZone = request.TimeZone;

        if (request.Location != null)
            booking.Location = request.Location;

        if (request.Address != null)
            booking.Address = request.Address;

        if (request.Provider != null)
            booking.Provider = request.Provider;

        if (request.ConfirmationCode != null)
            booking.ConfirmationCode = request.ConfirmationCode;

        if (request.Cost.HasValue)
            booking.Cost = request.Cost.Value;

        if (request.Currency != null)
            booking.Currency = request.Currency;

        if (request.Notes != null)
            booking.Notes = request.Notes;

        if (request.ContactInfo != null)
            booking.ContactInfo = request.ContactInfo;

        if (request.IsArchived.HasValue)
            booking.IsArchived = request.IsArchived.Value;

        booking.UpdatedAt = DateTime.UtcNow;

        // No need for _bookingRepository.Update(booking) as it's already tracked
        await _bookingRepository.SaveChangesAsync(cancellationToken);

        return MapToResponse(booking);
    }

    public async Task ArchiveBookingAsync(Guid bookingId, bool isArchived, Guid userId, CancellationToken cancellationToken = default)
    {
        var booking = await _bookingRepository.GetByIdAndUserIdAsync(bookingId, userId, cancellationToken);
        if (booking == null)
            throw new KeyNotFoundException("Booking not found or you don't have permission to access it.");

        booking.IsArchived = isArchived;
        booking.UpdatedAt = DateTime.UtcNow;

        await _bookingRepository.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteBookingAsync(Guid bookingId, Guid userId, CancellationToken cancellationToken = default)
    {
        var booking = await _bookingRepository.GetByIdAndUserIdAsync(bookingId, userId, cancellationToken);
        if (booking == null)
            throw new KeyNotFoundException("Booking not found or you don't have permission to access it.");

        await _bookingRepository.DeleteAsync(bookingId, cancellationToken);
        await _bookingRepository.SaveChangesAsync(cancellationToken);
    }

    public async Task<BookingSummaryResponse> GetBookingSummaryAsync(Guid userId, Guid tripId, CancellationToken cancellationToken = default)
    {
        var bookings = await _bookingRepository.GetByUserIdWithFiltersAsync(
            userId,
            tripId,
            null, // activityId
            null, // category
            null, // status
            null, // includeArchived
            cancellationToken);

        var list = bookings.ToList();

        return new BookingSummaryResponse
        {
            TotalBookings = list.Count,
            ConfirmedCount = list.Count(b => b.Status == BookingStatus.Confirmed),
            PendingCount = list.Count(b => b.Status == BookingStatus.Pending),
            TotalCost = list.Sum(b => b.Cost ?? 0)
        };
    }

    private static BookingResponse MapToResponse(Booking booking)
    {
        return new BookingResponse
        {
            Id = booking.Id,
            TripId = booking.TripId,
            ActivityId = booking.ActivityId,
            Category = booking.Category.ToString(),
            Title = booking.Title,
            Description = booking.Description,
            Status = booking.Status.ToString(),
            StartDate = booking.StartDate,
            EndDate = booking.EndDate,
            TimeZone = booking.TimeZone,
            Location = booking.Location,
            Address = booking.Address,
            Provider = booking.Provider,
            ConfirmationCode = booking.ConfirmationCode,
            Cost = booking.Cost,
            Currency = booking.Currency,
            Notes = booking.Notes,
            ContactInfo = booking.ContactInfo,
            IsArchived = booking.IsArchived,
            CreatedAt = booking.CreatedAt,
            UpdatedAt = booking.UpdatedAt,
            Documents = booking.Documents?.Select(d => new BookingDocumentResponse
            {
                Id = d.Id,
                BookingId = d.BookingId,
                FileName = d.FileName,
                FilePath = d.FilePath,
                FileSize = d.FileSize,
                ContentType = d.ContentType,
                UploadedAt = d.UploadedAt
            }).ToList() ?? new List<BookingDocumentResponse>()
        };
    }
}