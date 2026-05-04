using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Domain.Entities;

namespace Domain.Interfaces;

public interface IBookingRepository
{
    Task<Booking?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<Booking?> GetByIdAndUserIdAsync(Guid id, Guid userId, CancellationToken cancellationToken = default);
    Task<IEnumerable<Booking>> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<IEnumerable<Booking>> GetByTripIdAsync(Guid tripId, Guid userId, CancellationToken cancellationToken = default);
    Task<IEnumerable<Booking>> GetByActivityIdAsync(Guid activityId, Guid userId, CancellationToken cancellationToken = default);
    Task<IEnumerable<Booking>> GetByCategoryAsync(BookingCategory category, Guid userId, CancellationToken cancellationToken = default);
    Task<IEnumerable<Booking>> GetByStatusAsync(BookingStatus status, Guid userId, CancellationToken cancellationToken = default);
    Task<IEnumerable<Booking>> GetByUserIdWithFiltersAsync(
        Guid userId,
        Guid? tripId = null,
        Guid? activityId = null,
        BookingCategory? category = null,
        BookingStatus? status = null,
        bool? isArchived = false,
        CancellationToken cancellationToken = default);
    Task AddAsync(Booking booking, CancellationToken cancellationToken = default);
    void Update(Booking booking);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
    Task SaveChangesAsync(CancellationToken cancellationToken = default);
}