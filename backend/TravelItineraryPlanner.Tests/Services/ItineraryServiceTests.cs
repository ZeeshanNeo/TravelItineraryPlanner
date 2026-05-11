using Application.DTOs.Itinerary;
using Domain.Entities;
using Domain.Interfaces;
using FluentAssertions;
using Infrastructure.Services;
using Application.Common.Interfaces;
using Moq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Xunit;

namespace TravelItineraryPlanner.Tests.Services
{
    public class ItineraryServiceTests
    {
        private readonly Mock<IItineraryRepository> _itineraryRepoMock;
        private readonly Mock<IItineraryDayRepository> _dayRepoMock;
        private readonly Mock<IActivityRepository> _activityRepoMock;
        private readonly Mock<ITripRepository> _tripRepoMock;
        private readonly Mock<IWeatherService> _weatherServiceMock;
        private readonly Mock<ITimeZoneService> _timeZoneServiceMock;
        private readonly ItineraryService _service;

        public ItineraryServiceTests()
        {
            _itineraryRepoMock = new Mock<IItineraryRepository>();
            _dayRepoMock = new Mock<IItineraryDayRepository>();
            _activityRepoMock = new Mock<IActivityRepository>();
            _tripRepoMock = new Mock<ITripRepository>();
            _weatherServiceMock = new Mock<IWeatherService>();
            _timeZoneServiceMock = new Mock<ITimeZoneService>();

            _service = new ItineraryService(
                _itineraryRepoMock.Object,
                _dayRepoMock.Object,
                _activityRepoMock.Object,
                _tripRepoMock.Object,
                _weatherServiceMock.Object,
                _timeZoneServiceMock.Object);
        }

        [Fact]
        public async Task CreateItineraryAsync_ShouldCreateNewItinerary()
        {
            // Arrange
            var userId = Guid.NewGuid();
            var tripId = Guid.NewGuid();
            var request = new CreateItineraryRequest
            {
                TripId = tripId,
                Title = "Test Itinerary",
                StartDate = DateTime.UtcNow,
                EndDate = DateTime.UtcNow.AddDays(5),
                IsPublic = true
            };

            var trip = new Trip(userId, "Test Trip", "Tokyo", DateTime.UtcNow, DateTime.UtcNow.AddDays(7), TravelType.Leisure);
            trip.GetType().GetProperty("Id")?.SetValue(trip, tripId);

            _tripRepoMock.Setup(r => r.GetByIdAndUserIdAsync(tripId, userId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(trip);

            // Act
            var result = await _service.CreateItineraryAsync(request, userId);

            // Assert
            Assert.NotNull(result);
            Assert.True(result.IsSuccess);
            Assert.NotNull(result.Value);
            result.Value.Title.Should().Be(request.Title);
            
            _itineraryRepoMock.Verify(r => r.AddAsync(It.IsAny<Itinerary>(), It.IsAny<CancellationToken>()), Times.Once);
            _itineraryRepoMock.Verify(r => r.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
        }

        [Fact]
        public async Task ReorderActivitiesAsync_ShouldUpdateOrders()
        {
            // Arrange
            var userId = Guid.NewGuid();
            var dayId = Guid.NewGuid();
            var itineraryId = Guid.NewGuid();
            var activityIds = new List<Guid> { Guid.NewGuid(), Guid.NewGuid() };

            var day = new ItineraryDay(itineraryId, DateOnly.FromDateTime(DateTime.UtcNow), 1);
            day.GetType().GetProperty("Id")?.SetValue(day, dayId);

            _dayRepoMock.Setup(r => r.GetByIdAndUserIdAsync(dayId, userId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(day);

            // Act
            await _service.ReorderActivitiesAsync(dayId, activityIds, userId);

            // Assert
            _activityRepoMock.Verify(r => r.UpdateOrderAsync(dayId, activityIds, It.IsAny<CancellationToken>()), Times.Once);
            _activityRepoMock.Verify(r => r.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
        }

        [Fact]
        public async Task GenerateShareLinkAsync_ShouldGenerateToken()
        {
            // Arrange
            var userId = Guid.NewGuid();
            var itinId = Guid.NewGuid();
            var itinerary = new Itinerary(Guid.NewGuid(), "Test", "Desc", DateTime.UtcNow, DateTime.UtcNow, "UTC", null, true);
            itinerary.GetType().GetProperty("Id")?.SetValue(itinerary, itinId);

            _itineraryRepoMock.Setup(r => r.GetByIdAndUserIdAsync(itinId, userId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(itinerary);

            // Act
            var result = await _service.GenerateShareLinkAsync(itinId, userId);

            // Assert
            Assert.True(result.IsSuccess);
            itinerary.ShareToken.Should().NotBeNull();
            _itineraryRepoMock.Verify(r => r.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
        }

        [Fact]
        public async Task GetItineraryWeatherAsync_ShouldReturnWeatherData()
        {
            // Arrange
            var userId = Guid.NewGuid();
            var itinId = Guid.NewGuid();
            var tripId = Guid.NewGuid();
            var date = DateTime.UtcNow;
            
            var trip = new Trip(userId, "Test Trip", "Paris", DateTime.UtcNow, DateTime.UtcNow.AddDays(7), TravelType.Leisure);
            trip.GetType().GetProperty("Id")?.SetValue(trip, tripId);

            var itinerary = new Itinerary(tripId, "Test", "Desc", DateTime.UtcNow, DateTime.UtcNow, "UTC", null, true);
            itinerary.GetType().GetProperty("Id")?.SetValue(itinerary, itinId);
            itinerary.Trip = trip;

            _itineraryRepoMock.Setup(r => r.GetByIdAndUserIdAsync(itinId, userId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(itinerary);
            
            var weatherResponse = new WeatherForecastResponse("Paris", date, 20.0, "Sunny", "icon", 50, 10.0);

            _weatherServiceMock.Setup(s => s.GetForecastAsync("Paris", date))
                .ReturnsAsync(weatherResponse);

            // Act
            var result = await _service.GetItineraryWeatherAsync(itinId, date, userId);

            // Assert
            Assert.True(result.IsSuccess);
            Assert.NotNull(result.Value);
            result.Value.Condition.Should().Be("Sunny");
            _weatherServiceMock.Verify(s => s.GetForecastAsync("Paris", date), Times.Once);
        }
    }
}
