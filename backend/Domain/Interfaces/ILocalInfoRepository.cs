using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Domain.Interfaces
{
    public interface ILocalInfoRepository
    {
        Task<IEnumerable<LocalInfoNote>> GetByTripIdAsync(Guid tripId);
        Task<LocalInfoNote?> GetByIdAsync(Guid id);
        Task AddAsync(LocalInfoNote note);
        Task UpdateAsync(LocalInfoNote note);
        Task DeleteAsync(LocalInfoNote note);
        Task SaveChangesAsync();
    }
}
