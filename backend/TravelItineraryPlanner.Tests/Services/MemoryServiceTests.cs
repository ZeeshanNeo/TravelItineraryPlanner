using Application.DTOs.Memories;
using Domain.Entities;
using Domain.Interfaces;
using FluentAssertions;
using Infrastructure.Services;
using Moq;
using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Xunit;
using Application.Common.Interfaces;
using Microsoft.AspNetCore.Http;
using System.IO;

namespace TravelItineraryPlanner.Tests.Services
{
    public class MemoryServiceTests
    {
        private readonly Mock<IMemoryRepository> _memoryRepoMock;
        private readonly Mock<IJournalRepository> _journalRepoMock;
        private readonly Mock<ITagRepository> _tagRepoMock;
        private readonly Mock<IFileStorageService> _fileStorageMock;
        private readonly Mock<ITripRepository> _tripRepoMock;
        private readonly MemoryService _service;

        public MemoryServiceTests()
        {
            _memoryRepoMock = new Mock<IMemoryRepository>();
            _journalRepoMock = new Mock<IJournalRepository>();
            _tagRepoMock = new Mock<ITagRepository>();
            _fileStorageMock = new Mock<IFileStorageService>();
            _tripRepoMock = new Mock<ITripRepository>();

            _service = new MemoryService(
                _memoryRepoMock.Object,
                _journalRepoMock.Object,
                _tagRepoMock.Object,
                _fileStorageMock.Object,
                _tripRepoMock.Object);
        }

        [Fact]
        public async Task CreateJournalAsync_ShouldCreateEntryWithActivityId()
        {
            // Arrange
            var userId = Guid.NewGuid();
            var tripId = Guid.NewGuid();
            var activityId = Guid.NewGuid();
            var request = new CreateJournalRequest
            {
                Title = "Journal Title",
                Content = "Content",
                EntryDate = DateTime.UtcNow,
                Location = "Paris",
                ActivityId = activityId
            };

            var trip = new Trip(userId, "Test Trip", "Tokyo", DateTime.UtcNow, DateTime.UtcNow.AddDays(7), TravelType.Leisure);
            trip.GetType().GetProperty("Id")?.SetValue(trip, tripId);

            _tripRepoMock.Setup(r => r.GetByIdAndUserIdAsync(tripId, userId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(trip);

            // Act
            var result = await _service.CreateJournalAsync(tripId, request, userId);

            // Assert
            result.IsSuccess.Should().BeTrue();
            _journalRepoMock.Verify(r => r.AddAsync(It.Is<JournalEntry>(j => j.ActivityId == activityId)), Times.Once);
            _journalRepoMock.Verify(r => r.SaveChangesAsync(), Times.Once);
        }
    }
}
