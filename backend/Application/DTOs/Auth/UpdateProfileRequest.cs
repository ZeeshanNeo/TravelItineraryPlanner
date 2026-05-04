using System.Text.Json;
using System.ComponentModel.DataAnnotations;

namespace Application.DTOs.Auth;

public class UpdateProfileRequest
{
    [MaxLength(50)]
    public string? FirstName { get; set; }

    [MaxLength(50)]
    public string? LastName { get; set; }

    [MaxLength(20)]
    public string? PhoneNumber { get; set; }

    public JsonDocument? TravelPreferences { get; set; }
    public JsonDocument? PassportDetails { get; set; }
}