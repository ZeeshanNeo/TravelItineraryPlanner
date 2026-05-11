using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Domain.Entities;

namespace Domain.Interfaces
{
    public interface IMemoryRepository
    {
        Task<MemoryPhoto> GetPhotoByIdAsync(Guid id);
        Task<IEnumerable<MemoryPhoto>> GetPhotosByTripIdAsync(Guid tripId);
        Task<MemoryPhoto> AddPhotoAsync(MemoryPhoto photo);
        Task UpdatePhotoAsync(MemoryPhoto photo);
        Task DeletePhotoAsync(MemoryPhoto photo);
        
        // Tagging
        Task AddTagToPhotoAsync(Guid photoId, Guid tagId);
        Task RemoveTagFromPhotoAsync(Guid photoId, Guid tagId);
        Task SaveChangesAsync();
    }

    public interface IJournalRepository
    {
        Task<JournalEntry> GetByIdAsync(Guid id);
        Task<IEnumerable<JournalEntry>> GetByTripIdAsync(Guid tripId);
        Task<JournalEntry> AddAsync(JournalEntry entry);
        Task UpdateAsync(JournalEntry entry);
        Task DeleteAsync(JournalEntry entry);
        Task SaveChangesAsync();
    }

    public interface ITagRepository
    {
        Task<MemoryTag> GetByIdAsync(Guid id);
        Task<MemoryTag> GetByNameAsync(string name);
        Task<IEnumerable<MemoryTag>> GetAllAsync();
        Task<MemoryTag> AddAsync(MemoryTag tag);
        Task SaveChangesAsync();
    }
}
