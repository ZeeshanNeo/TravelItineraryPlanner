using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Application.DTOs.Collaboration;
using Application.Interfaces;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CollaborationController : ControllerBase
    {
        private readonly ICollaborationService _collabService;
        private readonly ICommentService _commentService;
        private readonly ITaskService _taskService;
        private readonly ISharedExpenseService _expenseService;

        public CollaborationController(
            ICollaborationService collabService,
            ICommentService commentService,
            ITaskService taskService,
            ISharedExpenseService expenseService)
        {
            _collabService = collabService;
            _commentService = commentService;
            _taskService = taskService;
            _expenseService = expenseService;
        }

        // Sharing & Members
        [HttpPost("trips/{tripId}/share")]
        public async Task<IActionResult> ShareTrip(Guid tripId, [FromBody] InviteMemberRequest request)
        {
            try {
                var result = await _collabService.InviteMemberAsync(tripId, request);
                return Ok(result);
            } catch (Exception ex) {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("trips/{tripId}/members")]
        public async Task<IActionResult> GetMembers(Guid tripId)
        {
            return Ok(await _collabService.GetTripMembersAsync(tripId));
        }

        [HttpDelete("members/{memberId}")]
        public async Task<IActionResult> RemoveMember(Guid memberId)
        {
            await _collabService.RemoveMemberAsync(memberId);
            return NoContent();
        }

        // Comments
        [HttpPost("trips/{tripId}/comments")]
        public async Task<IActionResult> AddComment(Guid tripId, [FromBody] CreateCommentRequest request)
        {
            var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var result = await _commentService.AddCommentAsync(tripId, userId, request);
            return Ok(result);
        }

        [HttpGet("trips/{tripId}/comments")]
        public async Task<IActionResult> GetComments(Guid tripId)
        {
            return Ok(await _commentService.GetTripCommentsAsync(tripId));
        }

        // Tasks
        [HttpPost("trips/{tripId}/tasks")]
        public async Task<IActionResult> CreateTask(Guid tripId, [FromBody] CreateTaskRequest request)
        {
            var result = await _taskService.CreateTaskAsync(tripId, request);
            return Ok(result);
        }

        [HttpGet("trips/{tripId}/tasks")]
        public async Task<IActionResult> GetTasks(Guid tripId)
        {
            return Ok(await _taskService.GetTripTasksAsync(tripId));
        }

        [HttpPatch("tasks/{taskId}/status")]
        public async Task<IActionResult> UpdateTaskStatus(Guid taskId, [FromBody] string status)
        {
            var result = await _taskService.UpdateTaskStatusAsync(taskId, status);
            return Ok(result);
        }

        // Shared Expenses
        [HttpPost("expenses/{expenseId}/split")]
        public async Task<IActionResult> SplitExpense(Guid expenseId, [FromBody] List<ExpenseSplitRequest> splits)
        {
            await _expenseService.SplitExpenseAsync(expenseId, splits);
            return Ok();
        }

        [HttpGet("expenses/{expenseId}/splits")]
        public async Task<IActionResult> GetSplits(Guid expenseId)
        {
            return Ok(await _expenseService.GetExpenseSplitsAsync(expenseId));
        }

        [HttpGet("trips/{tripId}/balances")]
        public async Task<IActionResult> GetBalances(Guid tripId)
        {
            return Ok(await _expenseService.GetTripBalancesAsync(tripId));
        }
    }
}
