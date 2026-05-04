using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.DTOs.Collaboration;
using Application.Interfaces;
using Domain.Entities;
using Domain.Interfaces;

namespace Infrastructure.Services
{
    public class TaskService : ITaskService
    {
        private readonly ITaskRepository _taskRepo;

        public TaskService(ITaskRepository taskRepo)
        {
            _taskRepo = taskRepo;
        }

        public async Task<TripTaskDto> CreateTaskAsync(Guid tripId, CreateTaskRequest request)
        {
            var task = new TripTask
            {
                Id = Guid.NewGuid(),
                TripId = tripId,
                Title = request.Title,
                Description = request.Description,
                AssignedToUserId = request.AssignedToUserId,
                Status = TripTaskStatus.ToDo,
                DueDate = request.DueDate,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            await _taskRepo.AddAsync(task);
            return MapToDto(task);
        }

        public async Task<IEnumerable<TripTaskDto>> GetTripTasksAsync(Guid tripId)
        {
            var tasks = await _taskRepo.GetByTripIdAsync(tripId);
            return tasks.Select(MapToDto);
        }

        public async Task<TripTaskDto> UpdateTaskStatusAsync(Guid taskId, string status)
        {
            var task = await _taskRepo.GetByIdAsync(taskId);
            if (task == null) return null;

            task.Status = Enum.Parse<TripTaskStatus>(status);
            task.UpdatedAt = DateTime.UtcNow;

            await _taskRepo.UpdateAsync(task);
            return MapToDto(task);
        }

        public async Task<TripTaskDto> AssignTaskAsync(Guid taskId, Guid? userId)
        {
            var task = await _taskRepo.GetByIdAsync(taskId);
            if (task == null) return null;

            task.AssignedToUserId = userId;
            task.UpdatedAt = DateTime.UtcNow;

            await _taskRepo.UpdateAsync(task);
            return MapToDto(task);
        }

        public async Task DeleteTaskAsync(Guid taskId)
        {
            var task = await _taskRepo.GetByIdAsync(taskId);
            if (task != null) await _taskRepo.DeleteAsync(task);
        }

        private TripTaskDto MapToDto(TripTask t) => new TripTaskDto
        {
            Id = t.Id,
            TripId = t.TripId,
            Title = t.Title,
            Description = t.Description,
            Status = t.Status.ToString(),
            AssignedToUserId = t.AssignedToUserId,
            AssignedToUserName = t.AssignedToUser != null ? $"{t.AssignedToUser.FirstName} {t.AssignedToUser.LastName}" : "Unassigned",
            DueDate = t.DueDate
        };
    }
}
