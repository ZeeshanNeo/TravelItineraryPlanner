using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Application.Common.Interfaces;
using Application.DTOs.Booking;
using Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class BookingsController : ControllerBase
{
    private readonly IBookingService _bookingService;
    private readonly IBookingDocumentService _bookingDocumentService;
    private readonly ICurrentUserService _currentUser;

    public BookingsController(
        IBookingService bookingService,
        IBookingDocumentService bookingDocumentService,
        ICurrentUserService currentUser)
    {
        _bookingService = bookingService;
        _bookingDocumentService = bookingDocumentService;
        _currentUser = currentUser;
    }

    private Guid UserId => _currentUser.UserId ?? throw new UnauthorizedAccessException("Invalid token.");

    [HttpPost]
    public async Task<ActionResult<BookingResponse>> CreateBooking([FromBody] CreateBookingRequest request, CancellationToken cancellationToken)
    {
        var result = await _bookingService.CreateBookingAsync(request, UserId, cancellationToken);
        
        return result.IsSuccess 
            ? CreatedAtAction(nameof(GetBookings), new { id = result.Value!.Id }, result.Value)
            : BadRequest(new { error = result.Error });
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
        if (id.HasValue)
        {
            var result = await _bookingService.GetBookingAsync(id.Value, UserId, cancellationToken);
            return result.IsSuccess ? Ok(new List<BookingResponse> { result.Value! }) : NotFound(new { error = result.Error });
        }

        var results = await _bookingService.GetUserBookingsAsync(UserId, tripId, category, status, includeArchived, cancellationToken);
        return Ok(results.Value);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<BookingResponse>> UpdateBooking(Guid id, [FromBody] UpdateBookingRequest request, CancellationToken cancellationToken)
    {
        var result = await _bookingService.UpdateBookingAsync(id, request, UserId, cancellationToken);
        
        return result.IsSuccess 
            ? Ok(result.Value)
            : result.Error.Contains("not found") ? NotFound(new { error = result.Error }) : BadRequest(new { error = result.Error });
    }

    [HttpPatch("{id:guid}/archive")]
    public async Task<ActionResult> ArchiveBooking(Guid id, [FromBody] ArchiveBookingRequest request, CancellationToken cancellationToken)
    {
        var result = await _bookingService.ArchiveBookingAsync(id, request.IsArchived, UserId, cancellationToken);
        
        return result.IsSuccess 
            ? NoContent()
            : NotFound(new { error = result.Error });
    }

    [HttpDelete("{id:guid}")]
    public async Task<ActionResult> DeleteBooking(Guid id, CancellationToken cancellationToken)
    {
        var result = await _bookingService.DeleteBookingAsync(id, UserId, cancellationToken);
        
        return result.IsSuccess 
            ? NoContent()
            : NotFound(new { error = result.Error });
    }

    // Document endpoints
    [HttpPost("{id:guid}/documents")]
    public async Task<ActionResult<BookingDocumentResponse>> UploadDocument(Guid id, IFormFile file, CancellationToken cancellationToken)
    {
        using var stream = new System.IO.MemoryStream();
        await file.CopyToAsync(stream, cancellationToken);
        
        var fileRequest = new FileUploadRequest
        {
            FileName = file.FileName,
            Content = stream.ToArray(),
            ContentType = file.ContentType,
            FileSize = file.Length
        };

        var result = await _bookingDocumentService.UploadDocumentAsync(id, fileRequest, UserId, cancellationToken);
        
        return result.IsSuccess 
            ? CreatedAtAction(nameof(GetDocument), new { id = id, documentId = result.Value!.Id }, result.Value)
            : result.Error.Contains("not found") ? NotFound(new { error = result.Error }) : BadRequest(new { error = result.Error });
    }

    [HttpGet("{id:guid}/documents")]
    public async Task<ActionResult<IEnumerable<BookingDocumentResponse>>> GetDocuments(Guid id, CancellationToken cancellationToken)
    {
        var result = await _bookingDocumentService.GetDocumentsAsync(id, UserId, cancellationToken);
        
        return result.IsSuccess 
            ? Ok(result.Value)
            : NotFound(new { error = result.Error });
    }

    [HttpGet("{id:guid}/documents/{documentId:guid}")]
    public async Task<ActionResult<BookingDocumentResponse>> GetDocument(Guid id, Guid documentId, CancellationToken cancellationToken)
    {
        var result = await _bookingDocumentService.GetDocumentAsync(id, documentId, UserId, cancellationToken);
        
        return result.IsSuccess 
            ? Ok(result.Value)
            : NotFound(new { error = result.Error });
    }

    [HttpGet("{id:guid}/documents/{documentId:guid}/download")]
    public async Task<IActionResult> DownloadDocument(Guid id, Guid documentId, CancellationToken cancellationToken)
    {
        var result = await _bookingDocumentService.DownloadDocumentAsync(id, documentId, UserId, cancellationToken);
        if (!result.IsSuccess)
            return NotFound(new { error = result.Error });

        var docResult = await _bookingDocumentService.GetDocumentAsync(id, documentId, UserId, cancellationToken);
        return File(result.Value!, docResult.Value!.ContentType, docResult.Value!.FileName);
    }

    [HttpDelete("{id:guid}/documents/{documentId:guid}")]
    public async Task<ActionResult> DeleteDocument(Guid id, Guid documentId, CancellationToken cancellationToken)
    {
        var result = await _bookingDocumentService.DeleteDocumentAsync(id, documentId, UserId, cancellationToken);
        
        return result.IsSuccess 
            ? NoContent()
            : NotFound(new { error = result.Error });
    }

    [HttpGet("summary/{tripId:guid}")]
    public async Task<ActionResult<BookingSummaryResponse>> GetSummary(Guid tripId, CancellationToken cancellationToken)
    {
        var result = await _bookingService.GetBookingSummaryAsync(UserId, tripId, cancellationToken);
        
        return result.IsSuccess 
            ? Ok(result.Value)
            : result.Error.Contains("not found") ? NotFound(new { error = result.Error }) : BadRequest(new { error = result.Error });
    }
}

public class ArchiveBookingRequest
{
    public bool IsArchived { get; set; }
}