using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Application.DTOs.Memories;
using Application.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MemoriesController : ControllerBase
    {
        private readonly IMemoryService _memoryService;

        public MemoriesController(IMemoryService memoryService)
        {
            _memoryService = memoryService;
        }

        [HttpPost("trips/{tripId}/photos")]
        public async Task<IActionResult> UploadPhoto(Guid tripId, [FromForm] PhotoUploadRequest request)
        {
            if (request.File == null || request.File.Length == 0) return BadRequest("No file uploaded");
            var result = await _memoryService.UploadPhotoAsync(tripId, request.File, request.Title, request.Location, request.Tags);
            return Ok(result);
        }

        public class PhotoUploadRequest
        {
            public IFormFile File { get; set; }
            public string Title { get; set; }
            public string Location { get; set; }
            public List<string> Tags { get; set; }
        }

        [HttpGet("trips/{tripId}/photos")]
        public async Task<IActionResult> GetPhotos(Guid tripId)
        {
            return Ok(await _memoryService.GetPhotosByTripAsync(tripId));
        }

        [HttpPut("photos/{photoId}")]
        public async Task<IActionResult> UpdatePhoto(Guid photoId, [FromBody] UpdatePhotoRequest request)
        {
            var result = await _memoryService.UpdatePhotoAsync(photoId, request);
            if (result == null) return NotFound();
            return Ok(result);
        }

        [HttpDelete("photos/{photoId}")]
        public async Task<IActionResult> DeletePhoto(Guid photoId)
        {
            await _memoryService.DeletePhotoAsync(photoId);
            return NoContent();
        }

        [HttpPost("trips/{tripId}/journals")]
        public async Task<IActionResult> CreateJournal(Guid tripId, [FromBody] CreateJournalRequest request)
        {
            var result = await _memoryService.CreateJournalAsync(tripId, request);
            return Ok(result);
        }

        [HttpGet("trips/{tripId}/journals")]
        public async Task<IActionResult> GetJournals(Guid tripId)
        {
            return Ok(await _memoryService.GetJournalsByTripAsync(tripId));
        }

        [HttpPut("journals/{journalId}")]
        public async Task<IActionResult> UpdateJournal(Guid journalId, [FromBody] CreateJournalRequest request)
        {
            var result = await _memoryService.UpdateJournalAsync(journalId, request);
            if (result == null) return NotFound();
            return Ok(result);
        }

        [HttpDelete("journals/{journalId}")]
        public async Task<IActionResult> DeleteJournal(Guid journalId)
        {
            await _memoryService.DeleteJournalAsync(journalId);
            return NoContent();
        }

        [HttpGet("trips/{tripId}/timeline")]
        public async Task<IActionResult> GetTimeline(Guid tripId)
        {
            return Ok(await _memoryService.GetMemoryTimelineAsync(tripId));
        }

        [HttpGet("trips/{tripId}/summary")]
        public async Task<IActionResult> GetSummary(Guid tripId)
        {
            return Ok(await _memoryService.GetTripSummaryAsync(tripId));
        }

        [HttpGet("tags")]
        public async Task<IActionResult> GetTags()
        {
            return Ok(await _memoryService.GetAllTagsAsync());
        }
    }
}
