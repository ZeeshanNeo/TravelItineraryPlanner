using Application.Common.Interfaces;
using Application.DTOs.Auth;
using Application.Services;
using Domain.Entities;
using Domain.Interfaces;
using Microsoft.Extensions.Logging;
using System.Text.Json;

namespace Infrastructure.Services;

public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepository;
    private readonly IRefreshTokenRepository _refreshTokenRepository;
    private readonly IPasswordResetTokenRepository _passwordResetTokenRepository;
    private readonly IPasswordHasher _passwordHasher;
    private readonly ITokenService _tokenService;
    private readonly IEmailService _emailService;
    private readonly ILogger<AuthService> _logger;

    public AuthService(
        IUserRepository userRepository,
        IRefreshTokenRepository refreshTokenRepository,
        IPasswordResetTokenRepository passwordResetTokenRepository,
        IPasswordHasher passwordHasher,
        ITokenService tokenService,
        IEmailService emailService,
        ILogger<AuthService> logger)
    {
        _userRepository = userRepository;
        _refreshTokenRepository = refreshTokenRepository;
        _passwordResetTokenRepository = passwordResetTokenRepository;
        _passwordHasher = passwordHasher;
        _tokenService = tokenService;
        _emailService = emailService;
        _logger = logger;
    }

    public async Task<AuthResponse> RegisterAsync(RegisterRequest request, CancellationToken cancellationToken = default)
    {
        // Check if user already exists
        var existingUser = await _userRepository.GetByEmailAsync(request.Email, cancellationToken);
        if (existingUser != null)
        {
            throw new ApplicationException("User with this email already exists.");
        }

        // Create new user
        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = request.Email,
            FirstName = request.FirstName,
            LastName = request.LastName,
            PhoneNumber = request.PhoneNumber,
            PasswordHash = _passwordHasher.HashPassword(request.Password),
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            IsActive = true,
            TravelPreferences = JsonDocument.Parse("{}"),
            PassportDetails = JsonDocument.Parse("{}")
        };

        await _userRepository.AddAsync(user, cancellationToken);
        await _userRepository.SaveChangesAsync(cancellationToken);

        // Generate tokens
        var accessToken = _tokenService.GenerateAccessToken(user);
        var refreshToken = await GenerateAndStoreRefreshTokenAsync(user, cancellationToken);

        // Send welcome email
        await _emailService.SendWelcomeEmailAsync(user.Email, $"{user.FirstName} {user.LastName}", cancellationToken);

        return new AuthResponse
        {
            AccessToken = accessToken,
            RefreshToken = refreshToken,
            UserId = user.Id,
            Email = user.Email,
            FullName = $"{user.FirstName} {user.LastName}",
            Role = user.Role.ToString()
        };
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default)
    {
        var user = await _userRepository.GetByEmailAsync(request.Email, cancellationToken);
        if (user == null || !_passwordHasher.VerifyPassword(request.Password, user.PasswordHash))
        {
            throw new ApplicationException("Invalid email or password.");
        }

        if (!user.IsActive)
        {
            throw new ApplicationException("User account is deactivated.");
        }

        // Revoke all existing refresh tokens for this user (refresh token rotation)
        await _refreshTokenRepository.RevokeAllForUserAsync(user.Id, null, cancellationToken);

        // Generate new tokens
        var accessToken = _tokenService.GenerateAccessToken(user);
        var refreshToken = await GenerateAndStoreRefreshTokenAsync(user, cancellationToken);

        await _refreshTokenRepository.SaveChangesAsync(cancellationToken);

        return new AuthResponse
        {
            AccessToken = accessToken,
            RefreshToken = refreshToken,
            UserId = user.Id,
            Email = user.Email,
            FullName = $"{user.FirstName} {user.LastName}",
            Role = user.Role.ToString()
        };
    }

    public async Task<AuthResponse> RefreshTokenAsync(string refreshToken, CancellationToken cancellationToken = default)
    {
        var tokenHash = _tokenService.HashToken(refreshToken);
        var storedToken = await _refreshTokenRepository.GetByTokenHashAsync(tokenHash, cancellationToken);
        if (storedToken == null || storedToken.IsRevoked || storedToken.ExpiresAt <= DateTime.UtcNow)
        {
            throw new ApplicationException("Invalid or expired refresh token.");
        }

        var user = storedToken.User;
        if (user == null || !user.IsActive)
        {
            throw new ApplicationException("User not found or inactive.");
        }

        // Revoke the current refresh token
        storedToken.IsRevoked = true;
        storedToken.RevokedAt = DateTime.UtcNow;
        _refreshTokenRepository.Update(storedToken);

        // Generate new tokens
        var newAccessToken = _tokenService.GenerateAccessToken(user);
        var newRefreshToken = await GenerateAndStoreRefreshTokenAsync(user, cancellationToken);

        // Mark old token as replaced by new one
        storedToken.ReplacedByTokenHash = _tokenService.HashToken(newRefreshToken);

        await _refreshTokenRepository.SaveChangesAsync(cancellationToken);

        return new AuthResponse
        {
            AccessToken = newAccessToken,
            RefreshToken = newRefreshToken,
            UserId = user.Id,
            Email = user.Email,
            FullName = $"{user.FirstName} {user.LastName}",
            Role = user.Role.ToString()
        };
    }

    public async Task LogoutAsync(string refreshToken, CancellationToken cancellationToken = default)
    {
        var tokenHash = _tokenService.HashToken(refreshToken);
        var storedToken = await _refreshTokenRepository.GetByTokenHashAsync(tokenHash, cancellationToken);
        if (storedToken != null)
        {
            storedToken.IsRevoked = true;
            storedToken.RevokedAt = DateTime.UtcNow;
            _refreshTokenRepository.Update(storedToken);
            await _refreshTokenRepository.SaveChangesAsync(cancellationToken);
        }
    }

    public async Task ForgotPasswordAsync(ForgotPasswordRequest request, CancellationToken cancellationToken = default)
    {
        var user = await _userRepository.GetByEmailAsync(request.Email, cancellationToken);
        if (user == null)
        {
            // For security, don't reveal that the user doesn't exist
            return;
        }

        // Invalidate any existing password reset tokens for this user
        await _passwordResetTokenRepository.InvalidateAllForUserAsync(user.Id, cancellationToken);

        // Generate reset token
        var resetToken = Guid.NewGuid().ToString("N");
        var tokenHash = _tokenService.HashToken(resetToken);

        var passwordResetToken = new PasswordResetToken
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            TokenHash = tokenHash,
            ExpiresAt = DateTime.UtcNow.AddHours(24),
            IsUsed = false,
            CreatedAt = DateTime.UtcNow
        };

        await _passwordResetTokenRepository.AddAsync(passwordResetToken, cancellationToken);
        await _passwordResetTokenRepository.SaveChangesAsync(cancellationToken);

        // Send email with reset token
        await _emailService.SendPasswordResetEmailAsync(user.Email, resetToken, cancellationToken);
    }

    public async Task ResetPasswordAsync(ResetPasswordRequest request, CancellationToken cancellationToken = default)
    {
        var tokenHash = _tokenService.HashToken(request.Token);
        var resetToken = await _passwordResetTokenRepository.GetByTokenHashAsync(tokenHash, cancellationToken);
        if (resetToken == null || resetToken.IsUsed || resetToken.ExpiresAt <= DateTime.UtcNow)
        {
            throw new ApplicationException("Invalid or expired password reset token.");
        }

        var user = resetToken.User;
        if (user == null)
        {
            throw new ApplicationException("User not found.");
        }

        // Update password
        user.PasswordHash = _passwordHasher.HashPassword(request.NewPassword);
        user.UpdatedAt = DateTime.UtcNow;
        _userRepository.Update(user);

        // Mark token as used
        resetToken.IsUsed = true;
        _passwordResetTokenRepository.Update(resetToken);

        await _userRepository.SaveChangesAsync(cancellationToken);
        await _passwordResetTokenRepository.SaveChangesAsync(cancellationToken);

        // Revoke all refresh tokens for security
        await _refreshTokenRepository.RevokeAllForUserAsync(user.Id, null, cancellationToken);
        await _refreshTokenRepository.SaveChangesAsync(cancellationToken);
    }

    private async Task<string> GenerateAndStoreRefreshTokenAsync(User user, CancellationToken cancellationToken)
    {
        var refreshToken = _tokenService.GenerateRefreshToken();
        var tokenHash = _tokenService.HashToken(refreshToken);

        var refreshTokenEntity = new RefreshToken
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            TokenHash = tokenHash,
            ExpiresAt = DateTime.UtcNow.AddDays(7),
            IsRevoked = false,
            CreatedAt = DateTime.UtcNow
        };

        await _refreshTokenRepository.AddAsync(refreshTokenEntity, cancellationToken);
        return refreshToken;
    }
}