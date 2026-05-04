using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Domain.Entities;
using Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Data.Repositories;

public class ActivityRepository : IActivityRepository
{
    private readonly ApplicationDbContext _context;

    public ActivityRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Activity?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Activities
            .FirstOrDefaultAsync(a => a.Id == id, cancellationToken);
    }

    public async Task<Activity?> GetByIdAndItineraryDayIdAsync(Guid id, Guid itineraryDayId, CancellationToken cancellationToken = default)
    {
        return await _context.Activities
            .FirstOrDefaultAsync(a => a.Id == id && a.ItineraryDayId == itineraryDayId, cancellationToken);
    }

    public async Task<Activity?> GetByIdAndUserIdAsync(Guid id, Guid userId, CancellationToken cancellationToken = default)
    {
        return await _context.Activities
            .Include(a => a.ItineraryDay)
                .ThenInclude(d => d.Itinerary)
                    .ThenInclude(i => i.Trip)
            .FirstOrDefaultAsync(a => a.Id == id && a.ItineraryDay.Itinerary.Trip.UserId == userId, cancellationToken);
    }

    public async Task<Activity?> GetByIdAndTripIdAsync(Guid id, Guid tripId, CancellationToken cancellationToken = default)
    {
        return await _context.Activities
            .Include(a => a.ItineraryDay)
                .ThenInclude(d => d.Itinerary)
            .FirstOrDefaultAsync(a => a.Id == id && a.ItineraryDay.Itinerary.TripId == tripId, cancellationToken);
    }

    public async Task<IEnumerable<Activity>> GetByItineraryDayIdAsync(Guid itineraryDayId, CancellationToken cancellationToken = default)
    {
        return await _context.Activities
            .Where(a => a.ItineraryDayId == itineraryDayId)
            .OrderBy(a => a.Order)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Activity>> GetByItineraryIdAsync(Guid itineraryId, CancellationToken cancellationToken = default)
    {
        return await _context.Activities
            .Include(a => a.ItineraryDay)
            .Where(a => a.ItineraryDay.ItineraryId == itineraryId)
            .OrderBy(a => a.ItineraryDay.DayNumber)
            .ThenBy(a => a.Order)
            .ToListAsync(cancellationToken);
    }

    public async Task AddAsync(Activity activity, CancellationToken cancellationToken = default)
    {
        await _context.Activities.AddAsync(activity, cancellationToken);
    }

    public void Update(Activity activity)
    {
        _context.Activities.Update(activity);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var activity = await GetByIdAsync(id, cancellationToken);
        if (activity != null)
        {
            _context.Activities.Remove(activity);
        }
    }

    public async Task SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateOrderAsync(Guid itineraryDayId, List<Guid> activityIdsInOrder, CancellationToken cancellationToken = default)
    {
        var activities = await _context.Activities
            .Where(a => a.ItineraryDayId == itineraryDayId)
            .ToListAsync(cancellationToken);

        var activityDict = activities.ToDictionary(a => a.Id);

        for (int i = 0; i < activityIdsInOrder.Count; i++)
        {
            if (activityDict.TryGetValue(activityIdsInOrder[i], out var activity))
            {
                activity.Order = i + 1;
                _context.Activities.Update(activity);
            }
        }

        await _context.SaveChangesAsync(cancellationToken);
    }
}
