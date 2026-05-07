using Application.Common.Interfaces;
using Application.DTOs.Auth;
using Domain.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace API.Controllers
{
    [Authorize(Policy = "AdminOnly")]
    [ApiController]
    [Route("api/[controller]")]
    public class AdminController : ControllerBase
    {
        private readonly IUserRepository _userRepository;

        public AdminController(IUserRepository userRepository)
        {
            _userRepository = userRepository;
        }

        [HttpGet("users")]
        public async Task<ActionResult<IEnumerable<UserProfileResponse>>> GetAllUsers()
        {
            var users = await _userRepository.GetAllAsync();
            var response = new List<UserProfileResponse>();
            
            foreach (var user in users)
            {
                response.Add(new UserProfileResponse
                {
                    Id = user.Id,
                    Email = user.Email,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    PhoneNumber = user.PhoneNumber,
                    Role = user.Role.ToString()
                });
            }
            
            return Ok(response);
        }

        [HttpPost("users/{id}/deactivate")]
        public async Task<IActionResult> DeactivateUser(Guid id)
        {
            var user = await _userRepository.GetByIdAsync(id);
            if (user == null) return NotFound();
            
            user.IsActive = false;
            user.UpdatedAt = DateTime.UtcNow;
            
            _userRepository.Update(user);
            await _userRepository.SaveChangesAsync();
            
            return NoContent();
        }

        [HttpPost("users/{id}/activate")]
        public async Task<IActionResult> ActivateUser(Guid id)
        {
            var user = await _userRepository.GetByIdAsync(id);
            if (user == null) return NotFound();
            
            user.IsActive = true;
            user.UpdatedAt = DateTime.UtcNow;
            
            _userRepository.Update(user);
            await _userRepository.SaveChangesAsync();
            
            return NoContent();
        }
    }
}
