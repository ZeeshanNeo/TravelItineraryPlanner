using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Domain.Entities;
using Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Data.Repositories
{
    public class MemoryRepository : IMemoryRepository
    {
        private readonly ApplicationDbContext _context;

        public MemoryRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<MemoryPhoto> GetPhotoByIdAsync(Guid id) =>
            await _context.MemoryPhotos
                .Include(p => p.Tags)
                .ThenInclude(t => t.Tag)
                .FirstOrDefaultAsync(p => p.Id == id);

        public async Task<IEnumerable<MemoryPhoto>> GetPhotosByTripIdAsync(Guid tripId) =>
            await _context.MemoryPhotos
                .Include(p => p.Tags)
                .ThenInclude(t => t.Tag)
                .Where(p => p.TripId == tripId)
                .OrderByDescending(p => p.TakenAt)
                .ToListAsync();

        public async Task<MemoryPhoto> AddPhotoAsync(MemoryPhoto photo)
        {
            _context.MemoryPhotos.Add(photo);
            await _context.SaveChangesAsync();
            return photo;
        }

        public async Task UpdatePhotoAsync(MemoryPhoto photo)
        {
            _context.MemoryPhotos.Update(photo);
            await _context.SaveChangesAsync();
        }

        public async Task DeletePhotoAsync(MemoryPhoto photo)
        {
            _context.MemoryPhotos.Remove(photo);
            await _context.SaveChangesAsync();
        }

        public async Task AddTagToPhotoAsync(Guid photoId, Guid tagId)
        {
            if (!await _context.MemoryTagMappings.AnyAsync(m => m.PhotoId == photoId && m.TagId == tagId))
            {
                _context.MemoryTagMappings.Add(new MemoryTagMapping { PhotoId = photoId, TagId = tagId });
                await _context.SaveChangesAsync();
            }
        }

        public async Task RemoveTagFromPhotoAsync(Guid photoId, Guid tagId)
        {
            var mapping = await _context.MemoryTagMappings.FindAsync(photoId, tagId);
            if (mapping != null)
            {
                _context.MemoryTagMappings.Remove(mapping);
                await _context.SaveChangesAsync();
            }
        }

        public async Task SaveChangesAsync() => await _context.SaveChangesAsync();
    }

    public class JournalRepository : IJournalRepository
    {
        private readonly ApplicationDbContext _context;

        public JournalRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<JournalEntry> GetByIdAsync(Guid id) =>
            await _context.JournalEntries.FindAsync(id);

        public async Task<IEnumerable<JournalEntry>> GetByTripIdAsync(Guid tripId) =>
            await _context.JournalEntries
                .Where(j => j.TripId == tripId)
                .OrderByDescending(j => j.EntryDate)
                .ToListAsync();

        public async Task<JournalEntry> AddAsync(JournalEntry entry)
        {
            _context.JournalEntries.Add(entry);
            await _context.SaveChangesAsync();
            return entry;
        }

        public async Task UpdateAsync(JournalEntry entry)
        {
            _context.JournalEntries.Update(entry);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(JournalEntry entry)
        {
            _context.JournalEntries.Remove(entry);
            await _context.SaveChangesAsync();
        }

        public async Task SaveChangesAsync() => await _context.SaveChangesAsync();
    }

    public class TagRepository : ITagRepository
    {
        private readonly ApplicationDbContext _context;

        public TagRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<MemoryTag> GetByIdAsync(Guid id) => await _context.MemoryTags.FindAsync(id);

        public async Task<MemoryTag> GetByNameAsync(string name) =>
            await _context.MemoryTags.FirstOrDefaultAsync(t => t.Name == name);

        public async Task<IEnumerable<MemoryTag>> GetAllAsync() =>
            await _context.MemoryTags.ToListAsync();

        public async Task<MemoryTag> AddAsync(MemoryTag tag)
        {
            _context.MemoryTags.Add(tag);
            await _context.SaveChangesAsync();
            return tag;
        }

        public async Task SaveChangesAsync() => await _context.SaveChangesAsync();
    }
}
