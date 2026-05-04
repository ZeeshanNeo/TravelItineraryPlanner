using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using Application.DTOs.Booking;
using Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class BookingsController : ControllerBase
{
    private readonly IBookingService _bookingService;
    private readonly IBookingDocumentService _bookingDocumentService;

    public BookingsController(
        IBookingService bookingService,
        IBookingDocumentService bookingDocumentService)
    {
        _bookingService = bookingService;
        _bookingDocumentService = bookingDocumentService;
    }

    private Guid GetUserId()
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (Guid.TryParse(userIdString, out var userId))
        {
            return userId;
        }
        throw new UnauthorizedAccessException("Invalid token.");
    }

    [HttpPost]
    public async Task<ActionResult<BookingResponse>> CreateBooking([FromBody] CreateBookingRequest request, CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        var response = await _bookingService.CreateBookingAsync(request, userId, cancellationToken);
        return CreatedAtAction(nameof(GetBookings), new { id = response.Id }, response);
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<BookingResponse>>> GetBookings(
        [FromQuery] Guid? id = null,
        [FromQuery] Guid? tripId = null,
        [FromQuery] string? category = null,
        [FromQuery] string? status = null,
        [FromQuery] bool includeArchived = false,
        CancellationToken cancellationToken = default)
    {
        var userId = GetUserId();

        // If id is provided, return a single booking
        if (id.HasValue)
        {
            var booking = await _bookingService.GetBookingAsync(id.Value, userId, cancellationToken);
            if (booking == null)
                return NotFound();

            return Ok(new List<BookingResponse> { booking });
        }

        // Otherwise, return filtered list of bookings
        var response = await _bookingService.GetUserBookingsAsync(
            userId, tripId, category, status, includeArchived, cancellationToken);
        return Ok(response);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<BookingResponse>> UpdateBooking(Guid id, [FromBody] UpdateBookingRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var userId = GetUserId();
            var response = await _bookingService.UpdateBookingAsync(id, request, userId, cancellationToken);
            return Ok(response);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    [HttpPatch("{id:guid}/archive")]
    public async Task<ActionResult> ArchiveBooking(Guid id, [FromBody] ArchiveBookingRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var userId = GetUserId();
            await _bookingService.ArchiveBookingAsync(id, request.IsArchived, userId, cancellationToken);
            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    [HttpDelete("{id:guid}")]
    public async Task<ActionResult> DeleteBooking(Guid id, CancellationToken cancellationToken)
    {
        try
        {
            var userId = GetUserId();
            await _bookingService.DeleteBookingAsync(id, userId, cancellationToken);
            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    // Document endpoints
    [HttpPost("{id:guid}/documents")]
    public async Task<ActionResult<BookingDocumentResponse>> UploadDocument(Guid id, IFormFile file, CancellationToken cancellationToken)
    {
        try
        {
            var userId = GetUserId();
            
            using var stream = new System.IO.MemoryStream();
            await file.CopyToAsync(stream, cancellationToken);
            
            var fileRequest = new FileUploadRequest
            {
                FileName = file.FileName,
                Content = stream.ToArray(),
                ContentType = file.ContentType,
                FileSize = file.Length
            };

            var response = await _bookingDocumentService.UploadDocumentAsync(id, fileRequest, userId, cancellationToken);
            return CreatedAtAction(nameof(GetDocument), new { id = id, documentId = response.Id }, response);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("{id:guid}/documents")]
    public async Task<ActionResult<IEnumerable<BookingDocumentResponse>>> GetDocuments(Guid id, CancellationToken cancellationToken)
    {
        try
        {
            var userId = GetUserId();
            var response = await _bookingDocumentService.GetDocumentsAsync(id, userId, cancellationToken);
            return Ok(response);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    [HttpGet("{id:guid}/documents/{documentId:guid}")]
    public async Task<ActionResult<BookingDocumentResponse>> GetDocument(Guid id, Guid documentId, CancellationToken cancellationToken)
    {
        try
        {
            var userId = GetUserId();
            var response = await _bookingDocumentService.GetDocumentAsync(id, documentId, userId, cancellationToken);
            if (response == null)
                return NotFound();

            return Ok(response);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    [HttpGet("{id:guid}/documents/{documentId:guid}/download")]
    public async Task<IActionResult> DownloadDocument(Guid id, Guid documentId, CancellationToken cancellationToken)
    {
        try
        {
            var userId = GetUserId();
            var fileBytes = await _bookingDocumentService.DownloadDocumentAsync(id, documentId, userId, cancellationToken);
            
            // Get document info for content type
            var document = await _bookingDocumentService.GetDocumentAsync(id, documentId, userId, cancellationToken);
            if (document == null)
                return NotFound();

            return File(fileBytes, document.ContentType, document.FileName);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (System.IO.FileNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    [HttpDelete("{id:guid}/documents/{documentId:guid}")]
    public async Task<ActionResult> DeleteDocument(Guid id, Guid documentId, CancellationToken cancellationToken)
    {
        try
        {
            var userId = GetUserId();
            await _bookingDocumentService.DeleteDocumentAsync(id, documentId, userId, cancellationToken);
            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    [HttpGet("summary/{tripId:guid}")]
    public async Task<ActionResult<BookingSummaryResponse>> GetSummary(Guid tripId, CancellationToken cancellationToken)
    {
        try
        {
            var userId = GetUserId();
            var response = await _bookingService.GetBookingSummaryAsync(userId, tripId, cancellationToken);
            return Ok(response);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}

// Request DTO for archive operation
public class ArchiveBookingRequest
{
    public bool IsArchived { get; set; }
}