using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using Application.DTOs.Trip;
using Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TripsController : ControllerBase
{
    private readonly ITripService _tripService;

    public TripsController(ITripService tripService)
    {
        _tripService = tripService;
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
    public async Task<ActionResult<TripResponse>> CreateTrip([FromBody] CreateTripRequest request, CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        var response = await _tripService.CreateTripAsync(request, userId, cancellationToken);
        return CreatedAtAction(nameof(GetTrip), new { id = response.Id }, response);
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<TripResponse>>> GetTrips([FromQuery] bool includeArchived = false, CancellationToken cancellationToken = default)
    {
        var userId = GetUserId();
        var response = await _tripService.GetUserTripsAsync(userId, includeArchived, cancellationToken);
        return Ok(response);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<TripResponse>> GetTrip(Guid id, CancellationToken cancellationToken)
    {
        try
        {
            var userId = GetUserId();
            var response = await _tripService.GetTripAsync(id, userId, cancellationToken);
            return Ok(response);
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<TripResponse>> UpdateTrip(Guid id, [FromBody] UpdateTripRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var userId = GetUserId();
            var response = await _tripService.UpdateTripAsync(id, request, userId, cancellationToken);
            return Ok(response);
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }

    [HttpPatch("{id:guid}/archive")]
    public async Task<ActionResult> ArchiveTrip(Guid id, [FromBody] ArchiveTripRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var userId = GetUserId();
            await _tripService.ArchiveTripAsync(id, request, userId, cancellationToken);
            return NoContent();
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }

    [HttpDelete("{id:guid}")]
    public async Task<ActionResult> DeleteTrip(Guid id, CancellationToken cancellationToken)
    {
        try
        {
            var userId = GetUserId();
            await _tripService.DeleteTripAsync(id, userId, cancellationToken);
            return NoContent();
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }
    
    [HttpGet("statistics")]
    public async Task<ActionResult<GlobalStatisticsResponse>> GetStatistics(CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        var response = await _tripService.GetGlobalStatisticsAsync(userId, cancellationToken);
        return Ok(response);
    }
}
