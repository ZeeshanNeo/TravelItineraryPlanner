using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using Application.DTOs.Itinerary;
using Application.DTOs.ItineraryDay;
using Application.DTOs.Activity;
using Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ItinerariesController : ControllerBase
{
    private readonly IItineraryService _itineraryService;

    public ItinerariesController(IItineraryService itineraryService)
    {
        _itineraryService = itineraryService;
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

    // Itinerary endpoints

    [HttpPost]
    public async Task<ActionResult<ItineraryResponse>> CreateItinerary([FromBody] CreateItineraryRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var userId = GetUserId();
            var response = await _itineraryService.CreateItineraryAsync(request, userId, cancellationToken);
            return CreatedAtAction(nameof(GetItinerary), new { id = response.Id }, response);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ItineraryResponse>>> GetItineraries([FromQuery] bool includeArchived = false, CancellationToken cancellationToken = default)
    {
        var userId = GetUserId();
        var response = await _itineraryService.GetItinerariesByUserAsync(userId, includeArchived, cancellationToken);
        return Ok(response);
    }

    [HttpGet("trip/{tripId:guid}")]
    public async Task<ActionResult<IEnumerable<ItineraryResponse>>> GetItinerariesByTrip(Guid tripId, [FromQuery] bool includeArchived = false, CancellationToken cancellationToken = default)
    {
        try
        {
            var userId = GetUserId();
            var response = await _itineraryService.GetItinerariesByTripAsync(tripId, userId, includeArchived, cancellationToken);
            return Ok(response);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ItineraryResponse>> GetItinerary(Guid id, CancellationToken cancellationToken)
    {
        try
        {
            var userId = GetUserId();
            var response = await _itineraryService.GetItineraryAsync(id, userId, cancellationToken);
            return Ok(response);
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<ItineraryResponse>> UpdateItinerary(Guid id, [FromBody] UpdateItineraryRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var userId = GetUserId();
            var response = await _itineraryService.UpdateItineraryAsync(id, request, userId, cancellationToken);
            return Ok(response);
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }

    [HttpPatch("{id:guid}/archive")]
    public async Task<ActionResult> ArchiveItinerary(Guid id, CancellationToken cancellationToken)
    {
        try
        {
            var userId = GetUserId();
            await _itineraryService.ArchiveItineraryAsync(id, userId, cancellationToken);
            return NoContent();
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }

    [HttpDelete("{id:guid}")]
    public async Task<ActionResult> DeleteItinerary(Guid id, CancellationToken cancellationToken)
    {
        try
        {
            var userId = GetUserId();
            await _itineraryService.DeleteItineraryAsync(id, userId, cancellationToken);
            return NoContent();
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }

    // ItineraryDay endpoints

    [HttpPost("days")]
    public async Task<ActionResult<ItineraryDayResponse>> CreateItineraryDay([FromBody] CreateItineraryDayRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var userId = GetUserId();
            var response = await _itineraryService.CreateItineraryDayAsync(request, userId, cancellationToken);
            return CreatedAtAction(nameof(GetItineraryDay), new { dayId = response.Id }, response);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    [HttpGet("days/{dayId:guid}")]
    public async Task<ActionResult<ItineraryDayResponse>> GetItineraryDay(Guid dayId, CancellationToken cancellationToken)
    {
        try
        {
            var userId = GetUserId();
            var response = await _itineraryService.GetItineraryDayAsync(dayId, userId, cancellationToken);
            return Ok(response);
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }

    [HttpGet("{itineraryId:guid}/days")]
    public async Task<ActionResult<IEnumerable<ItineraryDayResponse>>> GetItineraryDays(Guid itineraryId, CancellationToken cancellationToken)
    {
        try
        {
            var userId = GetUserId();
            var response = await _itineraryService.GetItineraryDaysAsync(itineraryId, userId, cancellationToken);
            return Ok(response);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    [HttpPut("days/{dayId:guid}")]
    public async Task<ActionResult<ItineraryDayResponse>> UpdateItineraryDay(Guid dayId, [FromBody] UpdateItineraryDayRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var userId = GetUserId();
            var response = await _itineraryService.UpdateItineraryDayAsync(dayId, request, userId, cancellationToken);
            return Ok(response);
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }

    [HttpDelete("days/{dayId:guid}")]
    public async Task<ActionResult> DeleteItineraryDay(Guid dayId, CancellationToken cancellationToken)
    {
        try
        {
            var userId = GetUserId();
            await _itineraryService.DeleteItineraryDayAsync(dayId, userId, cancellationToken);
            return NoContent();
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }

    // Activity endpoints

    [HttpPost("activities")]
    public async Task<ActionResult<ActivityResponse>> CreateActivity([FromBody] CreateActivityRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var userId = GetUserId();
            var response = await _itineraryService.CreateActivityAsync(request, userId, cancellationToken);
            return CreatedAtAction(nameof(GetActivity), new { activityId = response.Id }, response);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    [HttpGet("activities/{activityId:guid}")]
    public async Task<ActionResult<ActivityResponse>> GetActivity(Guid activityId, CancellationToken cancellationToken)
    {
        try
        {
            var userId = GetUserId();
            var response = await _itineraryService.GetActivityAsync(activityId, userId, cancellationToken);
            return Ok(response);
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }

    [HttpGet("days/{dayId:guid}/activities")]
    public async Task<ActionResult<IEnumerable<ActivityResponse>>> GetActivitiesByDay(Guid dayId, CancellationToken cancellationToken)
    {
        try
        {
            var userId = GetUserId();
            var response = await _itineraryService.GetActivitiesByDayAsync(dayId, userId, cancellationToken);
            return Ok(response);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    [HttpPut("activities/{activityId:guid}")]
    public async Task<ActionResult<ActivityResponse>> UpdateActivity(Guid activityId, [FromBody] UpdateActivityRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var userId = GetUserId();
            var response = await _itineraryService.UpdateActivityAsync(activityId, request, userId, cancellationToken);
            return Ok(response);
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }

    [HttpDelete("activities/{activityId:guid}")]
    public async Task<ActionResult> DeleteActivity(Guid activityId, CancellationToken cancellationToken)
    {
        try
        {
            var userId = GetUserId();
            await _itineraryService.DeleteActivityAsync(activityId, userId, cancellationToken);
            return NoContent();
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }

    [HttpPost("days/{dayId:guid}/reorder")]
    public async Task<ActionResult> ReorderActivities(Guid dayId, [FromBody] List<Guid> activityIdsInOrder, CancellationToken cancellationToken)
    {
        try
        {
            var userId = GetUserId();
            await _itineraryService.ReorderActivitiesAsync(dayId, activityIdsInOrder, userId, cancellationToken);
            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }
}