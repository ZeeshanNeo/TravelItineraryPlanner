using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Domain.Entities;
using Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Data.Repositories;

public class ItineraryRepository : IItineraryRepository
{
    private readonly ApplicationDbContext _context;

    public ItineraryRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Itinerary?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Itineraries
            .Include(i => i.Days)
            .ThenInclude(d => d.Activities)
            .FirstOrDefaultAsync(i => i.Id == id, cancellationToken);
    }

    public async Task<Itinerary?> GetByIdAndTripIdAsync(Guid id, Guid tripId, CancellationToken cancellationToken = default)
    {
        return await _context.Itineraries
            .Include(i => i.Days)
            .ThenInclude(d => d.Activities)
            .FirstOrDefaultAsync(i => i.Id == id && i.TripId == tripId, cancellationToken);
    }

    public async Task<Itinerary?> GetByIdAndUserIdAsync(Guid id, Guid userId, CancellationToken cancellationToken = default)
    {
        return await _context.Itineraries
            .Include(i => i.Days)
            .ThenInclude(d => d.Activities)
            .Include(i => i.Trip)
            .FirstOrDefaultAsync(i => i.Id == id && i.Trip.UserId == userId, cancellationToken);
    }

    public async Task<IEnumerable<Itinerary>> GetByTripIdAsync(Guid tripId, bool includeArchived = false, CancellationToken cancellationToken = default)
    {
        var query = _context.Itineraries
            .Include(i => i.Days)
            .ThenInclude(d => d.Activities)
            .Where(i => i.TripId == tripId);

        if (!includeArchived)
        {
            query = query.Where(i => !i.IsArchived);
        }

        return await query
            .OrderByDescending(i => i.StartDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Itinerary>> GetByUserIdAsync(Guid userId, bool includeArchived = false, CancellationToken cancellationToken = default)
    {
        var query = _context.Itineraries
            .Include(i => i.Trip)
            .Include(i => i.Days)
            .ThenInclude(d => d.Activities)
            .Where(i => i.Trip.UserId == userId);

        if (!includeArchived)
        {
            query = query.Where(i => !i.IsArchived);
        }

        return await query
            .OrderByDescending(i => i.StartDate)
            .ToListAsync(cancellationToken);
    }

    public async Task AddAsync(Itinerary itinerary, CancellationToken cancellationToken = default)
    {
        await _context.Itineraries.AddAsync(itinerary, cancellationToken);
    }

    public void Update(Itinerary itinerary)
    {
        _context.Itineraries.Update(itinerary);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var itinerary = await GetByIdAsync(id, cancellationToken);
        if (itinerary != null)
        {
            _context.Itineraries.Remove(itinerary);
        }
    }

    public async Task SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        await _context.SaveChangesAsync(cancellationToken);
    }
}