using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Domain.Interfaces
{
    public interface IChecklistRepository
    {
        Task<IEnumerable<TravelChecklist>> GetByTripIdAsync(Guid tripId);
        Task<TravelChecklist?> GetByIdAsync(Guid id);
        Task AddAsync(TravelChecklist checklist);
        Task UpdateAsync(TravelChecklist checklist);
        Task DeleteAsync(TravelChecklist checklist);
        Task SaveChangesAsync();
    }
}
