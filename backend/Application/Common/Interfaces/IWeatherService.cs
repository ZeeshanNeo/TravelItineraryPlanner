using System.Threading.Tasks;

namespace Application.Common.Interfaces;

public interface IWeatherService
{
    Task<WeatherForecastResponse?> GetForecastAsync(string destination, DateTime date);
}

public record WeatherForecastResponse(
    string Destination,
    DateTime Date,
    double TemperatureCelsius,
    string Condition,
    string IconUrl,
    int Humidity,
    double WindSpeedKph);
