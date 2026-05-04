using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Application.DTOs.Memories;
using Microsoft.AspNetCore.Http;

namespace Application.Interfaces
{
    public interface IMemoryService
    {
        // Photos
        Task<MemoryPhotoDto> UploadPhotoAsync(Guid tripId, IFormFile file, string title, string location, List<string> tags);
        Task<IEnumerable<MemoryPhotoDto>> GetPhotosByTripAsync(Guid tripId);
        Task<MemoryPhotoDto> UpdatePhotoAsync(Guid photoId, UpdatePhotoRequest request);
        Task DeletePhotoAsync(Guid photoId);
        
        // Journals
        Task<JournalEntryDto> CreateJournalAsync(Guid tripId, CreateJournalRequest request);
        Task<IEnumerable<JournalEntryDto>> GetJournalsByTripAsync(Guid tripId);
        Task<JournalEntryDto> UpdateJournalAsync(Guid journalId, CreateJournalRequest request);
        Task DeleteJournalAsync(Guid journalId);

        // Timeline & Summary
        Task<IEnumerable<MemoryTimelineItemDto>> GetMemoryTimelineAsync(Guid tripId);
        Task<TripSummaryDto> GetTripSummaryAsync(Guid tripId);

        // Tags
        Task<IEnumerable<MemoryTagDto>> GetAllTagsAsync();
    }
}
