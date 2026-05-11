using Application.Common.Models;
using Application.DTOs.TravelDocs;
using Application.Services;
using Domain.Interfaces;
using Domain.Entities;
using Infrastructure.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Mapster;

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
        private readonly ITripRepository _tripRepo;
        private readonly DestinationTemplateService _templateService;
        private readonly ApplicationDbContext _context;

        public TravelDocService(
            IPackingListRepository packingRepo,
            IChecklistRepository checklistRepo,
            IEmergencyContactRepository contactRepo,
            ITravelDocumentRepository docRepo,
            ILocalInfoRepository infoRepo,
            IFileStorageService fileStorage,
            ITripRepository tripRepo,
            DestinationTemplateService templateService,
            ApplicationDbContext context)
        {
            _packingRepo = packingRepo;
            _checklistRepo = checklistRepo;
            _contactRepo = contactRepo;
            _docRepo = docRepo;
            _infoRepo = infoRepo;
            _fileStorage = fileStorage;
            _tripRepo = tripRepo;
            _templateService = templateService;
            _context = context;
        }

        public async Task<Result<ChecklistDto>> AutoGenerateChecklistAsync(Guid tripId, Guid userId)
        {
            var trip = await _tripRepo.GetByIdAndUserIdAsync(tripId, userId);
            if (trip == null) return Result<ChecklistDto>.Failure("Trip not found.");

            var checklist = new TravelChecklist(tripId, "Trip Preparation Checklist");
            var items = _templateService.GetChecklistItems(trip.Destination);

            foreach (var item in items)
            {
                checklist.AddItem(item.Task, trip.StartDate.AddDays(-item.DaysBefore));
            }

            await _checklistRepo.AddAsync(checklist);
            return Result<ChecklistDto>.Success(checklist.Adapt<ChecklistDto>());
        }

        private async Task<bool> HasAccessAsync(Guid tripId, Guid userId)
        {
            var trip = await _tripRepo.GetByIdAndUserIdAsync(tripId, userId);
            return trip != null;
        }

        // Packing List
        public async Task<Result<IEnumerable<PackingListDto>>> GetPackingListsAsync(Guid tripId, Guid userId)
        {
            if (!await HasAccessAsync(tripId, userId))
                return Result<IEnumerable<PackingListDto>>.Failure("Trip not found or access denied.");

            var lists = await _packingRepo.GetByTripIdAsync(tripId);
            return Result<IEnumerable<PackingListDto>>.Success(lists.Select(l => l.Adapt<PackingListDto>()));
        }

        public async Task<Result<PackingListDto>> CreatePackingListAsync(Guid tripId, CreatePackingListRequest request, Guid userId)
        {
            if (!await HasAccessAsync(tripId, userId))
                return Result<PackingListDto>.Failure("Trip not found or access denied.");

            try
            {
                var list = new PackingList(tripId, request.Title, request.Category);
                await _packingRepo.AddAsync(list);
                return Result<PackingListDto>.Success(list.Adapt<PackingListDto>());
            }
            catch (ArgumentException ex)
            {
                return Result<PackingListDto>.Failure(ex.Message);
            }
        }

        public async Task<Result<PackingListDto>> AddPackingItemAsync(Guid listId, AddPackingItemRequest request, Guid userId)
        {
            var list = await _packingRepo.GetByIdAsync(listId);
            if (list == null || !list.TripId.HasValue || !await HasAccessAsync(list.TripId.Value, userId))
                return Result<PackingListDto>.Failure("Packing list not found or access denied.");

            try
            {
                list.AddItem(request.Name, request.Quantity);
                await _packingRepo.UpdateAsync(list);
                return Result<PackingListDto>.Success(list.Adapt<PackingListDto>());
            }
            catch (ArgumentException ex)
            {
                return Result<PackingListDto>.Failure(ex.Message);
            }
        }

        public async Task<Result> UpdatePackingItemAsync(Guid itemId, bool isPacked, Guid userId)
        {
            var item = await _context.PackingItems.FindAsync(itemId);
            if (item == null) return Result.Failure("Packing item not found.");

            var list = await _packingRepo.GetByIdAsync(item.PackingListId);
            if (list == null || !list.TripId.HasValue || !await HasAccessAsync(list.TripId.Value, userId))
                return Result.Failure("Access denied.");

            item.SetPackedStatus(isPacked);
            await _context.SaveChangesAsync();
            return Result.Success();
        }

        public async Task<Result> DeletePackingListAsync(Guid listId, Guid userId)
        {
            var list = await _packingRepo.GetByIdAsync(listId);
            if (list == null || !list.TripId.HasValue || !await HasAccessAsync(list.TripId.Value, userId))
                return Result.Failure("Packing list not found or access denied.");

            await _packingRepo.DeleteAsync(list);
            return Result.Success();
        }

        public async Task<Result> DeletePackingItemAsync(Guid itemId, Guid userId)
        {
            var item = await _context.PackingItems.FindAsync(itemId);
            if (item == null) return Result.Failure("Packing item not found.");

            var list = await _packingRepo.GetByIdAsync(item.PackingListId);
            if (list == null || !list.TripId.HasValue || !await HasAccessAsync(list.TripId.Value, userId))
                return Result.Failure("Access denied.");

            _context.PackingItems.Remove(item);
            await _context.SaveChangesAsync();
            return Result.Success();
        }

        public async Task<Result<IEnumerable<PackingListDto>>> GetPackingTemplatesAsync(string? category = null)
        {
            var templates = await _packingRepo.GetTemplatesAsync(category);
            return Result<IEnumerable<PackingListDto>>.Success(templates.Select(t => t.Adapt<PackingListDto>()));
        }

        public async Task<Result<PackingListDto>> CreatePackingListFromTemplateAsync(Guid tripId, Guid templateId, Guid userId)
        {
            if (!await HasAccessAsync(tripId, userId))
                return Result<PackingListDto>.Failure("Trip not found or access denied.");

            var template = await _packingRepo.GetByIdAsync(templateId);
            if (template == null || !template.IsTemplate)
                return Result<PackingListDto>.Failure("Template not found.");

            try
            {
                var newList = new PackingList(tripId, template.Title, template.Category);
                foreach (var item in template.Items)
                {
                    newList.AddItem(item.Name, item.Quantity);
                }

                await _packingRepo.AddAsync(newList);
                return Result<PackingListDto>.Success(newList.Adapt<PackingListDto>());
            }
            catch (ArgumentException ex)
            {
                return Result<PackingListDto>.Failure(ex.Message);
            }
        }

        // Checklist
        public async Task<Result<IEnumerable<ChecklistDto>>> GetChecklistsAsync(Guid tripId, Guid userId)
        {
            if (!await HasAccessAsync(tripId, userId))
                return Result<IEnumerable<ChecklistDto>>.Failure("Trip not found or access denied.");

            var lists = await _checklistRepo.GetByTripIdAsync(tripId);
            return Result<IEnumerable<ChecklistDto>>.Success(lists.Select(l => l.Adapt<ChecklistDto>()));
        }

        public async Task<Result<ChecklistDto>> CreateChecklistAsync(Guid tripId, CreateChecklistRequest request, Guid userId)
        {
            if (!await HasAccessAsync(tripId, userId))
                return Result<ChecklistDto>.Failure("Trip not found or access denied.");

            try
            {
                var checklist = new TravelChecklist(tripId, request.Title);
                await _checklistRepo.AddAsync(checklist);
                return Result<ChecklistDto>.Success(checklist.Adapt<ChecklistDto>());
            }
            catch (ArgumentException ex)
            {
                return Result<ChecklistDto>.Failure(ex.Message);
            }
        }

        public async Task<Result<ChecklistDto>> AddChecklistItemAsync(Guid checklistId, AddChecklistItemRequest request, Guid userId)
        {
            var checklist = await _checklistRepo.GetByIdAsync(checklistId);
            if (checklist == null || !await HasAccessAsync(checklist.TripId, userId))
                return Result<ChecklistDto>.Failure("Checklist not found or access denied.");

            try
            {
                checklist.AddItem(request.Task, request.DueDate);
                await _checklistRepo.UpdateAsync(checklist);
                return Result<ChecklistDto>.Success(checklist.Adapt<ChecklistDto>());
            }
            catch (ArgumentException ex)
            {
                return Result<ChecklistDto>.Failure(ex.Message);
            }
        }

        public async Task<Result> UpdateChecklistItemAsync(Guid itemId, bool isCompleted, Guid userId)
        {
            var item = await _context.ChecklistItems.FindAsync(itemId);
            if (item == null) return Result.Failure("Checklist item not found.");

            var checklist = await _checklistRepo.GetByIdAsync(item.ChecklistId);
            if (checklist == null || !await HasAccessAsync(checklist.TripId, userId))
                return Result.Failure("Access denied.");

            item.SetCompletedStatus(isCompleted);
            await _context.SaveChangesAsync();
            return Result.Success();
        }

        public async Task<Result> DeleteChecklistAsync(Guid checklistId, Guid userId)
        {
            var list = await _checklistRepo.GetByIdAsync(checklistId);
            if (list == null || !await HasAccessAsync(list.TripId, userId))
                return Result.Failure("Checklist not found or access denied.");

            await _checklistRepo.DeleteAsync(list);
            return Result.Success();
        }

        public async Task<Result> DeleteChecklistItemAsync(Guid itemId, Guid userId)
        {
            var item = await _context.ChecklistItems.FindAsync(itemId);
            if (item == null) return Result.Failure("Checklist item not found.");

            var checklist = await _checklistRepo.GetByIdAsync(item.ChecklistId);
            if (checklist == null || !await HasAccessAsync(checklist.TripId, userId))
                return Result.Failure("Access denied.");

            _context.ChecklistItems.Remove(item);
            await _context.SaveChangesAsync();
            return Result.Success();
        }

        // Emergency Contacts
        public async Task<Result<IEnumerable<EmergencyContactDto>>> GetEmergencyContactsAsync(Guid tripId, Guid userId)
        {
            if (!await HasAccessAsync(tripId, userId))
                return Result<IEnumerable<EmergencyContactDto>>.Failure("Trip not found or access denied.");

            var contacts = await _contactRepo.GetByTripIdAsync(tripId);
            return Result<IEnumerable<EmergencyContactDto>>.Success(contacts.Select(c => c.Adapt<EmergencyContactDto>()));
        }

        public async Task<Result<EmergencyContactDto>> CreateEmergencyContactAsync(Guid tripId, CreateEmergencyContactRequest request, Guid userId)
        {
            if (!await HasAccessAsync(tripId, userId))
                return Result<EmergencyContactDto>.Failure("Trip not found or access denied.");

            try
            {
                var contact = new EmergencyContact(
                    tripId,
                    request.Name,
                    request.Relationship,
                    request.PhoneNumber,
                    request.Email,
                    request.IsLocal,
                    request.Notes);

                await _contactRepo.AddAsync(contact);
                return Result<EmergencyContactDto>.Success(contact.Adapt<EmergencyContactDto>());
            }
            catch (ArgumentException ex)
            {
                return Result<EmergencyContactDto>.Failure(ex.Message);
            }
        }

        public async Task<Result> UpdateEmergencyContactAsync(Guid id, CreateEmergencyContactRequest request, Guid userId)
        {
            var contact = await _contactRepo.GetByIdAsync(id);
            if (contact == null || !await HasAccessAsync(contact.TripId, userId))
                return Result.Failure("Emergency contact not found or access denied.");

            try
            {
                contact.UpdateDetails(
                    request.Name,
                    request.Relationship,
                    request.PhoneNumber,
                    request.Email,
                    request.IsLocal,
                    request.Notes);

                await _contactRepo.UpdateAsync(contact);
                return Result.Success();
            }
            catch (ArgumentException ex)
            {
                return Result.Failure(ex.Message);
            }
        }

        public async Task<Result> DeleteEmergencyContactAsync(Guid id, Guid userId)
        {
            var contact = await _contactRepo.GetByIdAsync(id);
            if (contact == null || !await HasAccessAsync(contact.TripId, userId))
                return Result.Failure("Emergency contact not found or access denied.");

            await _contactRepo.DeleteAsync(contact);
            return Result.Success();
        }

        // Travel Documents
        public async Task<Result<IEnumerable<TravelDocumentDto>>> GetTravelDocumentsAsync(Guid tripId, Guid userId)
        {
            if (!await HasAccessAsync(tripId, userId))
                return Result<IEnumerable<TravelDocumentDto>>.Failure("Trip not found or access denied.");

            var docs = await _docRepo.GetByTripIdAsync(tripId);
            return Result<IEnumerable<TravelDocumentDto>>.Success(docs.Select(d => d.Adapt<TravelDocumentDto>()));
        }

        public async Task<Result<TravelDocumentDto>> UploadDocumentAsync(Guid tripId, string title, TravelDocumentType type, string fileName, string contentType, long fileSize, byte[] fileData, Guid userId)
        {
            if (!await HasAccessAsync(tripId, userId))
                return Result<TravelDocumentDto>.Failure("Trip not found or access denied.");

            try
            {
                var filePath = await _fileStorage.SaveFileFromBytesAsync(fileData, fileName, contentType, fileSize, "travel-documents");
                var doc = new TravelDocument(tripId, title, type, fileName, filePath, contentType, fileSize);
                await _docRepo.AddAsync(doc);
                return Result<TravelDocumentDto>.Success(doc.Adapt<TravelDocumentDto>());
            }
            catch (ArgumentException ex)
            {
                return Result<TravelDocumentDto>.Failure(ex.Message);
            }
        }

        public async Task<Result<(byte[] fileData, string contentType, string fileName)>> DownloadDocumentAsync(Guid id, Guid userId)
        {
            var doc = await _docRepo.GetByIdAsync(id);
            if (doc == null || !await HasAccessAsync(doc.TripId, userId))
                return Result<(byte[] fileData, string contentType, string fileName)>.Failure("Document not found or access denied.");

            var fileData = await _fileStorage.GetFileAsync(doc.FilePath);
            return Result<(byte[] fileData, string contentType, string fileName)>.Success((fileData, doc.ContentType, doc.FileName));
        }

        public async Task<Result> DeleteDocumentAsync(Guid id, Guid userId)
        {
            var doc = await _docRepo.GetByIdAsync(id);
            if (doc == null || !await HasAccessAsync(doc.TripId, userId))
                return Result.Failure("Document not found or access denied.");

            await _fileStorage.DeleteFileAsync(doc.FilePath);
            await _docRepo.DeleteAsync(doc);
            return Result.Success();
        }

        // Local Information
        public async Task<Result<IEnumerable<LocalInfoNoteDto>>> GetLocalInfoNotesAsync(Guid tripId, Guid userId)
        {
            if (!await HasAccessAsync(tripId, userId))
                return Result<IEnumerable<LocalInfoNoteDto>>.Failure("Trip not found or access denied.");

            var notes = await _infoRepo.GetByTripIdAsync(tripId);
            return Result<IEnumerable<LocalInfoNoteDto>>.Success(notes.Select(n => n.Adapt<LocalInfoNoteDto>()));
        }

        public async Task<Result<LocalInfoNoteDto>> CreateLocalInfoNoteAsync(Guid tripId, CreateLocalInfoNoteRequest request, Guid userId)
        {
            if (!await HasAccessAsync(tripId, userId))
                return Result<LocalInfoNoteDto>.Failure("Trip not found or access denied.");

            try
            {
                var note = new LocalInfoNote(tripId, request.Title, request.Category, request.Content);
                await _infoRepo.AddAsync(note);
                return Result<LocalInfoNoteDto>.Success(note.Adapt<LocalInfoNoteDto>());
            }
            catch (ArgumentException ex)
            {
                return Result<LocalInfoNoteDto>.Failure(ex.Message);
            }
        }

        public async Task<Result> UpdateLocalInfoNoteAsync(Guid id, CreateLocalInfoNoteRequest request, Guid userId)
        {
            var note = await _infoRepo.GetByIdAsync(id);
            if (note == null || !await HasAccessAsync(note.TripId, userId))
                return Result.Failure("Note not found or access denied.");

            try
            {
                note.UpdateDetails(request.Title, request.Category, request.Content);
                await _infoRepo.UpdateAsync(note);
                return Result.Success();
            }
            catch (ArgumentException ex)
            {
                return Result.Failure(ex.Message);
            }
        }

        public async Task<Result> DeleteLocalInfoNoteAsync(Guid id, Guid userId)
        {
            var note = await _infoRepo.GetByIdAsync(id);
            if (note == null || !await HasAccessAsync(note.TripId, userId))
                return Result.Failure("Note not found or access denied.");

            await _infoRepo.DeleteAsync(note);
            return Result.Success();
        }
    }
}
