using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Application.DTOs.Memories;
using Application.Interfaces;
using Domain.Entities;
using Domain.Interfaces;
using Microsoft.AspNetCore.Http;

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

        public async Task<MemoryPhotoDto> UploadPhotoAsync(Guid tripId, IFormFile file, string title, string location, List<string> tags)
        {
            using var ms = new MemoryStream();
            await file.CopyToAsync(ms);
            var fileBytes = ms.ToArray();

            var filePath = await _fileStorage.SaveFileFromBytesAsync(fileBytes, file.FileName, file.ContentType, file.Length, "photos");

            var photo = new MemoryPhoto
            {
                Id = Guid.NewGuid(),
                TripId = tripId,
                Title = title,
                Description = string.Empty, // Fix: DB constraint prevents NULL
                FilePath = filePath,
                ContentType = file.ContentType,
                FileSize = file.Length,
                TakenAt = DateTime.UtcNow, // Simplified for now
                Location = location,
                UploadedAt = DateTime.UtcNow
            };

            await _memoryRepo.AddPhotoAsync(photo);

            if (tags != null)
            {
                foreach (var tagName in tags)
                {
                    var tag = await _tagRepo.GetByNameAsync(tagName);
                    if (tag == null)
                    {
                        tag = await _tagRepo.AddAsync(new MemoryTag 
                        { 
                            Id = Guid.NewGuid(), 
                            Name = tagName,
                            Category = "General" // Fix: DB constraint prevents NULL
                        });
                    }
                    await _memoryRepo.AddTagToPhotoAsync(photo.Id, tag.Id);
                }
            }

            // Reload photo with tags
            var updatedPhoto = await _memoryRepo.GetPhotoByIdAsync(photo.Id);
            return MapPhotoToDto(updatedPhoto);
        }

        public async Task<IEnumerable<MemoryPhotoDto>> GetPhotosByTripAsync(Guid tripId)
        {
            var photos = await _memoryRepo.GetPhotosByTripIdAsync(tripId);
            return photos.Select(MapPhotoToDto);
        }

        public async Task<MemoryPhotoDto> UpdatePhotoAsync(Guid photoId, UpdatePhotoRequest request)
        {
            var photo = await _memoryRepo.GetPhotoByIdAsync(photoId);
            if (photo == null) return null;

            photo.Title = request.Title;
            photo.Description = request.Description;
            photo.Location = request.Location;

            await _memoryRepo.UpdatePhotoAsync(photo);
            return MapPhotoToDto(photo);
        }

        public async Task DeletePhotoAsync(Guid photoId)
        {
            var photo = await _memoryRepo.GetPhotoByIdAsync(photoId);
            if (photo != null)
            {
                await _fileStorage.DeleteFileAsync(photo.FilePath);
                await _memoryRepo.DeletePhotoAsync(photo);
            }
        }

        public async Task<JournalEntryDto> CreateJournalAsync(Guid tripId, CreateJournalRequest request)
        {
            var entry = new JournalEntry
            {
                Id = Guid.NewGuid(),
                TripId = tripId,
                Title = request.Title,
                Content = request.Content,
                EntryDate = request.EntryDate,
                Location = request.Location,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            await _journalRepo.AddAsync(entry);
            return MapJournalToDto(entry);
        }

        public async Task<IEnumerable<JournalEntryDto>> GetJournalsByTripAsync(Guid tripId)
        {
            var journals = await _journalRepo.GetByTripIdAsync(tripId);
            return journals.Select(MapJournalToDto);
        }

        public async Task<JournalEntryDto> UpdateJournalAsync(Guid journalId, CreateJournalRequest request)
        {
            var entry = await _journalRepo.GetByIdAsync(journalId);
            if (entry == null) return null;

            entry.Title = request.Title;
            entry.Content = request.Content;
            entry.EntryDate = request.EntryDate;
            entry.Location = request.Location;
            entry.UpdatedAt = DateTime.UtcNow;

            await _journalRepo.UpdateAsync(entry);
            return MapJournalToDto(entry);
        }

        public async Task DeleteJournalAsync(Guid journalId)
        {
            var entry = await _journalRepo.GetByIdAsync(journalId);
            if (entry != null) await _journalRepo.DeleteAsync(entry);
        }

        public async Task<IEnumerable<MemoryTimelineItemDto>> GetMemoryTimelineAsync(Guid tripId)
        {
            var photos = await _memoryRepo.GetPhotosByTripIdAsync(tripId);
            var journals = await _journalRepo.GetByTripIdAsync(tripId);

            var timeline = new List<MemoryTimelineItemDto>();

            timeline.AddRange(photos.Select(p => new MemoryTimelineItemDto
            {
                Type = "Photo",
                Date = p.TakenAt,
                Data = MapPhotoToDto(p)
            }));

            timeline.AddRange(journals.Select(j => new MemoryTimelineItemDto
            {
                Type = "Journal",
                Date = j.EntryDate,
                Data = MapJournalToDto(j)
            }));

            return timeline.OrderByDescending(t => t.Date);
        }

        public async Task<TripSummaryDto> GetTripSummaryAsync(Guid tripId)
        {
            var photos = await _memoryRepo.GetPhotosByTripIdAsync(tripId);
            var journals = await _journalRepo.GetByTripIdAsync(tripId);
            var trip = await _tripRepo.GetByIdAsync(tripId);

            return new TripSummaryDto
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
            };
        }

        public async Task<IEnumerable<MemoryTagDto>> GetAllTagsAsync()
        {
            var tags = await _tagRepo.GetAllAsync();
            return tags.Select(t => new MemoryTagDto { Id = t.Id, Name = t.Name, Category = t.Category });
        }

        private MemoryPhotoDto MapPhotoToDto(MemoryPhoto photo) => new MemoryPhotoDto
        {
            Id = photo.Id,
            TripId = photo.TripId,
            Title = photo.Title,
            Description = photo.Description,
            FilePath = photo.FilePath,
            TakenAt = photo.TakenAt,
            Location = photo.Location,
            Tags = photo.Tags.Select(t => new MemoryTagDto { Id = t.TagId, Name = t.Tag.Name, Category = t.Tag.Category }).ToList()
        };

        private JournalEntryDto MapJournalToDto(JournalEntry entry) => new JournalEntryDto
        {
            Id = entry.Id,
            TripId = entry.TripId,
            Title = entry.Title,
            Content = entry.Content,
            EntryDate = entry.EntryDate,
            Location = entry.Location,
            CreatedAt = entry.CreatedAt
        };
    }
}
