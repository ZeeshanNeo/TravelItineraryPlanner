using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Application.DTOs.Booking;

namespace Application.Services;

public interface IBookingService
{
    Task<BookingResponse> CreateBookingAsync(CreateBookingRequest request, Guid userId, CancellationToken cancellationToken = default);
    Task<BookingResponse?> GetBookingAsync(Guid bookingId, Guid userId, CancellationToken cancellationToken = default);
    Task<IEnumerable<BookingResponse>> GetUserBookingsAsync(Guid userId, Guid? tripId = null, string? category = null, string? status = null, bool includeArchived = false, CancellationToken cancellationToken = default);
    Task<BookingResponse> UpdateBookingAsync(Guid bookingId, UpdateBookingRequest request, Guid userId, CancellationToken cancellationToken = default);
    Task ArchiveBookingAsync(Guid bookingId, bool isArchived, Guid userId, CancellationToken cancellationToken = default);
    Task DeleteBookingAsync(Guid bookingId, Guid userId, CancellationToken cancellationToken = default);
    Task<BookingSummaryResponse> GetBookingSummaryAsync(Guid userId, Guid tripId, CancellationToken cancellationToken = default);
}