using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using Application.DTOs.Expense;
using Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[ApiController]
[Authorize]
public class ExpensesController : ControllerBase
{
    private readonly IExpenseService _expenseService;

    public ExpensesController(IExpenseService expenseService)
    {
        _expenseService = expenseService;
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

    [HttpGet("api/trips/{tripId:guid}/expenses")]
    public async Task<ActionResult<IEnumerable<ExpenseResponse>>> GetTripExpenses(Guid tripId, CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        var response = await _expenseService.GetTripExpensesAsync(tripId, userId, cancellationToken);
        return Ok(response);
    }

    [HttpPost("api/trips/{tripId:guid}/expenses")]
    public async Task<ActionResult<ExpenseResponse>> CreateExpense(Guid tripId, [FromBody] CreateExpenseRequest request, CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        request.TripId = tripId;
        var response = await _expenseService.CreateExpenseAsync(request, userId, cancellationToken);
        return CreatedAtAction(nameof(GetExpense), new { id = response.Id }, response);
    }

    [HttpGet("api/expenses/{id:guid}")]
    public async Task<ActionResult<ExpenseResponse>> GetExpense(Guid id, CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        var response = await _expenseService.GetExpenseAsync(id, userId, cancellationToken);
        if (response == null) return NotFound();
        return Ok(response);
    }

    [HttpPut("api/expenses/{id:guid}")]
    public async Task<ActionResult<ExpenseResponse>> UpdateExpense(Guid id, [FromBody] UpdateExpenseRequest request, CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        try
        {
            var response = await _expenseService.UpdateExpenseAsync(id, request, userId, cancellationToken);
            return Ok(response);
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }

    [HttpDelete("api/expenses/{id:guid}")]
    public async Task<ActionResult> DeleteExpense(Guid id, CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        try
        {
            await _expenseService.DeleteExpenseAsync(id, userId, cancellationToken);
            return NoContent();
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }
}
