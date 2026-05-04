using Domain.Entities;

namespace Application.Common.Interfaces;

public interface ITokenService
{
    string GenerateAccessToken(User user);
    string GenerateRefreshToken();
    string HashToken(string token);
    (string? userId, string? email) ValidateAccessToken(string token);
}