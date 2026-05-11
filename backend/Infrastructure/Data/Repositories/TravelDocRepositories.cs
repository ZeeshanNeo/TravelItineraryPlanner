using Domain.Interfaces;
using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Infrastructure.Data.Repositories
{
    public class PackingListRepository : IPackingListRepository
    {
        private readonly ApplicationDbContext _context;
        public PackingListRepository(ApplicationDbContext context) => _context = context;

        public async Task<IEnumerable<PackingList>> GetByTripIdAsync(Guid tripId) =>
            await _context.PackingLists.Include(p => p.Items).Where(p => p.TripId == tripId).ToListAsync();

        public async Task<PackingList?> GetByIdAsync(Guid id) =>
            await _context.PackingLists.Include(p => p.Items).FirstOrDefaultAsync(p => p.Id == id);

        public async Task AddAsync(PackingList packingList) { await _context.PackingLists.AddAsync(packingList); await _context.SaveChangesAsync(); }
        public async Task UpdateAsync(PackingList packingList) { _context.PackingLists.Update(packingList); await _context.SaveChangesAsync(); }
        public async Task DeleteAsync(PackingList packingList) { _context.PackingLists.Remove(packingList); await _context.SaveChangesAsync(); }

        public async Task<IEnumerable<PackingList>> GetTemplatesAsync(string? category = null)
        {
            var query = _context.PackingLists.Include(p => p.Items).Where(p => p.IsTemplate);
            if (!string.IsNullOrEmpty(category)) query = query.Where(p => p.TemplateCategory == category);
            return await query.ToListAsync();
        }

        public async Task SaveChangesAsync() => await _context.SaveChangesAsync();
    }

    public class ChecklistRepository : IChecklistRepository
    {
        private readonly ApplicationDbContext _context;
        public ChecklistRepository(ApplicationDbContext context) => _context = context;

        public async Task<IEnumerable<TravelChecklist>> GetByTripIdAsync(Guid tripId) =>
            await _context.TravelChecklists.Include(c => c.Items).Where(c => c.TripId == tripId).ToListAsync();

        public async Task<TravelChecklist?> GetByIdAsync(Guid id) =>
            await _context.TravelChecklists.Include(c => c.Items).FirstOrDefaultAsync(c => c.Id == id);

        public async Task AddAsync(TravelChecklist checklist) { await _context.TravelChecklists.AddAsync(checklist); await _context.SaveChangesAsync(); }
        public async Task UpdateAsync(TravelChecklist checklist) { _context.TravelChecklists.Update(checklist); await _context.SaveChangesAsync(); }
        public async Task DeleteAsync(TravelChecklist checklist) { _context.TravelChecklists.Remove(checklist); await _context.SaveChangesAsync(); }
        public async Task SaveChangesAsync() => await _context.SaveChangesAsync();
    }

    public class EmergencyContactRepository : IEmergencyContactRepository
    {
        private readonly ApplicationDbContext _context;
        public EmergencyContactRepository(ApplicationDbContext context) => _context = context;

        public async Task<IEnumerable<EmergencyContact>> GetByTripIdAsync(Guid tripId) =>
            await _context.EmergencyContacts.Where(c => c.TripId == tripId).ToListAsync();

        public async Task<EmergencyContact?> GetByIdAsync(Guid id) => await _context.EmergencyContacts.FindAsync(id);
        public async Task AddAsync(EmergencyContact contact) { await _context.EmergencyContacts.AddAsync(contact); await _context.SaveChangesAsync(); }
        public async Task UpdateAsync(EmergencyContact contact) { _context.EmergencyContacts.Update(contact); await _context.SaveChangesAsync(); }
        public async Task DeleteAsync(EmergencyContact contact) { _context.EmergencyContacts.Remove(contact); await _context.SaveChangesAsync(); }
        public async Task SaveChangesAsync() => await _context.SaveChangesAsync();
    }

    public class TravelDocumentRepository : ITravelDocumentRepository
    {
        private readonly ApplicationDbContext _context;
        public TravelDocumentRepository(ApplicationDbContext context) => _context = context;

        public async Task<IEnumerable<TravelDocument>> GetByTripIdAsync(Guid tripId) =>
            await _context.TravelDocuments.Where(d => d.TripId == tripId).ToListAsync();

        public async Task<TravelDocument?> GetByIdAsync(Guid id) => await _context.TravelDocuments.FindAsync(id);
        public async Task AddAsync(TravelDocument document) { await _context.TravelDocuments.AddAsync(document); await _context.SaveChangesAsync(); }
        public async Task UpdateAsync(TravelDocument document) { _context.TravelDocuments.Update(document); await _context.SaveChangesAsync(); }
        public async Task DeleteAsync(TravelDocument document) { _context.TravelDocuments.Remove(document); await _context.SaveChangesAsync(); }
        public async Task SaveChangesAsync() => await _context.SaveChangesAsync();
    }

    public class LocalInfoRepository : ILocalInfoRepository
    {
        private readonly ApplicationDbContext _context;
        public LocalInfoRepository(ApplicationDbContext context) => _context = context;

        public async Task<IEnumerable<LocalInfoNote>> GetByTripIdAsync(Guid tripId) =>
            await _context.LocalInfoNotes.Where(n => n.TripId == tripId).ToListAsync();

        public async Task<LocalInfoNote?> GetByIdAsync(Guid id) => await _context.LocalInfoNotes.FindAsync(id);
        public async Task AddAsync(LocalInfoNote note) { await _context.LocalInfoNotes.AddAsync(note); await _context.SaveChangesAsync(); }
        public async Task UpdateAsync(LocalInfoNote note) { _context.LocalInfoNotes.Update(note); await _context.SaveChangesAsync(); }
        public async Task DeleteAsync(LocalInfoNote note) { _context.LocalInfoNotes.Remove(note); await _context.SaveChangesAsync(); }
        public async Task SaveChangesAsync() => await _context.SaveChangesAsync();
    }
}
