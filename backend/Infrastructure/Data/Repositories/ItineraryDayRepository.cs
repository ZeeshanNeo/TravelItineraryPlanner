using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Domain.Entities;
using Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Data.Repositories;

public class ItineraryDayRepository : IItineraryDayRepository
{
    private readonly ApplicationDbContext _context;

    public ItineraryDayRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<ItineraryDay?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.ItineraryDays
            .Include(d => d.Activities)
            .FirstOrDefaultAsync(d => d.Id == id, cancellationToken);
    }

    public async Task<ItineraryDay?> GetByIdAndItineraryIdAsync(Guid id, Guid itineraryId, CancellationToken cancellationToken = default)
    {
        return await _context.ItineraryDays
            .Include(d => d.Activities)
            .FirstOrDefaultAsync(d => d.Id == id && d.ItineraryId == itineraryId, cancellationToken);
    }

    public async Task<ItineraryDay?> GetByIdAndUserIdAsync(Guid id, Guid userId, CancellationToken cancellationToken = default)
    {
        return await _context.ItineraryDays
            .Include(d => d.Activities)
            .Include(d => d.Itinerary)
                .ThenInclude(i => i.Trip)
            .FirstOrDefaultAsync(d => d.Id == id && d.Itinerary.Trip.UserId == userId, cancellationToken);
    }

    public async Task<IEnumerable<ItineraryDay>> GetByItineraryIdAsync(Guid itineraryId, CancellationToken cancellationToken = default)
    {
        return await _context.ItineraryDays
            .Include(d => d.Activities)
            .Where(d => d.ItineraryId == itineraryId)
            .OrderBy(d => d.DayNumber)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<ItineraryDay>> GetByItineraryIdWithActivitiesAsync(Guid itineraryId, CancellationToken cancellationToken = default)
    {
        return await _context.ItineraryDays
            .Include(d => d.Activities.OrderBy(a => a.Order))
            .Where(d => d.ItineraryId == itineraryId)
            .OrderBy(d => d.DayNumber)
            .ToListAsync(cancellationToken);
    }

    public async Task AddAsync(ItineraryDay itineraryDay, CancellationToken cancellationToken = default)
    {
        await _context.ItineraryDays.AddAsync(itineraryDay, cancellationToken);
    }

    public void Update(ItineraryDay itineraryDay)
    {
        _context.ItineraryDays.Update(itineraryDay);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var day = await GetByIdAsync(id, cancellationToken);
        if (day != null)
        {
            _context.ItineraryDays.Remove(day);
        }
    }

    public async Task SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        await _context.SaveChangesAsync(cancellationToken);
    }
}