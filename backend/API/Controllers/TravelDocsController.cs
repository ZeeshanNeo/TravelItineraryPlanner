using Application.Common.Interfaces;
using Application.DTOs.TravelDocs;
using Application.Services;
using Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;

namespace API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class TravelDocsController : ControllerBase
    {
        private readonly ITravelDocService _travelDocService;
        private readonly ICurrentUserService _currentUser;

        public TravelDocsController(ITravelDocService travelDocService, ICurrentUserService currentUser)
        {
            _travelDocService = travelDocService;
            _currentUser = currentUser;
        }

        private Guid UserId => _currentUser.UserId ?? throw new UnauthorizedAccessException("Invalid token.");

        private ActionResult HandleResult(Application.Common.Models.Result result)
        {
            if (result.IsSuccess) return NoContent();
            if (result.Error.Contains("not found")) return NotFound(new { error = result.Error });
            if (result.Error.Contains("denied")) return Forbid();
            return BadRequest(new { error = result.Error });
        }

        private ActionResult HandleResult<T>(Application.Common.Models.Result<T> result)
        {
            if (result.IsSuccess) return Ok(result.Value);
            if (result.Error.Contains("not found")) return NotFound(new { error = result.Error });
            if (result.Error.Contains("denied")) return Forbid();
            return BadRequest(new { error = result.Error });
        }

        // --- Packing Lists ---
        [HttpGet("trips/{tripId}/packing-lists")]
        public async Task<ActionResult<IEnumerable<PackingListDto>>> GetPackingLists(Guid tripId)
        {
            var result = await _travelDocService.GetPackingListsAsync(tripId, UserId);
            return HandleResult(result);
        }

        [HttpPost("trips/{tripId}/packing-lists")]
        public async Task<ActionResult<PackingListDto>> CreatePackingList(Guid tripId, CreatePackingListRequest request)
        {
            var result = await _travelDocService.CreatePackingListAsync(tripId, request, UserId);
            return HandleResult(result);
        }

        [HttpPost("packing-lists/{listId}/items")]
        public async Task<ActionResult<PackingListDto>> AddPackingItem(Guid listId, AddPackingItemRequest request)
        {
            var result = await _travelDocService.AddPackingItemAsync(listId, request, UserId);
            return HandleResult(result);
        }

        [HttpPut("packing-items/{itemId}")]
        public async Task<IActionResult> UpdatePackingItem(Guid itemId, [FromBody] bool isPacked)
        {
            var result = await _travelDocService.UpdatePackingItemAsync(itemId, isPacked, UserId);
            return HandleResult(result);
        }

        [HttpDelete("packing-lists/{listId}")]
        public async Task<IActionResult> DeletePackingList(Guid listId)
        {
            var result = await _travelDocService.DeletePackingListAsync(listId, UserId);
            return HandleResult(result);
        }

        [HttpDelete("packing-items/{itemId}")]
        public async Task<IActionResult> DeletePackingItem(Guid itemId)
        {
            var result = await _travelDocService.DeletePackingItemAsync(itemId, UserId);
            return HandleResult(result);
        }

        [HttpGet("packing-templates")]
        public async Task<ActionResult<IEnumerable<PackingListDto>>> GetTemplates([FromQuery] string? category = null)
        {
            var result = await _travelDocService.GetPackingTemplatesAsync(category);
            return HandleResult(result);
        }

        [HttpPost("trips/{tripId}/packing-lists/from-template/{templateId}")]
        public async Task<ActionResult<PackingListDto>> CreateFromTemplate(Guid tripId, Guid templateId)
        {
            var result = await _travelDocService.CreatePackingListFromTemplateAsync(tripId, templateId, UserId);
            return HandleResult(result);
        }

        // --- Checklists ---
        [HttpPost("trips/{tripId}/checklists/auto-generate")]
        public async Task<ActionResult<ChecklistDto>> AutoGenerateChecklist(Guid tripId)
        {
            var result = await _travelDocService.AutoGenerateChecklistAsync(tripId, UserId);
            return HandleResult(result);
        }

        [HttpGet("trips/{tripId}/checklists")]
        public async Task<ActionResult<IEnumerable<ChecklistDto>>> GetChecklists(Guid tripId)
        {
            var result = await _travelDocService.GetChecklistsAsync(tripId, UserId);
            return HandleResult(result);
        }

        [HttpPost("trips/{tripId}/checklists")]
        public async Task<ActionResult<ChecklistDto>> CreateChecklist(Guid tripId, CreateChecklistRequest request)
        {
            var result = await _travelDocService.CreateChecklistAsync(tripId, request, UserId);
            return HandleResult(result);
        }

        [HttpPost("checklists/{checklistId}/items")]
        public async Task<ActionResult<ChecklistDto>> AddChecklistItem(Guid checklistId, AddChecklistItemRequest request)
        {
            var result = await _travelDocService.AddChecklistItemAsync(checklistId, request, UserId);
            return HandleResult(result);
        }

        [HttpPut("checklist-items/{itemId}")]
        public async Task<IActionResult> UpdateChecklistItem(Guid itemId, [FromBody] bool isCompleted)
        {
            var result = await _travelDocService.UpdateChecklistItemAsync(itemId, isCompleted, UserId);
            return HandleResult(result);
        }

        [HttpDelete("checklists/{checklistId}")]
        public async Task<IActionResult> DeleteChecklist(Guid checklistId)
        {
            var result = await _travelDocService.DeleteChecklistAsync(checklistId, UserId);
            return HandleResult(result);
        }

        [HttpDelete("checklist-items/{itemId}")]
        public async Task<IActionResult> DeleteChecklistItem(Guid itemId)
        {
            var result = await _travelDocService.DeleteChecklistItemAsync(itemId, UserId);
            return HandleResult(result);
        }

        // --- Emergency Contacts ---
        [HttpGet("trips/{tripId}/contacts")]
        public async Task<ActionResult<IEnumerable<EmergencyContactDto>>> GetContacts(Guid tripId)
        {
            var result = await _travelDocService.GetEmergencyContactsAsync(tripId, UserId);
            return HandleResult(result);
        }

        [HttpPost("trips/{tripId}/contacts")]
        public async Task<ActionResult<EmergencyContactDto>> CreateContact(Guid tripId, CreateEmergencyContactRequest request)
        {
            var result = await _travelDocService.CreateEmergencyContactAsync(tripId, request, UserId);
            return HandleResult(result);
        }

        [HttpPut("contacts/{id}")]
        public async Task<IActionResult> UpdateContact(Guid id, CreateEmergencyContactRequest request)
        {
            var result = await _travelDocService.UpdateEmergencyContactAsync(id, request, UserId);
            return HandleResult(result);
        }

        [HttpDelete("contacts/{id}")]
        public async Task<IActionResult> DeleteContact(Guid id)
        {
            var result = await _travelDocService.DeleteEmergencyContactAsync(id, UserId);
            return HandleResult(result);
        }

        // --- Travel Documents ---
        [HttpGet("trips/{tripId}/documents")]
        public async Task<ActionResult<IEnumerable<TravelDocumentDto>>> GetDocuments(Guid tripId)
        {
            var result = await _travelDocService.GetTravelDocumentsAsync(tripId, UserId);
            return HandleResult(result);
        }

        [HttpPost("trips/{tripId}/documents")]
        public async Task<ActionResult<TravelDocumentDto>> UploadDocument(Guid tripId, [FromForm] string title, [FromForm] TravelDocumentType type, IFormFile file)
        {
            if (file == null || file.Length == 0) return BadRequest("No file uploaded");

            using var ms = new MemoryStream();
            await file.CopyToAsync(ms);
            var fileData = ms.ToArray();

            var result = await _travelDocService.UploadDocumentAsync(tripId, title, type, file.FileName, file.ContentType, file.Length, fileData, UserId);
            return HandleResult(result);
        }

        [HttpGet("documents/{id}/download")]
        public async Task<IActionResult> DownloadDocument(Guid id)
        {
            var result = await _travelDocService.DownloadDocumentAsync(id, UserId);
            if (!result.IsSuccess) return HandleResult(result);

            var (fileData, contentType, fileName) = result.Value;
            return File(fileData, contentType, fileName);
        }

        [HttpDelete("documents/{id}")]
        public async Task<IActionResult> DeleteDocument(Guid id)
        {
            var result = await _travelDocService.DeleteDocumentAsync(id, UserId);
            return HandleResult(result);
        }

        // --- Local Information ---
        [HttpGet("trips/{tripId}/local-info")]
        public async Task<ActionResult<IEnumerable<LocalInfoNoteDto>>> GetLocalInfo(Guid tripId)
        {
            var result = await _travelDocService.GetLocalInfoNotesAsync(tripId, UserId);
            return HandleResult(result);
        }

        [HttpPost("trips/{tripId}/local-info")]
        public async Task<ActionResult<LocalInfoNoteDto>> CreateLocalInfo(Guid tripId, CreateLocalInfoNoteRequest request)
        {
            var result = await _travelDocService.CreateLocalInfoNoteAsync(tripId, request, UserId);
            return HandleResult(result);
        }

        [HttpPut("local-info/{id}")]
        public async Task<IActionResult> UpdateLocalInfo(Guid id, CreateLocalInfoNoteRequest request)
        {
            var result = await _travelDocService.UpdateLocalInfoNoteAsync(id, request, UserId);
            return HandleResult(result);
        }

        [HttpDelete("local-info/{id}")]
        public async Task<IActionResult> DeleteLocalInfo(Guid id)
        {
            var result = await _travelDocService.DeleteLocalInfoNoteAsync(id, UserId);
            return HandleResult(result);
        }
    }
}
