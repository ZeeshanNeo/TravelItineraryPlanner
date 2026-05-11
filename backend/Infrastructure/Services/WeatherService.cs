using Application.Common.Interfaces;
using Microsoft.Extensions.Logging;
using System;
using System.Threading.Tasks;

namespace Infrastructure.Services;

public class WeatherService : IWeatherService
{
    private readonly ILogger<WeatherService> _logger;

    public WeatherService(ILogger<WeatherService> logger)
    {
        _logger = logger;
    }

    public async Task<WeatherForecastResponse?> GetForecastAsync(string destination, DateTime date)
    {
        _logger.LogInformation("Fetching weather forecast for {Destination} on {Date}", destination, date);

        // Mock data logic based on destination name hash to keep it consistent for the same city
        var hash = Math.Abs(destination.GetHashCode());
        var temp = 15 + (hash % 15); // Random temp between 15 and 30
        var conditions = new[] { "Sunny", "Partly Cloudy", "Cloudy", "Rainy" };
        var condition = conditions[hash % conditions.Length];

        var response = new WeatherForecastResponse(
            destination,
            date,
            temp,
            condition,
            $"https://example.com/weather-icons/{condition.ToLower().Replace(" ", "-")}.png",
            40 + (hash % 40),
            10 + (hash % 20)
        );

        return await Task.FromResult(response);
    }
}
