using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Application.Common.Models;
using Application.DTOs.Memories;
using Application.Interfaces;
using Domain.Entities;
using Domain.Interfaces;
using Microsoft.AspNetCore.Http;
using Mapster;

namespace Infrastructure.Services
{
    public class MemoryService : IMemoryService
    {
        private readonly IMemoryRepository _memoryRepo;
        private readonly IJournalRepository _journalRepo;
        private readonly ITagRepository _tagRepo;
        private readonly IFileStorageService _fileStorage;
        private readonly ITripRepository _tripRepo;

        public MemoryService(
            IMemoryRepository memoryRepo,
            IJournalRepository journalRepo,
            ITagRepository tagRepo,
            IFileStorageService fileStorage,
            ITripRepository tripRepo)
        {
            _memoryRepo = memoryRepo;
            _journalRepo = journalRepo;
            _tagRepo = tagRepo;
            _fileStorage = fileStorage;
            _tripRepo = tripRepo;
        }

        private async Task<bool> HasAccessAsync(Guid tripId, Guid userId)
        {
            var trip = await _tripRepo.GetByIdAndUserIdAsync(tripId, userId);
            return trip != null;
        }

        public async Task<Result<MemoryPhotoDto>> UploadPhotoAsync(Guid tripId, IFormFile file, string title, string location, List<string> tags, Guid userId, Guid? activityId = null)
        {
            if (!await HasAccessAsync(tripId, userId))
                return Result<MemoryPhotoDto>.Failure("Trip not found or access denied.");

            try
            {
                using var ms = new MemoryStream();
                await file.CopyToAsync(ms);
                var fileBytes = ms.ToArray();

                var filePath = await _fileStorage.SaveFileFromBytesAsync(fileBytes, file.FileName, file.ContentType, file.Length, "photos");

                var photo = new MemoryPhoto(
                    tripId,
                    title,
                    string.Empty,
                    filePath,
                    file.ContentType,
                    file.Length,
                    DateTime.UtcNow,
                    location,
                    activityId);

                await _memoryRepo.AddPhotoAsync(photo);

                if (tags != null)
                {
                    foreach (var tagName in tags)
                    {
                        var tag = await _tagRepo.GetByNameAsync(tagName);
                        if (tag == null)
                        {
                            // In a real DDD scenario, we might want to manage tags via a Domain Service
                            tag = new MemoryTag { Id = Guid.NewGuid(), Name = tagName, Category = "General" };
                            await _tagRepo.AddAsync(tag);
                        }
                        await _memoryRepo.AddTagToPhotoAsync(photo.Id, tag.Id);
                    }
                }

                await _memoryRepo.SaveChangesAsync();
                var updatedPhoto = await _memoryRepo.GetPhotoByIdAsync(photo.Id);
                return Result<MemoryPhotoDto>.Success(updatedPhoto.Adapt<MemoryPhotoDto>());
            }
            catch (Exception ex)
            {
                return Result<MemoryPhotoDto>.Failure(ex.Message);
            }
        }

        public async Task<Result<IEnumerable<MemoryPhotoDto>>> GetPhotosByTripAsync(Guid tripId, Guid userId)
        {
            if (!await HasAccessAsync(tripId, userId))
                return Result<IEnumerable<MemoryPhotoDto>>.Failure("Trip not found or access denied.");

            var photos = await _memoryRepo.GetPhotosByTripIdAsync(tripId);
            return Result<IEnumerable<MemoryPhotoDto>>.Success(photos.Select(p => p.Adapt<MemoryPhotoDto>()));
        }

        public async Task<Result<MemoryPhotoDto>> UpdatePhotoAsync(Guid photoId, UpdatePhotoRequest request, Guid userId)
        {
            var photo = await _memoryRepo.GetPhotoByIdAsync(photoId);
            if (photo == null || !await HasAccessAsync(photo.TripId, userId))
                return Result<MemoryPhotoDto>.Failure("Photo not found or access denied.");

            try
            {
                photo.UpdateDetails(request.Title, request.Description, request.Location);
                await _memoryRepo.UpdatePhotoAsync(photo);
                await _memoryRepo.SaveChangesAsync();
                return Result<MemoryPhotoDto>.Success(photo.Adapt<MemoryPhotoDto>());
            }
            catch (ArgumentException ex)
            {
                return Result<MemoryPhotoDto>.Failure(ex.Message);
            }
        }

        public async Task<Result> DeletePhotoAsync(Guid photoId, Guid userId)
        {
            var photo = await _memoryRepo.GetPhotoByIdAsync(photoId);
            if (photo == null || !await HasAccessAsync(photo.TripId, userId))
                return Result.Failure("Photo not found or access denied.");

            await _fileStorage.DeleteFileAsync(photo.FilePath);
            await _memoryRepo.DeletePhotoAsync(photo);
            await _memoryRepo.SaveChangesAsync();
            return Result.Success();
        }

        public async Task<Result<JournalEntryDto>> CreateJournalAsync(Guid tripId, CreateJournalRequest request, Guid userId)
        {
            if (!await HasAccessAsync(tripId, userId))
                return Result<JournalEntryDto>.Failure("Trip not found or access denied.");

            try
            {
                var entry = new JournalEntry(tripId, request.Title, request.Content, request.EntryDate, request.Location, request.ActivityId);
                await _journalRepo.AddAsync(entry);
                await _journalRepo.SaveChangesAsync();
                return Result<JournalEntryDto>.Success(entry.Adapt<JournalEntryDto>());
            }
            catch (ArgumentException ex)
            {
                return Result<JournalEntryDto>.Failure(ex.Message);
            }
        }

        public async Task<Result<IEnumerable<JournalEntryDto>>> GetJournalsByTripAsync(Guid tripId, Guid userId)
        {
            if (!await HasAccessAsync(tripId, userId))
                return Result<IEnumerable<JournalEntryDto>>.Failure("Trip not found or access denied.");

            var journals = await _journalRepo.GetByTripIdAsync(tripId);
            return Result<IEnumerable<JournalEntryDto>>.Success(journals.Select(j => j.Adapt<JournalEntryDto>()));
        }

        public async Task<Result<JournalEntryDto>> UpdateJournalAsync(Guid journalId, CreateJournalRequest request, Guid userId)
        {
            var entry = await _journalRepo.GetByIdAsync(journalId);
            if (entry == null || !await HasAccessAsync(entry.TripId, userId))
                return Result<JournalEntryDto>.Failure("Journal entry not found or access denied.");

            try
            {
                entry.UpdateDetails(request.Title, request.Content, request.EntryDate, request.Location);
                await _journalRepo.UpdateAsync(entry);
                await _journalRepo.SaveChangesAsync();
                return Result<JournalEntryDto>.Success(entry.Adapt<JournalEntryDto>());
            }
            catch (ArgumentException ex)
            {
                return Result<JournalEntryDto>.Failure(ex.Message);
            }
        }

        public async Task<Result> DeleteJournalAsync(Guid journalId, Guid userId)
        {
            var entry = await _journalRepo.GetByIdAsync(journalId);
            if (entry == null || !await HasAccessAsync(entry.TripId, userId))
                return Result.Failure("Journal entry not found or access denied.");

            await _journalRepo.DeleteAsync(entry);
            await _journalRepo.SaveChangesAsync();
            return Result.Success();
        }

        public async Task<Result<IEnumerable<MemoryTimelineItemDto>>> GetMemoryTimelineAsync(Guid tripId, Guid userId)
        {
            if (!await HasAccessAsync(tripId, userId))
                return Result<IEnumerable<MemoryTimelineItemDto>>.Failure("Trip not found or access denied.");

            var photos = await _memoryRepo.GetPhotosByTripIdAsync(tripId);
            var journals = await _journalRepo.GetByTripIdAsync(tripId);

            var timeline = new List<MemoryTimelineItemDto>();

            timeline.AddRange(photos.Select(p => new MemoryTimelineItemDto
            {
                Type = "Photo",
                Date = p.TakenAt,
                Data = p.Adapt<MemoryPhotoDto>()
            }));

            timeline.AddRange(journals.Select(j => new MemoryTimelineItemDto
            {
                Type = "Journal",
                Date = j.EntryDate,
                Data = j.Adapt<JournalEntryDto>()
            }));

            return Result<IEnumerable<MemoryTimelineItemDto>>.Success(timeline.OrderByDescending(t => t.Date));
        }

        public async Task<Result<TripSummaryDto>> GetTripSummaryAsync(Guid tripId, Guid userId)
        {
            var trip = await _tripRepo.GetByIdAndUserIdAsync(tripId, userId);
            if (trip == null)
                return Result<TripSummaryDto>.Failure("Trip not found or access denied.");

            var photos = await _memoryRepo.GetPhotosByTripIdAsync(tripId);
            var journals = await _journalRepo.GetByTripIdAsync(tripId);

            return Result<TripSummaryDto>.Success(new TripSummaryDto
            {
                TotalPhotos = photos.Count(),
                TotalJournals = journals.Count(),
                TopLocations = photos.Where(p => !string.IsNullOrEmpty(p.Location))
                                     .GroupBy(p => p.Location)
                                     .OrderByDescending(g => g.Count())
                                     .Take(5)
                                     .Select(g => g.Key)
                                     .ToList(),
                TopTags = photos.SelectMany(p => p.Tags)
                                .GroupBy(t => t.Tag.Name)
                                .OrderByDescending(g => g.Count())
                                .Take(5)
                                .Select(g => g.Key)
                                .ToList(),
                TotalDays = (trip.EndDate - trip.StartDate).Days + 1
            });
        }

        public async Task<Result<IEnumerable<MemoryTagDto>>> GetAllTagsAsync()
        {
            var tags = await _tagRepo.GetAllAsync();
            return Result<IEnumerable<MemoryTagDto>>.Success(tags.Select(t => t.Adapt<MemoryTagDto>()));
        }
    }
}
