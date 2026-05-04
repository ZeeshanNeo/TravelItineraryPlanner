using Application.DTOs.Itinerary;
using Domain.Entities;
using Domain.Interfaces;
using FluentAssertions;
using Infrastructure.Services;
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
        private readonly ItineraryService _service;

        public ItineraryServiceTests()
        {
            _itineraryRepoMock = new Mock<IItineraryRepository>();
            _dayRepoMock = new Mock<IItineraryDayRepository>();
            _activityRepoMock = new Mock<IActivityRepository>();
            _tripRepoMock = new Mock<ITripRepository>();
            _service = new ItineraryService(
                _itineraryRepoMock.Object,
                _dayRepoMock.Object,
                _activityRepoMock.Object,
                _tripRepoMock.Object);
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

            _tripRepoMock.Setup(r => r.GetByIdAndUserIdAsync(tripId, userId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(new Trip { Id = tripId, UserId = userId });

            // Act
            var result = await _service.CreateItineraryAsync(request, userId);

            // Assert
            result.Should().NotBeNull();
            result.Title.Should().Be(request.Title);
            result.TotalDays.Should().Be(6);
            
            _itineraryRepoMock.Verify(r => r.AddAsync(It.IsAny<Itinerary>(), It.IsAny<CancellationToken>()), Times.Once);
            _itineraryRepoMock.Verify(r => r.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
        }

        [Fact]
        public async Task ReorderActivitiesAsync_ShouldUpdateOrders()
        {
            // Arrange
            var userId = Guid.NewGuid();
            var dayId = Guid.NewGuid();
            var activityIds = new List<Guid> { Guid.NewGuid(), Guid.NewGuid() };

            _dayRepoMock.Setup(r => r.GetByIdAndUserIdAsync(dayId, userId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(new ItineraryDay { Id = dayId });

            // Act
            await _service.ReorderActivitiesAsync(dayId, activityIds, userId);

            // Assert
            _activityRepoMock.Verify(r => r.UpdateOrderAsync(dayId, activityIds, It.IsAny<CancellationToken>()), Times.Once);
            _activityRepoMock.Verify(r => r.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
        }
    }
}
