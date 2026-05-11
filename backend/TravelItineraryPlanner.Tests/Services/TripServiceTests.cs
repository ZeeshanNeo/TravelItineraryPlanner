using Application.DTOs.Trip;
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
using Application.Common.Models;

namespace TravelItineraryPlanner.Tests.Services
{
    public class TripServiceTests
    {
        private readonly Mock<ITripRepository> _tripRepositoryMock;
        private readonly TripService _tripService;

        public TripServiceTests()
        {
            _tripRepositoryMock = new Mock<ITripRepository>();
            _tripService = new TripService(_tripRepositoryMock.Object);
        }

        [Fact]
        public async Task CreateTripAsync_ShouldCreateAndReturnTrip()
        {
            // Arrange
            var userId = Guid.NewGuid();
            var request = new CreateTripRequest
            {
                Title = "Japan Trip",
                Destination = "Tokyo",
                StartDate = DateTime.UtcNow.AddDays(10),
                EndDate = DateTime.UtcNow.AddDays(20),
                TravelType = TravelType.Leisure,
                Purpose = "Vacation"
            };

            // Act
            var result = await _tripService.CreateTripAsync(request, userId);

            // Assert
            Assert.True(result.IsSuccess);
            Assert.NotNull(result.Value);
            result.Value.Title.Should().Be(request.Title);
            result.Value.Destination.Should().Be(request.Destination);
            result.Value.TravelType.Should().Be(TravelType.Leisure.ToString());
            
            _tripRepositoryMock.Verify(r => r.AddAsync(It.IsAny<Trip>(), It.IsAny<CancellationToken>()), Times.Once);
            _tripRepositoryMock.Verify(r => r.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
        }

        [Fact]
        public async Task GetTripAsync_ShouldReturnTrip_WhenTripExists()
        {
            // Arrange
            var tripId = Guid.NewGuid();
            var userId = Guid.NewGuid();
            var trip = new Trip(userId, "Japan Trip", "Tokyo", DateTime.UtcNow, DateTime.UtcNow.AddDays(7), TravelType.Business);
            trip.GetType().GetProperty("Id")?.SetValue(trip, tripId);

            _tripRepositoryMock.Setup(r => r.GetByIdAndUserIdAsync(tripId, userId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(trip);

            // Act
            var result = await _tripService.GetTripAsync(tripId, userId);

            // Assert
            Assert.True(result.IsSuccess);
            Assert.NotNull(result.Value);
            result.Value.Id.Should().Be(tripId);
            result.Value.Title.Should().Be("Japan Trip");
        }

        [Fact]
        public async Task GetTripAsync_ShouldReturnFailure_WhenTripDoesNotExist()
        {
            // Arrange
            var tripId = Guid.NewGuid();
            var userId = Guid.NewGuid();

            _tripRepositoryMock.Setup(r => r.GetByIdAndUserIdAsync(tripId, userId, It.IsAny<CancellationToken>()))
                .ReturnsAsync((Trip?)null);

            // Act
            var result = await _tripService.GetTripAsync(tripId, userId);

            // Assert
            Assert.False(result.IsSuccess);
            result.Error.Should().Be("Trip not found.");
        }

        [Fact]
        public async Task GetUserTripsAsync_ShouldReturnAllUserTrips()
        {
            // Arrange
            var userId = Guid.NewGuid();
            var trip1 = new Trip(userId, "Trip 1", "Dest 1", DateTime.UtcNow, DateTime.UtcNow.AddDays(1), TravelType.Leisure);
            trip1.GetType().GetProperty("Id")?.SetValue(trip1, Guid.NewGuid());
            var trip2 = new Trip(userId, "Trip 2", "Dest 2", DateTime.UtcNow, DateTime.UtcNow.AddDays(1), TravelType.Business);
            trip2.GetType().GetProperty("Id")?.SetValue(trip2, Guid.NewGuid());

            var trips = new List<Trip> { trip1, trip2 };

            _tripRepositoryMock.Setup(r => r.GetByUserIdAsync(userId, false, It.IsAny<CancellationToken>()))
                .ReturnsAsync(trips);

            // Act
            var result = await _tripService.GetUserTripsAsync(userId);

            // Assert
            Assert.True(result.IsSuccess);
            Assert.NotNull(result.Value);
            result.Value.Should().HaveCount(2);
            result.Value.First().Title.Should().Be("Trip 1");
            result.Value.Last().Title.Should().Be("Trip 2");
        }

        [Fact]
        public async Task UpdateTripAsync_ShouldModifyAndReturnUpdatedTrip()
        {
            // Arrange
            var tripId = Guid.NewGuid();
            var userId = Guid.NewGuid();
            var trip = new Trip(userId, "Old Title", "Old Dest", DateTime.UtcNow, DateTime.UtcNow.AddDays(1), TravelType.Leisure);
            trip.GetType().GetProperty("Id")?.SetValue(trip, tripId);
            
            var request = new UpdateTripRequest { Title = "New Title", Destination = "New Dest" };

            _tripRepositoryMock.Setup(r => r.GetByIdAndUserIdAsync(tripId, userId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(trip);

            // Act
            var result = await _tripService.UpdateTripAsync(tripId, request, userId);

            // Assert
            Assert.True(result.IsSuccess);
            Assert.NotNull(result.Value);
            result.Value.Title.Should().Be("New Title");
            result.Value.Destination.Should().Be("New Dest");
            
            _tripRepositoryMock.Verify(r => r.Update(It.IsAny<Trip>()), Times.Once);
            _tripRepositoryMock.Verify(r => r.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
        }

        [Fact]
        public async Task ArchiveTripAsync_ShouldSetIsArchivedFlag()
        {
            // Arrange
            var tripId = Guid.NewGuid();
            var userId = Guid.NewGuid();
            var trip = new Trip(userId, "Trip", "Dest", DateTime.UtcNow, DateTime.UtcNow.AddDays(1), TravelType.Leisure);
            trip.GetType().GetProperty("Id")?.SetValue(trip, tripId);
            
            var request = new ArchiveTripRequest { IsArchived = true };

            _tripRepositoryMock.Setup(r => r.GetByIdAndUserIdAsync(tripId, userId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(trip);

            // Act
            await _tripService.ArchiveTripAsync(tripId, request, userId);

            // Assert
            trip.IsArchived.Should().BeTrue();
            
            _tripRepositoryMock.Verify(r => r.Update(trip), Times.Once);
            _tripRepositoryMock.Verify(r => r.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
        }
    }
}
