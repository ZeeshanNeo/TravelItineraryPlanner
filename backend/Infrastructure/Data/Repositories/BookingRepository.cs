using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Domain.Entities;
using Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Data.Repositories;

public class BookingRepository : IBookingRepository
{
    private readonly ApplicationDbContext _context;

    public BookingRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Booking?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Bookings
            .Include(b => b.Documents)
            .FirstOrDefaultAsync(b => b.Id == id, cancellationToken);
    }

    public async Task<Booking?> GetByIdAndUserIdAsync(Guid id, Guid userId, CancellationToken cancellationToken = default)
    {
        return await _context.Bookings
            .Include(b => b.Documents)
            .Include(b => b.Trip)
            .Include(b => b.Activity)
            .FirstOrDefaultAsync(b => b.Id == id && b.Trip.UserId == userId, cancellationToken);
    }

    public async Task<IEnumerable<Booking>> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return await _context.Bookings
            .Include(b => b.Documents)
            .Include(b => b.Trip)
            .Include(b => b.Activity)
            .Where(b => b.Trip.UserId == userId && !b.IsArchived)
            .OrderByDescending(b => b.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Booking>> GetByTripIdAsync(Guid tripId, Guid userId, CancellationToken cancellationToken = default)
    {
        return await _context.Bookings
            .Include(b => b.Documents)
            .Include(b => b.Trip)
            .Include(b => b.Activity)
            .Where(b => b.TripId == tripId && b.Trip.UserId == userId && !b.IsArchived)
            .OrderByDescending(b => b.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Booking>> GetByActivityIdAsync(Guid activityId, Guid userId, CancellationToken cancellationToken = default)
    {
        return await _context.Bookings
            .Include(b => b.Documents)
            .Include(b => b.Trip)
            .Include(b => b.Activity)
            .Where(b => b.ActivityId == activityId && b.Trip.UserId == userId && !b.IsArchived)
            .OrderByDescending(b => b.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Booking>> GetByCategoryAsync(BookingCategory category, Guid userId, CancellationToken cancellationToken = default)
    {
        return await _context.Bookings
            .Include(b => b.Documents)
            .Include(b => b.Trip)
            .Include(b => b.Activity)
            .Where(b => b.Category == category && b.Trip.UserId == userId && !b.IsArchived)
            .OrderByDescending(b => b.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Booking>> GetByStatusAsync(BookingStatus status, Guid userId, CancellationToken cancellationToken = default)
    {
        return await _context.Bookings
            .Include(b => b.Documents)
            .Include(b => b.Trip)
            .Include(b => b.Activity)
            .Where(b => b.Status == status && b.Trip.UserId == userId && !b.IsArchived)
            .OrderByDescending(b => b.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Booking>> GetByUserIdWithFiltersAsync(
        Guid userId,
        Guid? tripId = null,
        Guid? activityId = null,
        BookingCategory? category = null,
        BookingStatus? status = null,
        bool? isArchived = false,
        CancellationToken cancellationToken = default)
    {
        var query = _context.Bookings
            .Include(b => b.Documents)
            .Include(b => b.Trip)
            .Include(b => b.Activity)
            .Where(b => b.Trip.UserId == userId);

        if (tripId.HasValue)
        {
            query = query.Where(b => b.TripId == tripId.Value);
        }

        if (activityId.HasValue)
        {
            query = query.Where(b => b.ActivityId == activityId.Value);
        }

        if (category.HasValue)
        {
            query = query.Where(b => b.Category == category.Value);
        }

        if (status.HasValue)
        {
            query = query.Where(b => b.Status == status.Value);
        }

        if (isArchived.HasValue)
        {
            query = query.Where(b => b.IsArchived == isArchived.Value);
        }

        return await query
            .OrderByDescending(b => b.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task AddAsync(Booking booking, CancellationToken cancellationToken = default)
    {
        await _context.Bookings.AddAsync(booking, cancellationToken);
    }

    public void Update(Booking booking)
    {
        _context.Bookings.Update(booking);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var booking = await GetByIdAsync(id, cancellationToken);
        if (booking != null)
        {
            _context.Bookings.Remove(booking);
        }
    }

    public async Task SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        await _context.SaveChangesAsync(cancellationToken);
    }
}