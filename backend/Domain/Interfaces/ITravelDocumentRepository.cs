using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Domain.Interfaces
{
    public interface ITravelDocumentRepository
    {
        Task<IEnumerable<TravelDocument>> GetByTripIdAsync(Guid tripId);
        Task<TravelDocument?> GetByIdAsync(Guid id);
        Task AddAsync(TravelDocument document);
        Task UpdateAsync(TravelDocument document);
        Task DeleteAsync(TravelDocument document);
        Task SaveChangesAsync();
    }
}
