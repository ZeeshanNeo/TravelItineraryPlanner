using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Application.Common.Models;
using Application.DTOs.Booking;

namespace Application.Services;

public interface IBookingService
{
    Task<Result<BookingResponse>> CreateBookingAsync(CreateBookingRequest request, Guid userId, CancellationToken cancellationToken = default);
    Task<Result<BookingResponse>> GetBookingAsync(Guid bookingId, Guid userId, CancellationToken cancellationToken = default);
    Task<Result<IEnumerable<BookingResponse>>> GetUserBookingsAsync(Guid userId, Guid? tripId = null, string? category = null, string? status = null, bool includeArchived = false, CancellationToken cancellationToken = default);
    Task<Result<BookingResponse>> UpdateBookingAsync(Guid bookingId, UpdateBookingRequest request, Guid userId, CancellationToken cancellationToken = default);
    Task<Result> ArchiveBookingAsync(Guid bookingId, bool isArchived, Guid userId, CancellationToken cancellationToken = default);
    Task<Result> DeleteBookingAsync(Guid bookingId, Guid userId, CancellationToken cancellationToken = default);
    Task<Result<BookingSummaryResponse>> GetBookingSummaryAsync(Guid userId, Guid tripId, CancellationToken cancellationToken = default);
}