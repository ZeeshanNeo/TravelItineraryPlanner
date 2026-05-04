using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Domain.Entities;

namespace Domain.Interfaces;

public interface IItineraryRepository
{
    Task<Itinerary?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<Itinerary?> GetByIdAndTripIdAsync(Guid id, Guid tripId, CancellationToken cancellationToken = default);
    Task<Itinerary?> GetByIdAndUserIdAsync(Guid id, Guid userId, CancellationToken cancellationToken = default);
    Task<IEnumerable<Itinerary>> GetByTripIdAsync(Guid tripId, bool includeArchived = false, CancellationToken cancellationToken = default);
    Task<IEnumerable<Itinerary>> GetByUserIdAsync(Guid userId, bool includeArchived = false, CancellationToken cancellationToken = default);
    Task AddAsync(Itinerary itinerary, CancellationToken cancellationToken = default);
    void Update(Itinerary itinerary);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
    Task SaveChangesAsync(CancellationToken cancellationToken = default);
}