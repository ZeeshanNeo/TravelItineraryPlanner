using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Application.Common.Interfaces;
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
    private readonly ICurrentUserService _currentUser;

    public ItinerariesController(IItineraryService itineraryService, ICurrentUserService currentUser)
    {
        _itineraryService = itineraryService;
        _currentUser = currentUser;
    }

    private Guid UserId => _currentUser.UserId ?? throw new UnauthorizedAccessException("Invalid token.");

    // Itinerary endpoints

    [HttpPost]
    public async Task<ActionResult<ItineraryResponse>> CreateItinerary([FromBody] CreateItineraryRequest request, CancellationToken cancellationToken)
    {
        var result = await _itineraryService.CreateItineraryAsync(request, UserId, cancellationToken);
        
        return result.IsSuccess 
            ? CreatedAtAction(nameof(GetItinerary), new { id = result.Value!.Id }, result.Value)
            : BadRequest(new { error = result.Error });
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ItineraryResponse>>> GetItineraries([FromQuery] bool includeArchived = false, CancellationToken cancellationToken = default)
    {
        var result = await _itineraryService.GetItinerariesByUserAsync(UserId, includeArchived, cancellationToken);
        return Ok(result.Value);
    }

    [HttpGet("trip/{tripId:guid}")]
    public async Task<ActionResult<IEnumerable<ItineraryResponse>>> GetItinerariesByTrip(Guid tripId, [FromQuery] bool includeArchived = false, CancellationToken cancellationToken = default)
    {
        var result = await _itineraryService.GetItinerariesByTripAsync(tripId, UserId, includeArchived, cancellationToken);
        
        return result.IsSuccess 
            ? Ok(result.Value)
            : NotFound(new { error = result.Error });
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ItineraryResponse>> GetItinerary(Guid id, CancellationToken cancellationToken)
    {
        var result = await _itineraryService.GetItineraryAsync(id, UserId, cancellationToken);
        
        return result.IsSuccess 
            ? Ok(result.Value)
            : NotFound(new { error = result.Error });
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<ItineraryResponse>> UpdateItinerary(Guid id, [FromBody] UpdateItineraryRequest request, CancellationToken cancellationToken)
    {
        var result = await _itineraryService.UpdateItineraryAsync(id, request, UserId, cancellationToken);
        
        return result.IsSuccess 
            ? Ok(result.Value)
            : result.Error.Contains("not found") ? NotFound(new { error = result.Error }) : BadRequest(new { error = result.Error });
    }

    [HttpPatch("{id:guid}/archive")]
    public async Task<ActionResult> ArchiveItinerary(Guid id, CancellationToken cancellationToken)
    {
        var result = await _itineraryService.ArchiveItineraryAsync(id, UserId, cancellationToken);
        
        return result.IsSuccess 
            ? NoContent()
            : NotFound(new { error = result.Error });
    }

    [HttpDelete("{id:guid}")]
    public async Task<ActionResult> DeleteItinerary(Guid id, CancellationToken cancellationToken)
    {
        var result = await _itineraryService.DeleteItineraryAsync(id, UserId, cancellationToken);
        
        return result.IsSuccess 
            ? NoContent()
            : NotFound(new { error = result.Error });
    }

    [HttpPost("{id:guid}/share")]
    public async Task<ActionResult<string>> GenerateShareLink(Guid id, CancellationToken cancellationToken)
    {
        var result = await _itineraryService.GenerateShareLinkAsync(id, UserId, cancellationToken);
        return result.IsSuccess ? Ok(new { shareToken = result.Value }) : BadRequest(new { error = result.Error });
    }

    [HttpDelete("{id:guid}/share")]
    public async Task<ActionResult> RevokeShareLink(Guid id, CancellationToken cancellationToken)
    {
        var result = await _itineraryService.RevokeShareLinkAsync(id, UserId, cancellationToken);
        return result.IsSuccess ? NoContent() : BadRequest(new { error = result.Error });
    }

    [HttpGet("{id:guid}/weather")]
    public async Task<ActionResult<WeatherForecastResponse>> GetWeather(Guid id, [FromQuery] DateTime date, CancellationToken cancellationToken)
    {
        var result = await _itineraryService.GetItineraryWeatherAsync(id, date, UserId, cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : BadRequest(new { error = result.Error });
    }

    // ItineraryDay endpoints

    [HttpPost("days")]
    public async Task<ActionResult<ItineraryDayResponse>> CreateItineraryDay([FromBody] CreateItineraryDayRequest request, CancellationToken cancellationToken)
    {
        var result = await _itineraryService.CreateItineraryDayAsync(request, UserId, cancellationToken);
        
        return result.IsSuccess 
            ? CreatedAtAction(nameof(GetItineraryDay), new { dayId = result.Value!.Id }, result.Value)
            : BadRequest(new { error = result.Error });
    }

    [HttpGet("days/{dayId:guid}")]
    public async Task<ActionResult<ItineraryDayResponse>> GetItineraryDay(Guid dayId, CancellationToken cancellationToken)
    {
        var result = await _itineraryService.GetItineraryDayAsync(dayId, UserId, cancellationToken);
        
        return result.IsSuccess 
            ? Ok(result.Value)
            : NotFound(new { error = result.Error });
    }

    [HttpGet("{itineraryId:guid}/days")]
    public async Task<ActionResult<IEnumerable<ItineraryDayResponse>>> GetItineraryDays(Guid itineraryId, CancellationToken cancellationToken)
    {
        var result = await _itineraryService.GetItineraryDaysAsync(itineraryId, UserId, cancellationToken);
        
        return result.IsSuccess 
            ? Ok(result.Value)
            : NotFound(new { error = result.Error });
    }

    [HttpPut("days/{dayId:guid}")]
    public async Task<ActionResult<ItineraryDayResponse>> UpdateItineraryDay(Guid dayId, [FromBody] UpdateItineraryDayRequest request, CancellationToken cancellationToken)
    {
        var result = await _itineraryService.UpdateItineraryDayAsync(dayId, request, UserId, cancellationToken);
        
        return result.IsSuccess 
            ? Ok(result.Value)
            : NotFound(new { error = result.Error });
    }

    [HttpDelete("days/{dayId:guid}")]
    public async Task<ActionResult> DeleteItineraryDay(Guid dayId, CancellationToken cancellationToken)
    {
        var result = await _itineraryService.DeleteItineraryDayAsync(dayId, UserId, cancellationToken);
        
        return result.IsSuccess 
            ? NoContent()
            : NotFound(new { error = result.Error });
    }

    // Activity endpoints

    [HttpPost("activities")]
    public async Task<ActionResult<ActivityResponse>> CreateActivity([FromBody] CreateActivityRequest request, CancellationToken cancellationToken)
    {
        var result = await _itineraryService.CreateActivityAsync(request, UserId, cancellationToken);
        
        return result.IsSuccess 
            ? CreatedAtAction(nameof(GetActivity), new { activityId = result.Value!.Id }, result.Value)
            : BadRequest(new { error = result.Error });
    }

    [HttpGet("activities/{activityId:guid}")]
    public async Task<ActionResult<ActivityResponse>> GetActivity(Guid activityId, CancellationToken cancellationToken)
    {
        var result = await _itineraryService.GetActivityAsync(activityId, UserId, cancellationToken);
        
        return result.IsSuccess 
            ? Ok(result.Value)
            : NotFound(new { error = result.Error });
    }

    [HttpGet("days/{dayId:guid}/activities")]
    public async Task<ActionResult<IEnumerable<ActivityResponse>>> GetActivitiesByDay(Guid dayId, CancellationToken cancellationToken)
    {
        var result = await _itineraryService.GetActivitiesByDayAsync(dayId, UserId, cancellationToken);
        
        return result.IsSuccess 
            ? Ok(result.Value)
            : NotFound(new { error = result.Error });
    }

    [HttpPut("activities/{activityId:guid}")]
    public async Task<ActionResult<ActivityResponse>> UpdateActivity(Guid activityId, [FromBody] UpdateActivityRequest request, CancellationToken cancellationToken)
    {
        var result = await _itineraryService.UpdateActivityAsync(activityId, request, UserId, cancellationToken);
        
        return result.IsSuccess 
            ? Ok(result.Value)
            : result.Error.Contains("not found") ? NotFound(new { error = result.Error }) : BadRequest(new { error = result.Error });
    }

    [HttpDelete("activities/{activityId:guid}")]
    public async Task<ActionResult> DeleteActivity(Guid activityId, CancellationToken cancellationToken)
    {
        var result = await _itineraryService.DeleteActivityAsync(activityId, UserId, cancellationToken);
        
        return result.IsSuccess 
            ? NoContent()
            : NotFound(new { error = result.Error });
    }

    [HttpPost("days/{dayId:guid}/reorder")]
    public async Task<ActionResult> ReorderActivities(Guid dayId, [FromBody] List<Guid> activityIdsInOrder, CancellationToken cancellationToken)
    {
        var result = await _itineraryService.ReorderActivitiesAsync(dayId, activityIdsInOrder, UserId, cancellationToken);
        
        return result.IsSuccess 
            ? NoContent()
            : NotFound(new { error = result.Error });
    }
}