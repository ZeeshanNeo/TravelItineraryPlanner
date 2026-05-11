using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Application.Common.Models;
using Application.DTOs.Memories;
using Microsoft.AspNetCore.Http;

namespace Application.Interfaces
{
    public interface IMemoryService
    {
        // Photos
        Task<Result<MemoryPhotoDto>> UploadPhotoAsync(Guid tripId, IFormFile file, string title, string location, List<string> tags, Guid userId, Guid? activityId = null);
        Task<Result<IEnumerable<MemoryPhotoDto>>> GetPhotosByTripAsync(Guid tripId, Guid userId);
        Task<Result<MemoryPhotoDto>> UpdatePhotoAsync(Guid photoId, UpdatePhotoRequest request, Guid userId);
        Task<Result> DeletePhotoAsync(Guid photoId, Guid userId);
        
        // Journals
        Task<Result<JournalEntryDto>> CreateJournalAsync(Guid tripId, CreateJournalRequest request, Guid userId);
        Task<Result<IEnumerable<JournalEntryDto>>> GetJournalsByTripAsync(Guid tripId, Guid userId);
        Task<Result<JournalEntryDto>> UpdateJournalAsync(Guid journalId, CreateJournalRequest request, Guid userId);
        Task<Result> DeleteJournalAsync(Guid journalId, Guid userId);

        // Timeline & Summary
        Task<Result<IEnumerable<MemoryTimelineItemDto>>> GetMemoryTimelineAsync(Guid tripId, Guid userId);
        Task<Result<TripSummaryDto>> GetTripSummaryAsync(Guid tripId, Guid userId);

        // Tags
        Task<Result<IEnumerable<MemoryTagDto>>> GetAllTagsAsync();
    }
}
