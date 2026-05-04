using System;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using Application.DTOs.Budget;
using Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[ApiController]
[Route("api/trips/{tripId:guid}/[controller]")]
[Authorize]
public class BudgetsController : ControllerBase
{
    private readonly IBudgetService _budgetService;

    public BudgetsController(IBudgetService budgetService)
    {
        _budgetService = budgetService;
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

    [HttpGet]
    public async Task<ActionResult<TripBudgetResponse>> GetBudget(Guid tripId, CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        var response = await _budgetService.GetBudgetAsync(tripId, userId, cancellationToken);
        return Ok(response);
    }

    [HttpPut]
    public async Task<ActionResult<TripBudgetResponse>> UpdateBudget(Guid tripId, [FromBody] UpdateTripBudgetRequest request, CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        var response = await _budgetService.UpdateBudgetAsync(tripId, request, userId, cancellationToken);
        return Ok(response);
    }

    [HttpGet("summary")]
    public async Task<ActionResult<BudgetSummaryResponse>> GetSummary(Guid tripId, CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        var response = await _budgetService.GetBudgetSummaryAsync(tripId, userId, cancellationToken);
        return Ok(response);
    }
}
