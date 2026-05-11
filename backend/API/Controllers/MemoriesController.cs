using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Application.Common.Interfaces;
using Application.Common.Models;
using Application.DTOs.Memories;
using Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class MemoriesController : ControllerBase
    {
        private readonly IMemoryService _memoryService;
        private readonly ICurrentUserService _currentUser;

        public MemoriesController(IMemoryService memoryService, ICurrentUserService currentUser)
        {
            _memoryService = memoryService;
            _currentUser = currentUser;
        }

        private Guid UserId => _currentUser.UserId ?? throw new UnauthorizedAccessException("Invalid token.");

        private ActionResult HandleResult(Result result)
        {
            if (result.IsSuccess) return NoContent();
            if (result.Error.Contains("not found")) return NotFound(new { error = result.Error });
            if (result.Error.Contains("denied")) return Forbid();
            return BadRequest(new { error = result.Error });
        }

        private ActionResult<T> HandleResult<T>(Result<T> result)
        {
            if (result.IsSuccess) return Ok(result.Value);
            if (result.Error.Contains("not found")) return NotFound(new { error = result.Error });
            if (result.Error.Contains("denied")) return Forbid();
            return BadRequest(new { error = result.Error });
        }

        [HttpPost("trips/{tripId}/photos")]
        public async Task<ActionResult<MemoryPhotoDto>> UploadPhoto(Guid tripId, [FromForm] PhotoUploadRequest request)
        {
            if (request.File == null || request.File.Length == 0) return BadRequest("No file uploaded");
            var result = await _memoryService.UploadPhotoAsync(tripId, request.File, request.Title, request.Location, request.Tags, UserId);
            return HandleResult(result);
        }

        public class PhotoUploadRequest
        {
            public IFormFile File { get; set; }
            public string Title { get; set; }
            public string Location { get; set; }
            public List<string> Tags { get; set; }
        }

        [HttpGet("trips/{tripId}/photos")]
        public async Task<ActionResult<IEnumerable<MemoryPhotoDto>>> GetPhotos(Guid tripId)
        {
            var result = await _memoryService.GetPhotosByTripAsync(tripId, UserId);
            return HandleResult(result);
        }

        [HttpPut("photos/{photoId}")]
        public async Task<ActionResult<MemoryPhotoDto>> UpdatePhoto(Guid photoId, [FromBody] UpdatePhotoRequest request)
        {
            var result = await _memoryService.UpdatePhotoAsync(photoId, request, UserId);
            return HandleResult(result);
        }

        [HttpDelete("photos/{photoId}")]
        public async Task<IActionResult> DeletePhoto(Guid photoId)
        {
            var result = await _memoryService.DeletePhotoAsync(photoId, UserId);
            return HandleResult(result);
        }

        [HttpPost("trips/{tripId}/journals")]
        public async Task<ActionResult<JournalEntryDto>> CreateJournal(Guid tripId, [FromBody] CreateJournalRequest request)
        {
            var result = await _memoryService.CreateJournalAsync(tripId, request, UserId);
            return HandleResult(result);
        }

        [HttpGet("trips/{tripId}/journals")]
        public async Task<ActionResult<IEnumerable<JournalEntryDto>>> GetJournals(Guid tripId)
        {
            var result = await _memoryService.GetJournalsByTripAsync(tripId, UserId);
            return HandleResult(result);
        }

        [HttpPut("journals/{journalId}")]
        public async Task<ActionResult<JournalEntryDto>> UpdateJournal(Guid journalId, [FromBody] CreateJournalRequest request)
        {
            var result = await _memoryService.UpdateJournalAsync(journalId, request, UserId);
            return HandleResult(result);
        }

        [HttpDelete("journals/{journalId}")]
        public async Task<IActionResult> DeleteJournal(Guid journalId)
        {
            var result = await _memoryService.DeleteJournalAsync(journalId, UserId);
            return HandleResult(result);
        }

        [HttpGet("trips/{tripId}/timeline")]
        public async Task<ActionResult<IEnumerable<MemoryTimelineItemDto>>> GetTimeline(Guid tripId)
        {
            var result = await _memoryService.GetMemoryTimelineAsync(tripId, UserId);
            return HandleResult(result);
        }

        [HttpGet("trips/{tripId}/summary")]
        public async Task<ActionResult<TripSummaryDto>> GetSummary(Guid tripId)
        {
            var result = await _memoryService.GetTripSummaryAsync(tripId, UserId);
            return HandleResult(result);
        }

        [HttpGet("tags")]
        public async Task<ActionResult<IEnumerable<MemoryTagDto>>> GetTags()
        {
            var result = await _memoryService.GetAllTagsAsync();
            return HandleResult(result);
        }
    }
}
