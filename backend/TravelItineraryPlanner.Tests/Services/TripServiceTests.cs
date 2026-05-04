using Application.DTOs.Trip;
using Domain.Entities;
using Domain.Interfaces;
using FluentAssertions;
using Infrastructure.Services;
using Moq;
using System.Text.Json;

namespace TravelItineraryPlanner.Tests.Services;

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
        result.Should().NotBeNull();
        result.Title.Should().Be(request.Title);
        result.Destination.Should().Be(request.Destination);
        result.TravelType.Should().Be(TravelType.Leisure.ToString());
        
        _tripRepositoryMock.Verify(r => r.AddAsync(It.IsAny<Trip>(), It.IsAny<CancellationToken>()), Times.Once);
        _tripRepositoryMock.Verify(r => r.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task GetTripAsync_ShouldReturnTrip_WhenTripExists()
    {
        // Arrange
        var tripId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        var trip = new Trip { Id = tripId, UserId = userId, Title = "Japan Trip", TravelType = TravelType.Business };

        _tripRepositoryMock.Setup(r => r.GetByIdAndUserIdAsync(tripId, userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(trip);

        // Act
        var result = await _tripService.GetTripAsync(tripId, userId);

        // Assert
        result.Should().NotBeNull();
        result.Id.Should().Be(tripId);
        result.Title.Should().Be("Japan Trip");
    }

    [Fact]
    public async Task GetTripAsync_ShouldThrowKeyNotFoundException_WhenTripDoesNotExist()
    {
        // Arrange
        var tripId = Guid.NewGuid();
        var userId = Guid.NewGuid();

        _tripRepositoryMock.Setup(r => r.GetByIdAndUserIdAsync(tripId, userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Trip)null);

        // Act
        Func<Task> act = async () => await _tripService.GetTripAsync(tripId, userId);

        // Assert
        await act.Should().ThrowAsync<KeyNotFoundException>()
            .WithMessage("Trip not found.");
    }

    [Fact]
    public async Task GetUserTripsAsync_ShouldReturnAllUserTrips()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var trips = new List<Trip>
        {
            new Trip { Id = Guid.NewGuid(), UserId = userId, Title = "Trip 1", TravelType = TravelType.Leisure },
            new Trip { Id = Guid.NewGuid(), UserId = userId, Title = "Trip 2", TravelType = TravelType.Business }
        };

        _tripRepositoryMock.Setup(r => r.GetByUserIdAsync(userId, false, It.IsAny<CancellationToken>()))
            .ReturnsAsync(trips);

        // Act
        var result = await _tripService.GetUserTripsAsync(userId);

        // Assert
        result.Should().NotBeNull();
        result.Should().HaveCount(2);
        result.First().Title.Should().Be("Trip 1");
        result.Last().Title.Should().Be("Trip 2");
    }

    [Fact]
    public async Task UpdateTripAsync_ShouldModifyAndReturnUpdatedTrip()
    {
        // Arrange
        var tripId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        var trip = new Trip { Id = tripId, UserId = userId, Title = "Old Title", Destination = "Old Dest", TravelType = TravelType.Leisure };
        var request = new UpdateTripRequest { Title = "New Title", Destination = "New Dest" };

        _tripRepositoryMock.Setup(r => r.GetByIdAndUserIdAsync(tripId, userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(trip);

        // Act
        var result = await _tripService.UpdateTripAsync(tripId, request, userId);

        // Assert
        result.Should().NotBeNull();
        result.Title.Should().Be("New Title");
        result.Destination.Should().Be("New Dest");
        
        _tripRepositoryMock.Verify(r => r.Update(It.IsAny<Trip>()), Times.Once);
        _tripRepositoryMock.Verify(r => r.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task ArchiveTripAsync_ShouldSetIsArchivedFlag()
    {
        // Arrange
        var tripId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        var trip = new Trip { Id = tripId, UserId = userId, Title = "Trip", IsArchived = false, TravelType = TravelType.Leisure };
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
