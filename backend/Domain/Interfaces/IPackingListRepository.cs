using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Domain.Interfaces
{
    public interface IPackingListRepository
    {
        Task<IEnumerable<PackingList>> GetByTripIdAsync(Guid tripId);
        Task<PackingList> GetByIdAsync(Guid id);
        Task AddAsync(PackingList packingList);
        Task UpdateAsync(PackingList packingList);
        Task DeleteAsync(PackingList packingList);
    }
}
