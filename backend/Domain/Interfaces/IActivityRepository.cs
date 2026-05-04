using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Domain.Entities;

namespace Domain.Interfaces;

public interface IActivityRepository
{
    Task<Activity?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<Activity?> GetByIdAndItineraryDayIdAsync(Guid id, Guid itineraryDayId, CancellationToken cancellationToken = default);
    Task<Activity?> GetByIdAndUserIdAsync(Guid id, Guid userId, CancellationToken cancellationToken = default);
    Task<Activity?> GetByIdAndTripIdAsync(Guid id, Guid tripId, CancellationToken cancellationToken = default);
    Task<IEnumerable<Activity>> GetByItineraryDayIdAsync(Guid itineraryDayId, CancellationToken cancellationToken = default);
    Task<IEnumerable<Activity>> GetByItineraryIdAsync(Guid itineraryId, CancellationToken cancellationToken = default);
    Task AddAsync(Activity activity, CancellationToken cancellationToken = default);
    void Update(Activity activity);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
    Task SaveChangesAsync(CancellationToken cancellationToken = default);
    Task UpdateOrderAsync(Guid itineraryDayId, List<Guid> activityIdsInOrder, CancellationToken cancellationToken = default);
}