using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Application.Common.Interfaces;
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
    private readonly ICurrentUserService _currentUser;

    public TripsController(ITripService tripService, ICurrentUserService currentUser)
    {
        _tripService = tripService;
        _currentUser = currentUser;
    }

    private Guid UserId => _currentUser.UserId ?? throw new UnauthorizedAccessException("Invalid token.");

    [HttpPost]
    public async Task<ActionResult<TripResponse>> CreateTrip([FromBody] CreateTripRequest request, CancellationToken cancellationToken)
    {
        var result = await _tripService.CreateTripAsync(request, UserId, cancellationToken);
        
        return result.IsSuccess 
            ? CreatedAtAction(nameof(GetTrip), new { id = result.Value!.Id }, result.Value)
            : BadRequest(new { error = result.Error });
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<TripResponse>>> GetTrips([FromQuery] bool includeArchived = false, CancellationToken cancellationToken = default)
    {
        var result = await _tripService.GetUserTripsAsync(UserId, includeArchived, cancellationToken);
        return Ok(result.Value);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<TripResponse>> GetTrip(Guid id, CancellationToken cancellationToken)
    {
        var result = await _tripService.GetTripAsync(id, UserId, cancellationToken);
        
        return result.IsSuccess 
            ? Ok(result.Value)
            : NotFound(new { error = result.Error });
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<TripResponse>> UpdateTrip(Guid id, [FromBody] UpdateTripRequest request, CancellationToken cancellationToken)
    {
        var result = await _tripService.UpdateTripAsync(id, request, UserId, cancellationToken);
        
        return result.IsSuccess 
            ? Ok(result.Value)
            : result.Error == "Trip not found." ? NotFound() : BadRequest(new { error = result.Error });
    }

    [HttpPatch("{id:guid}/archive")]
    public async Task<ActionResult> ArchiveTrip(Guid id, [FromBody] ArchiveTripRequest request, CancellationToken cancellationToken)
    {
        var result = await _tripService.ArchiveTripAsync(id, request, UserId, cancellationToken);
        
        return result.IsSuccess 
            ? NoContent()
            : result.Error == "Trip not found." ? NotFound() : BadRequest(new { error = result.Error });
    }

    [HttpDelete("{id:guid}")]
    public async Task<ActionResult> DeleteTrip(Guid id, CancellationToken cancellationToken)
    {
        var result = await _tripService.DeleteTripAsync(id, UserId, cancellationToken);
        
        return result.IsSuccess 
            ? NoContent()
            : result.Error == "Trip not found." ? NotFound() : BadRequest(new { error = result.Error });
    }
}
