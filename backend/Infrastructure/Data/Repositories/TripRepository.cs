using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Domain.Entities;
using Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Data.Repositories;

public class TripRepository : ITripRepository
{
    private readonly ApplicationDbContext _context;

    public TripRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Trip?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Trips
            .FirstOrDefaultAsync(t => t.Id == id, cancellationToken);
    }

    public async Task<Trip?> GetByIdAndUserIdAsync(Guid id, Guid userId, CancellationToken cancellationToken = default)
    {
        return await _context.Trips
            .FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId, cancellationToken);
    }

    public async Task<IEnumerable<Trip>> GetByUserIdAsync(Guid userId, bool includeArchived = false, CancellationToken cancellationToken = default)
    {
        var query = _context.Trips.Where(t => t.UserId == userId);

        if (!includeArchived)
        {
            query = query.Where(t => !t.IsArchived);
        }

        return await query
            .OrderByDescending(t => t.StartDate)
            .ToListAsync(cancellationToken);
    }

    public async Task AddAsync(Trip trip, CancellationToken cancellationToken = default)
    {
        await _context.Trips.AddAsync(trip, cancellationToken);
    }

    public void Update(Trip trip)
    {
        _context.Trips.Update(trip);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var trip = await GetByIdAsync(id, cancellationToken);
        if (trip != null)
        {
            _context.Trips.Remove(trip);
        }
    }

    public async Task SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        await _context.SaveChangesAsync(cancellationToken);
    }
}
