using System.Text.Json;

namespace Application.DTOs.Auth;

public class UserProfileResponse
{
    public Guid Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
    public JsonDocument? TravelPreferences { get; set; }
    public JsonDocument? PassportDetails { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public bool IsActive { get; set; }
    public string Role { get; set; } = string.Empty;
}