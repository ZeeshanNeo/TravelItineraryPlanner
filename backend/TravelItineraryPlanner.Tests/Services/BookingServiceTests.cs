using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Application.DTOs.Booking;
using Domain.Entities;
using Domain.Interfaces;
using FluentAssertions;
using Infrastructure.Services;
using Moq;
using Xunit;

namespace TravelItineraryPlanner.Tests.Services;

public class BookingServiceTests
{
    private readonly Mock<IBookingRepository> _bookingRepositoryMock;
    private readonly Mock<ITripRepository> _tripRepositoryMock;
    private readonly Mock<IActivityRepository> _activityRepositoryMock;
    private readonly BookingService _bookingService;

    public BookingServiceTests()
    {
        _bookingRepositoryMock = new Mock<IBookingRepository>();
        _tripRepositoryMock = new Mock<ITripRepository>();
        _activityRepositoryMock = new Mock<IActivityRepository>();
        _bookingService = new BookingService(
            _bookingRepositoryMock.Object,
            _tripRepositoryMock.Object,
            _activityRepositoryMock.Object);
    }

    [Fact]
    public async Task CreateBookingAsync_ShouldReturnBooking_WhenRequestIsValid()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var tripId = Guid.NewGuid();
        var request = new CreateBookingRequest
        {
            TripId = tripId,
            Category = BookingCategory.Flight,
            Title = "Test Flight",
            Status = BookingStatus.Pending
        };

        var trip = new Trip { Id = tripId, UserId = userId, Title = "Test Trip" };

        _tripRepositoryMock.Setup(r => r.GetByIdAndUserIdAsync(tripId, userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(trip);

        _bookingRepositoryMock.Setup(r => r.AddAsync(It.IsAny<Booking>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        // Act
        var result = await _bookingService.CreateBookingAsync(request, userId);

        // Assert
        result.Should().NotBeNull();
        result.Title.Should().Be(request.Title);
        result.TripId.Should().Be(tripId);
        _bookingRepositoryMock.Verify(r => r.AddAsync(It.IsAny<Booking>(), It.IsAny<CancellationToken>()), Times.Once);
        _bookingRepositoryMock.Verify(r => r.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task CreateBookingAsync_ShouldThrowKeyNotFoundException_WhenTripDoesNotExist()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var tripId = Guid.NewGuid();
        var request = new CreateBookingRequest { TripId = tripId, Title = "Test Flight" };

        _tripRepositoryMock.Setup(r => r.GetByIdAndUserIdAsync(tripId, userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Trip?)null);

        // Act
        var act = () => _bookingService.CreateBookingAsync(request, userId);

        // Assert
        await act.Should().ThrowAsync<KeyNotFoundException>();
    }

    [Fact]
    public async Task GetBookingAsync_ShouldReturnNull_WhenBookingDoesNotExist()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var bookingId = Guid.NewGuid();

        _bookingRepositoryMock.Setup(r => r.GetByIdAndUserIdAsync(bookingId, userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Booking?)null);

        // Act
        var result = await _bookingService.GetBookingAsync(bookingId, userId);

        // Assert
        result.Should().BeNull();
    }
}
