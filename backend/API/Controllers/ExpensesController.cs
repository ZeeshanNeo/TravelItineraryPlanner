using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Application.Common.Interfaces;
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
    private readonly ICurrentUserService _currentUser;

    public ExpensesController(IExpenseService expenseService, ICurrentUserService currentUser)
    {
        _expenseService = expenseService;
        _currentUser = currentUser;
    }

    private Guid UserId => _currentUser.UserId ?? throw new UnauthorizedAccessException("Invalid token.");

    [HttpGet("api/trips/{tripId:guid}/expenses")]
    public async Task<ActionResult<IEnumerable<ExpenseResponse>>> GetTripExpenses(Guid tripId, CancellationToken cancellationToken)
    {
        var result = await _expenseService.GetTripExpensesAsync(tripId, UserId, cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : NotFound(new { error = result.Error });
    }

    [HttpPost("api/trips/{tripId:guid}/expenses")]
    public async Task<ActionResult<ExpenseResponse>> CreateExpense(Guid tripId, [FromBody] CreateExpenseRequest request, CancellationToken cancellationToken)
    {
        request.TripId = tripId;
        var result = await _expenseService.CreateExpenseAsync(request, UserId, cancellationToken);
        
        return result.IsSuccess 
            ? CreatedAtAction(nameof(GetExpense), new { id = result.Value!.Id }, result.Value)
            : BadRequest(new { error = result.Error });
    }

    [HttpGet("api/expenses/{id:guid}")]
    public async Task<ActionResult<ExpenseResponse>> GetExpense(Guid id, CancellationToken cancellationToken)
    {
        var result = await _expenseService.GetExpenseAsync(id, UserId, cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : NotFound(new { error = result.Error });
    }

    [HttpPut("api/expenses/{id:guid}")]
    public async Task<ActionResult<ExpenseResponse>> UpdateExpense(Guid id, [FromBody] UpdateExpenseRequest request, CancellationToken cancellationToken)
    {
        var result = await _expenseService.UpdateExpenseAsync(id, request, UserId, cancellationToken);
        
        return result.IsSuccess 
            ? Ok(result.Value)
            : result.Error.Contains("not found") ? NotFound(new { error = result.Error }) : BadRequest(new { error = result.Error });
    }

    [HttpDelete("api/expenses/{id:guid}")]
    public async Task<ActionResult> DeleteExpense(Guid id, CancellationToken cancellationToken)
    {
        var result = await _expenseService.DeleteExpenseAsync(id, UserId, cancellationToken);
        
        return result.IsSuccess 
            ? NoContent()
            : NotFound(new { error = result.Error });
    }
}
