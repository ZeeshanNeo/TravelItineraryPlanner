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
    public class CollaborationService : ICollaborationService
    {
        private readonly ITripMemberRepository _memberRepo;
        private readonly IUserRepository _userRepo;

        public CollaborationService(ITripMemberRepository memberRepo, IUserRepository userRepo)
        {
            _memberRepo = memberRepo;
            _userRepo = userRepo;
        }

        public async Task<TripMemberDto> InviteMemberAsync(Guid tripId, InviteMemberRequest request)
        {
            var user = await _userRepo.GetByEmailAsync(request.Email);
            if (user == null) throw new Exception("User not found");

            var existing = await _memberRepo.GetByTripAndUserAsync(tripId, user.Id);
            if (existing != null) throw new Exception("User already a member");

            var member = new TripMember
            {
                Id = Guid.NewGuid(),
                TripId = tripId,
                UserId = user.Id,
                Role = Enum.Parse<TripRole>(request.Role),
                JoinedAt = DateTime.UtcNow
            };

            await _memberRepo.AddAsync(member);
            return MapToDto(member, user);
        }

        public async Task<IEnumerable<TripMemberDto>> GetTripMembersAsync(Guid tripId)
        {
            var members = await _memberRepo.GetByTripIdAsync(tripId);
            return members.Select(m => MapToDto(m, m.User));
        }

        public async Task UpdateMemberRoleAsync(Guid memberId, string role)
        {
            var member = await _memberRepo.GetByIdAsync(memberId);
            if (member != null)
            {
                member.Role = Enum.Parse<TripRole>(role);
                await _memberRepo.UpdateAsync(member);
            }
        }

        public async Task RemoveMemberAsync(Guid memberId)
        {
            var member = await _memberRepo.GetByIdAsync(memberId);
            if (member != null) await _memberRepo.DeleteAsync(member);
        }

        public async Task<bool> HasPermissionAsync(Guid tripId, Guid userId, string requiredRole)
        {
            var member = await _memberRepo.GetByTripAndUserAsync(tripId, userId);
            if (member == null) return false;

            var role = member.Role;
            var required = Enum.Parse<TripRole>(requiredRole);

            if (role == TripRole.Owner) return true;
            if (required == TripRole.Viewer) return true;
            if (required == TripRole.Collaborator && role == TripRole.Collaborator) return true;

            return false;
        }

        private TripMemberDto MapToDto(TripMember m, User u) => new TripMemberDto
        {
            Id = m.Id,
            TripId = m.TripId,
            UserId = m.UserId,
            UserEmail = u.Email,
            UserName = $"{u.FirstName} {u.LastName}",
            Role = m.Role.ToString(),
            JoinedAt = m.JoinedAt
        };
    }
}
