using Application.Common.Interfaces;
using Microsoft.Extensions.Logging;

namespace Infrastructure.Services;

public class EmailService : IEmailService
{
    private readonly ILogger<EmailService> _logger;

    public EmailService(ILogger<EmailService> logger)
    {
        _logger = logger;
    }

    public async Task SendPasswordResetEmailAsync(string email, string resetToken, CancellationToken cancellationToken = default)
    {
        // In a real application, you would send an email using SMTP, SendGrid, etc.
        // For now, we'll just log the token for development purposes.
        _logger.LogInformation("Password reset email sent to {Email} with token: {Token}", email, resetToken);
        
        // Simulate async operation
        await Task.Delay(100, cancellationToken);
    }

    public async Task SendWelcomeEmailAsync(string email, string name, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Welcome email sent to {Email} for user {Name}", email, name);
        await Task.Delay(100, cancellationToken);
    }
}