using System;
using System.Threading;
using System.Threading.Tasks;
using Application.Common.Interfaces;
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
    private readonly ICurrentUserService _currentUser;

    public BudgetsController(IBudgetService budgetService, ICurrentUserService currentUser)
    {
        _budgetService = budgetService;
        _currentUser = currentUser;
    }

    private Guid UserId => _currentUser.UserId ?? throw new UnauthorizedAccessException("Invalid token.");

    [HttpGet]
    public async Task<ActionResult<TripBudgetResponse>> GetBudget(Guid tripId, CancellationToken cancellationToken)
    {
        var result = await _budgetService.GetBudgetAsync(tripId, UserId, cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : NotFound(new { error = result.Error });
    }

    [HttpPut]
    public async Task<ActionResult<TripBudgetResponse>> UpdateBudget(Guid tripId, [FromBody] UpdateTripBudgetRequest request, CancellationToken cancellationToken)
    {
        var result = await _budgetService.UpdateBudgetAsync(tripId, request, UserId, cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : BadRequest(new { error = result.Error });
    }

    [HttpGet("summary")]
    public async Task<ActionResult<BudgetSummaryResponse>> GetSummary(Guid tripId, CancellationToken cancellationToken)
    {
        var result = await _budgetService.GetBudgetSummaryAsync(tripId, UserId, cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : NotFound(new { error = result.Error });
    }
}
