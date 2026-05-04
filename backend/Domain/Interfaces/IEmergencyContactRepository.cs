using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Domain.Interfaces
{
    public interface IEmergencyContactRepository
    {
        Task<IEnumerable<EmergencyContact>> GetByTripIdAsync(Guid tripId);
        Task<EmergencyContact> GetByIdAsync(Guid id);
        Task AddAsync(EmergencyContact contact);
        Task UpdateAsync(EmergencyContact contact);
        Task DeleteAsync(EmergencyContact contact);
    }
}
