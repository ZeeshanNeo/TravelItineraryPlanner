using Application.DTOs.TravelDocs;
using Application.Services;
using Domain.Interfaces;
using Domain.Entities;
using Infrastructure.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Infrastructure.Services
{
    public class TravelDocService : ITravelDocService
    {
        private readonly IPackingListRepository _packingRepo;
        private readonly IChecklistRepository _checklistRepo;
        private readonly IEmergencyContactRepository _contactRepo;
        private readonly ITravelDocumentRepository _docRepo;
        private readonly ILocalInfoRepository _infoRepo;
        private readonly IFileStorageService _fileStorage;
        private readonly ApplicationDbContext _context;

        public TravelDocService(
            IPackingListRepository packingRepo,
            IChecklistRepository checklistRepo,
            IEmergencyContactRepository contactRepo,
            ITravelDocumentRepository docRepo,
            ILocalInfoRepository infoRepo,
            IFileStorageService fileStorage,
            ApplicationDbContext context)
        {
            _packingRepo = packingRepo;
            _checklistRepo = checklistRepo;
            _contactRepo = contactRepo;
            _docRepo = docRepo;
            _infoRepo = infoRepo;
            _fileStorage = fileStorage;
            _context = context;
        }

        // Packing List
        public async Task<IEnumerable<PackingListDto>> GetPackingListsAsync(Guid tripId)
        {
            var lists = await _packingRepo.GetByTripIdAsync(tripId);
            return lists.Select(l => MapPackingListToDto(l));
        }

        public async Task<PackingListDto> CreatePackingListAsync(Guid tripId, CreatePackingListRequest request)
        {
            var list = new PackingList
            {
                Id = Guid.NewGuid(),
                TripId = tripId,
                Title = request.Title,
                Category = request.Category,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            await _packingRepo.AddAsync(list);
            return MapPackingListToDto(list);
        }

        public async Task<PackingListDto> AddPackingItemAsync(Guid listId, AddPackingItemRequest request)
        {
            var list = await _packingRepo.GetByIdAsync(listId);
            if (list == null) return null;

            var item = new PackingItem
            {
                Id = Guid.NewGuid(),
                PackingListId = listId,
                Name = request.Name,
                Quantity = request.Quantity,
                IsPacked = false
            };
            
            // Add directly to DbContext to avoid tracking conflicts with parent Update
            await _context.PackingItems.AddAsync(item);
            await _context.SaveChangesAsync();

            // Refresh list to include new item for DTO mapping
            var updatedList = await _packingRepo.GetByIdAsync(listId);
            return MapPackingListToDto(updatedList);
        }

        public async Task UpdatePackingItemAsync(Guid itemId, bool isPacked)
        {
            var item = await _context.PackingItems.FindAsync(itemId);
            if (item != null)
            {
                item.IsPacked = isPacked;
                await _context.SaveChangesAsync();
            }
        }

        public async Task DeletePackingListAsync(Guid listId)
        {
            var list = await _packingRepo.GetByIdAsync(listId);
            if (list != null) await _packingRepo.DeleteAsync(list);
        }

        public async Task DeletePackingItemAsync(Guid itemId)
        {
            var item = await _context.PackingItems.FindAsync(itemId);
            if (item != null)
            {
                _context.PackingItems.Remove(item);
                await _context.SaveChangesAsync();
            }
        }

        // Checklist
        public async Task<IEnumerable<ChecklistDto>> GetChecklistsAsync(Guid tripId)
        {
            var lists = await _checklistRepo.GetByTripIdAsync(tripId);
            return lists.Select(l => MapChecklistToDto(l));
        }

        public async Task<ChecklistDto> CreateChecklistAsync(Guid tripId, CreateChecklistRequest request)
        {
            var checklist = new TravelChecklist
            {
                Id = Guid.NewGuid(),
                TripId = tripId,
                Title = request.Title,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            await _checklistRepo.AddAsync(checklist);
            return MapChecklistToDto(checklist);
        }

        public async Task<ChecklistDto> AddChecklistItemAsync(Guid checklistId, AddChecklistItemRequest request)
        {
            var checklist = await _checklistRepo.GetByIdAsync(checklistId);
            if (checklist == null) return null;

            var item = new ChecklistItem
            {
                Id = Guid.NewGuid(),
                ChecklistId = checklistId,
                Task = request.Task,
                DueDate = request.DueDate,
                IsCompleted = false
            };
            
            // Add directly to DbContext
            await _context.ChecklistItems.AddAsync(item);
            await _context.SaveChangesAsync();

            // Refresh checklist
            var updatedChecklist = await _checklistRepo.GetByIdAsync(checklistId);
            return MapChecklistToDto(updatedChecklist);
        }

        public async Task UpdateChecklistItemAsync(Guid itemId, bool isCompleted)
        {
            var item = await _context.ChecklistItems.FindAsync(itemId);
            if (item != null)
            {
                item.IsCompleted = isCompleted;
                await _context.SaveChangesAsync();
            }
        }

        public async Task DeleteChecklistAsync(Guid checklistId)
        {
            var list = await _checklistRepo.GetByIdAsync(checklistId);
            if (list != null) await _checklistRepo.DeleteAsync(list);
        }

        public async Task DeleteChecklistItemAsync(Guid itemId)
        {
            var item = await _context.ChecklistItems.FindAsync(itemId);
            if (item != null)
            {
                _context.ChecklistItems.Remove(item);
                await _context.SaveChangesAsync();
            }
        }

        // Emergency Contacts
        public async Task<IEnumerable<EmergencyContactDto>> GetEmergencyContactsAsync(Guid tripId)
        {
            var contacts = await _contactRepo.GetByTripIdAsync(tripId);
            return contacts.Select(c => MapContactToDto(c));
        }

        public async Task<EmergencyContactDto> CreateEmergencyContactAsync(Guid tripId, CreateEmergencyContactRequest request)
        {
            var contact = new EmergencyContact
            {
                Id = Guid.NewGuid(),
                TripId = tripId,
                Name = request.Name,
                Relationship = request.Relationship,
                PhoneNumber = request.PhoneNumber,
                Email = request.Email,
                IsLocal = request.IsLocal,
                Notes = request.Notes,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            await _contactRepo.AddAsync(contact);
            return MapContactToDto(contact);
        }

        public async Task UpdateEmergencyContactAsync(Guid id, CreateEmergencyContactRequest request)
        {
            var contact = await _contactRepo.GetByIdAsync(id);
            if (contact != null)
            {
                contact.Name = request.Name;
                contact.Relationship = request.Relationship;
                contact.PhoneNumber = request.PhoneNumber;
                contact.Email = request.Email;
                contact.IsLocal = request.IsLocal;
                contact.Notes = request.Notes;
                contact.UpdatedAt = DateTime.UtcNow;
                await _contactRepo.UpdateAsync(contact);
            }
        }

        public async Task DeleteEmergencyContactAsync(Guid id)
        {
            var contact = await _contactRepo.GetByIdAsync(id);
            if (contact != null) await _contactRepo.DeleteAsync(contact);
        }

        // Travel Documents
        public async Task<IEnumerable<TravelDocumentDto>> GetTravelDocumentsAsync(Guid tripId)
        {
            var docs = await _docRepo.GetByTripIdAsync(tripId);
            return docs.Select(d => MapDocToDto(d));
        }

        public async Task<TravelDocumentDto> UploadDocumentAsync(Guid tripId, string title, TravelDocumentType type, string fileName, string contentType, long fileSize, byte[] fileData)
        {
            var filePath = await _fileStorage.SaveFileFromBytesAsync(fileData, fileName, contentType, fileSize, "travel-documents");
            var doc = new TravelDocument
            {
                Id = Guid.NewGuid(),
                TripId = tripId,
                Title = title,
                Type = type,
                FileName = fileName,
                FilePath = filePath,
                ContentType = contentType,
                FileSize = fileSize,
                UploadDate = DateTime.UtcNow
            };
            await _docRepo.AddAsync(doc);
            return MapDocToDto(doc);
        }

        public async Task<(byte[] fileData, string contentType, string fileName)> DownloadDocumentAsync(Guid id)
        {
            var doc = await _docRepo.GetByIdAsync(id);
            if (doc == null) return (null, null, null);

            var fileData = await _fileStorage.GetFileAsync(doc.FilePath);
            return (fileData, doc.ContentType, doc.FileName);
        }

        public async Task DeleteDocumentAsync(Guid id)
        {
            var doc = await _docRepo.GetByIdAsync(id);
            if (doc != null)
            {
                await _fileStorage.DeleteFileAsync(doc.FilePath);
                await _docRepo.DeleteAsync(doc);
            }
        }

        // Local Information
        public async Task<IEnumerable<LocalInfoNoteDto>> GetLocalInfoNotesAsync(Guid tripId)
        {
            var notes = await _infoRepo.GetByTripIdAsync(tripId);
            return notes.Select(n => MapNoteToDto(n));
        }

        public async Task<LocalInfoNoteDto> CreateLocalInfoNoteAsync(Guid tripId, CreateLocalInfoNoteRequest request)
        {
            var note = new LocalInfoNote
            {
                Id = Guid.NewGuid(),
                TripId = tripId,
                Title = request.Title,
                Category = request.Category,
                Content = request.Content,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            await _infoRepo.AddAsync(note);
            return MapNoteToDto(note);
        }

        public async Task UpdateLocalInfoNoteAsync(Guid id, CreateLocalInfoNoteRequest request)
        {
            var note = await _infoRepo.GetByIdAsync(id);
            if (note != null)
            {
                note.Title = request.Title;
                note.Category = request.Category;
                note.Content = request.Content;
                note.UpdatedAt = DateTime.UtcNow;
                await _infoRepo.UpdateAsync(note);
            }
        }

        public async Task DeleteLocalInfoNoteAsync(Guid id)
        {
            var note = await _infoRepo.GetByIdAsync(id);
            if (note != null) await _infoRepo.DeleteAsync(note);
        }

        // Mappers
        private PackingListDto MapPackingListToDto(PackingList list) => new PackingListDto
        {
            Id = list.Id,
            TripId = list.TripId,
            Title = list.Title,
            Category = list.Category,
            Items = list.Items.Select(i => new PackingItemDto { Id = i.Id, Name = i.Name, Quantity = i.Quantity, IsPacked = i.IsPacked }).ToList()
        };

        private ChecklistDto MapChecklistToDto(TravelChecklist list) => new ChecklistDto
        {
            Id = list.Id,
            TripId = list.TripId,
            Title = list.Title,
            Items = list.Items.Select(i => new ChecklistItemDto { Id = i.Id, Task = i.Task, IsCompleted = i.IsCompleted, DueDate = i.DueDate }).ToList()
        };

        private EmergencyContactDto MapContactToDto(EmergencyContact contact) => new EmergencyContactDto
        {
            Id = contact.Id,
            TripId = contact.TripId,
            Name = contact.Name,
            Relationship = contact.Relationship,
            PhoneNumber = contact.PhoneNumber,
            Email = contact.Email,
            IsLocal = contact.IsLocal,
            Notes = contact.Notes
        };

        private TravelDocumentDto MapDocToDto(TravelDocument doc) => new TravelDocumentDto
        {
            Id = doc.Id,
            TripId = doc.TripId,
            Title = doc.Title,
            Type = doc.Type,
            FileName = doc.FileName,
            FileSize = doc.FileSize,
            UploadDate = doc.UploadDate
        };

        private LocalInfoNoteDto MapNoteToDto(LocalInfoNote note) => new LocalInfoNoteDto
        {
            Id = note.Id,
            TripId = note.TripId,
            Title = note.Title,
            Category = note.Category,
            Content = note.Content
        };
    }
}
