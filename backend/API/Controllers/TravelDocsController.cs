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

        public TravelDocsController(ITravelDocService travelDocService)
        {
            _travelDocService = travelDocService;
        }

        // --- Packing Lists ---
        [HttpGet("trips/{tripId}/packing-lists")]
        public async Task<ActionResult<IEnumerable<PackingListDto>>> GetPackingLists(Guid tripId)
        {
            var result = await _travelDocService.GetPackingListsAsync(tripId);
            return Ok(result);
        }

        [HttpPost("trips/{tripId}/packing-lists")]
        public async Task<ActionResult<PackingListDto>> CreatePackingList(Guid tripId, CreatePackingListRequest request)
        {
            var result = await _travelDocService.CreatePackingListAsync(tripId, request);
            return Ok(result);
        }

        [HttpPost("packing-lists/{listId}/items")]
        public async Task<ActionResult<PackingListDto>> AddPackingItem(Guid listId, AddPackingItemRequest request)
        {
            var result = await _travelDocService.AddPackingItemAsync(listId, request);
            if (result == null) return NotFound("Packing list not found");
            return Ok(result);
        }

        [HttpPut("packing-items/{itemId}")]
        public async Task<IActionResult> UpdatePackingItem(Guid itemId, [FromBody] bool isPacked)
        {
            await _travelDocService.UpdatePackingItemAsync(itemId, isPacked);
            return NoContent();
        }

        [HttpDelete("packing-lists/{listId}")]
        public async Task<IActionResult> DeletePackingList(Guid listId)
        {
            await _travelDocService.DeletePackingListAsync(listId);
            return NoContent();
        }

        [HttpDelete("packing-items/{itemId}")]
        public async Task<IActionResult> DeletePackingItem(Guid itemId)
        {
            await _travelDocService.DeletePackingItemAsync(itemId);
            return NoContent();
        }

        // --- Checklists ---
        [HttpGet("trips/{tripId}/checklists")]
        public async Task<ActionResult<IEnumerable<ChecklistDto>>> GetChecklists(Guid tripId)
        {
            var result = await _travelDocService.GetChecklistsAsync(tripId);
            return Ok(result);
        }

        [HttpPost("trips/{tripId}/checklists")]
        public async Task<ActionResult<ChecklistDto>> CreateChecklist(Guid tripId, CreateChecklistRequest request)
        {
            var result = await _travelDocService.CreateChecklistAsync(tripId, request);
            return Ok(result);
        }

        [HttpPost("checklists/{checklistId}/items")]
        public async Task<ActionResult<ChecklistDto>> AddChecklistItem(Guid checklistId, AddChecklistItemRequest request)
        {
            var result = await _travelDocService.AddChecklistItemAsync(checklistId, request);
            if (result == null) return NotFound("Checklist not found");
            return Ok(result);
        }

        [HttpPut("checklist-items/{itemId}")]
        public async Task<IActionResult> UpdateChecklistItem(Guid itemId, [FromBody] bool isCompleted)
        {
            await _travelDocService.UpdateChecklistItemAsync(itemId, isCompleted);
            return NoContent();
        }

        [HttpDelete("checklists/{checklistId}")]
        public async Task<IActionResult> DeleteChecklist(Guid checklistId)
        {
            await _travelDocService.DeleteChecklistAsync(checklistId);
            return NoContent();
        }

        [HttpDelete("checklist-items/{itemId}")]
        public async Task<IActionResult> DeleteChecklistItem(Guid itemId)
        {
            await _travelDocService.DeleteChecklistItemAsync(itemId);
            return NoContent();
        }

        // --- Emergency Contacts ---
        [HttpGet("trips/{tripId}/contacts")]
        public async Task<ActionResult<IEnumerable<EmergencyContactDto>>> GetContacts(Guid tripId)
        {
            var result = await _travelDocService.GetEmergencyContactsAsync(tripId);
            return Ok(result);
        }

        [HttpPost("trips/{tripId}/contacts")]
        public async Task<ActionResult<EmergencyContactDto>> CreateContact(Guid tripId, CreateEmergencyContactRequest request)
        {
            var result = await _travelDocService.CreateEmergencyContactAsync(tripId, request);
            return Ok(result);
        }

        [HttpPut("contacts/{id}")]
        public async Task<IActionResult> UpdateContact(Guid id, CreateEmergencyContactRequest request)
        {
            await _travelDocService.UpdateEmergencyContactAsync(id, request);
            return NoContent();
        }

        [HttpDelete("contacts/{id}")]
        public async Task<IActionResult> DeleteContact(Guid id)
        {
            await _travelDocService.DeleteEmergencyContactAsync(id);
            return NoContent();
        }

        // --- Travel Documents ---
        [HttpGet("trips/{tripId}/documents")]
        public async Task<ActionResult<IEnumerable<TravelDocumentDto>>> GetDocuments(Guid tripId)
        {
            var result = await _travelDocService.GetTravelDocumentsAsync(tripId);
            return Ok(result);
        }

        [HttpPost("trips/{tripId}/documents")]
        public async Task<ActionResult<TravelDocumentDto>> UploadDocument(Guid tripId, [FromForm] string title, [FromForm] TravelDocumentType type, IFormFile file)
        {
            if (file == null || file.Length == 0) return BadRequest("No file uploaded");

            using var ms = new MemoryStream();
            await file.CopyToAsync(ms);
            var fileData = ms.ToArray();

            var result = await _travelDocService.UploadDocumentAsync(tripId, title, type, file.FileName, file.ContentType, file.Length, fileData);
            return Ok(result);
        }

        [HttpGet("documents/{id}/download")]
        public async Task<IActionResult> DownloadDocument(Guid id)
        {
            var (fileData, contentType, fileName) = await _travelDocService.DownloadDocumentAsync(id);
            if (fileData == null) return NotFound();

            return File(fileData, contentType, fileName);
        }

        [HttpDelete("documents/{id}")]
        public async Task<IActionResult> DeleteDocument(Guid id)
        {
            await _travelDocService.DeleteDocumentAsync(id);
            return NoContent();
        }

        // --- Local Information ---
        [HttpGet("trips/{tripId}/local-info")]
        public async Task<ActionResult<IEnumerable<LocalInfoNoteDto>>> GetLocalInfo(Guid tripId)
        {
            var result = await _travelDocService.GetLocalInfoNotesAsync(tripId);
            return Ok(result);
        }

        [HttpPost("trips/{tripId}/local-info")]
        public async Task<ActionResult<LocalInfoNoteDto>> CreateLocalInfo(Guid tripId, CreateLocalInfoNoteRequest request)
        {
            var result = await _travelDocService.CreateLocalInfoNoteAsync(tripId, request);
            return Ok(result);
        }

        [HttpPut("local-info/{id}")]
        public async Task<IActionResult> UpdateLocalInfo(Guid id, CreateLocalInfoNoteRequest request)
        {
            await _travelDocService.UpdateLocalInfoNoteAsync(id, request);
            return NoContent();
        }

        [HttpDelete("local-info/{id}")]
        public async Task<IActionResult> DeleteLocalInfo(Guid id)
        {
            await _travelDocService.DeleteLocalInfoNoteAsync(id);
            return NoContent();
        }
    }
}
