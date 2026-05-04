using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Domain.Entities;

namespace Domain.Interfaces;

public interface IItineraryDayRepository
{
    Task<ItineraryDay?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<ItineraryDay?> GetByIdAndItineraryIdAsync(Guid id, Guid itineraryId, CancellationToken cancellationToken = default);
    Task<ItineraryDay?> GetByIdAndUserIdAsync(Guid id, Guid userId, CancellationToken cancellationToken = default);
    Task<IEnumerable<ItineraryDay>> GetByItineraryIdAsync(Guid itineraryId, CancellationToken cancellationToken = default);
    Task<IEnumerable<ItineraryDay>> GetByItineraryIdWithActivitiesAsync(Guid itineraryId, CancellationToken cancellationToken = default);
    Task AddAsync(ItineraryDay itineraryDay, CancellationToken cancellationToken = default);
    void Update(ItineraryDay itineraryDay);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
    Task SaveChangesAsync(CancellationToken cancellationToken = default);
}