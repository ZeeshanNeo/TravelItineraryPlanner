using Application.DTOs.TravelDocs;
using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Application.Services
{
    public interface ITravelDocService
    {
        // Packing List
        Task<IEnumerable<PackingListDto>> GetPackingListsAsync(Guid tripId);
        Task<PackingListDto> CreatePackingListAsync(Guid tripId, CreatePackingListRequest request);
        Task<PackingListDto> AddPackingItemAsync(Guid listId, AddPackingItemRequest request);
        Task UpdatePackingItemAsync(Guid itemId, bool isPacked);
        Task DeletePackingListAsync(Guid listId);
        Task DeletePackingItemAsync(Guid itemId);

        // Checklist
        Task<IEnumerable<ChecklistDto>> GetChecklistsAsync(Guid tripId);
        Task<ChecklistDto> CreateChecklistAsync(Guid tripId, CreateChecklistRequest request);
        Task<ChecklistDto> AddChecklistItemAsync(Guid checklistId, AddChecklistItemRequest request);
        Task UpdateChecklistItemAsync(Guid itemId, bool isCompleted);
        Task DeleteChecklistAsync(Guid checklistId);
        Task DeleteChecklistItemAsync(Guid itemId);

        // Emergency Contacts
        Task<IEnumerable<EmergencyContactDto>> GetEmergencyContactsAsync(Guid tripId);
        Task<EmergencyContactDto> CreateEmergencyContactAsync(Guid tripId, CreateEmergencyContactRequest request);
        Task UpdateEmergencyContactAsync(Guid id, CreateEmergencyContactRequest request);
        Task DeleteEmergencyContactAsync(Guid id);

        // Travel Documents
        Task<IEnumerable<TravelDocumentDto>> GetTravelDocumentsAsync(Guid tripId);
        Task<TravelDocumentDto> UploadDocumentAsync(Guid tripId, string title, TravelDocumentType type, string fileName, string contentType, long fileSize, byte[] fileData);
        Task<(byte[] fileData, string contentType, string fileName)> DownloadDocumentAsync(Guid id);
        Task DeleteDocumentAsync(Guid id);

        // Local Information
        Task<IEnumerable<LocalInfoNoteDto>> GetLocalInfoNotesAsync(Guid tripId);
        Task<LocalInfoNoteDto> CreateLocalInfoNoteAsync(Guid tripId, CreateLocalInfoNoteRequest request);
        Task UpdateLocalInfoNoteAsync(Guid id, CreateLocalInfoNoteRequest request);
        Task DeleteLocalInfoNoteAsync(Guid id);
    }
}
