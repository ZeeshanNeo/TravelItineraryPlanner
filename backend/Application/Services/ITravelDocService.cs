using Application.Common.Models;
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
        Task<Result<IEnumerable<PackingListDto>>> GetPackingListsAsync(Guid tripId, Guid userId);
        Task<Result<PackingListDto>> CreatePackingListAsync(Guid tripId, CreatePackingListRequest request, Guid userId);
        Task<Result<PackingListDto>> AddPackingItemAsync(Guid listId, AddPackingItemRequest request, Guid userId);
        Task<Result> UpdatePackingItemAsync(Guid itemId, bool isPacked, Guid userId);
        Task<Result> DeletePackingListAsync(Guid listId, Guid userId);
        Task<Result> DeletePackingItemAsync(Guid itemId, Guid userId);
        Task<Result<IEnumerable<PackingListDto>>> GetPackingTemplatesAsync(string? category = null);
        Task<Result<PackingListDto>> CreatePackingListFromTemplateAsync(Guid tripId, Guid templateId, Guid userId);

        // Checklist
        Task<Result<ChecklistDto>> AutoGenerateChecklistAsync(Guid tripId, Guid userId);
        Task<Result<IEnumerable<ChecklistDto>>> GetChecklistsAsync(Guid tripId, Guid userId);
        Task<Result<ChecklistDto>> CreateChecklistAsync(Guid tripId, CreateChecklistRequest request, Guid userId);
        Task<Result<ChecklistDto>> AddChecklistItemAsync(Guid checklistId, AddChecklistItemRequest request, Guid userId);
        Task<Result> UpdateChecklistItemAsync(Guid itemId, bool isCompleted, Guid userId);
        Task<Result> DeleteChecklistAsync(Guid checklistId, Guid userId);
        Task<Result> DeleteChecklistItemAsync(Guid itemId, Guid userId);

        // Emergency Contacts
        Task<Result<IEnumerable<EmergencyContactDto>>> GetEmergencyContactsAsync(Guid tripId, Guid userId);
        Task<Result<EmergencyContactDto>> CreateEmergencyContactAsync(Guid tripId, CreateEmergencyContactRequest request, Guid userId);
        Task<Result> UpdateEmergencyContactAsync(Guid id, CreateEmergencyContactRequest request, Guid userId);
        Task<Result> DeleteEmergencyContactAsync(Guid id, Guid userId);

        // Travel Documents
        Task<Result<IEnumerable<TravelDocumentDto>>> GetTravelDocumentsAsync(Guid tripId, Guid userId);
        Task<Result<TravelDocumentDto>> UploadDocumentAsync(Guid tripId, string title, TravelDocumentType type, string fileName, string contentType, long fileSize, byte[] fileData, Guid userId);
        Task<Result<(byte[] fileData, string contentType, string fileName)>> DownloadDocumentAsync(Guid id, Guid userId);
        Task<Result> DeleteDocumentAsync(Guid id, Guid userId);

        // Local Information
        Task<Result<IEnumerable<LocalInfoNoteDto>>> GetLocalInfoNotesAsync(Guid tripId, Guid userId);
        Task<Result<LocalInfoNoteDto>> CreateLocalInfoNoteAsync(Guid tripId, CreateLocalInfoNoteRequest request, Guid userId);
        Task<Result> UpdateLocalInfoNoteAsync(Guid id, CreateLocalInfoNoteRequest request, Guid userId);
        Task<Result> DeleteLocalInfoNoteAsync(Guid id, Guid userId);
    }
}
