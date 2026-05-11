using Application.DTOs.TravelDocs;
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
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Application.Common.Interfaces;

namespace TravelItineraryPlanner.Tests.Services
{
    public class TravelDocServiceTests
    {
        private readonly Mock<IPackingListRepository> _packingRepoMock;
        private readonly Mock<IChecklistRepository> _checklistRepoMock;
        private readonly Mock<IEmergencyContactRepository> _contactRepoMock;
        private readonly Mock<ITravelDocumentRepository> _docRepoMock;
        private readonly Mock<ILocalInfoRepository> _infoRepoMock;
        private readonly Mock<IFileStorageService> _fileStorageMock;
        private readonly Mock<ITripRepository> _tripRepoMock;
        private readonly DestinationTemplateService _templateService;
        private readonly TravelDocService _service;

        public TravelDocServiceTests()
        {
            _packingRepoMock = new Mock<IPackingListRepository>();
            _checklistRepoMock = new Mock<IChecklistRepository>();
            _contactRepoMock = new Mock<IEmergencyContactRepository>();
            _docRepoMock = new Mock<ITravelDocumentRepository>();
            _infoRepoMock = new Mock<ILocalInfoRepository>();
            _fileStorageMock = new Mock<IFileStorageService>();
            _tripRepoMock = new Mock<ITripRepository>();
            _templateService = new DestinationTemplateService();

            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            var context = new ApplicationDbContext(options);

            _service = new TravelDocService(
                _packingRepoMock.Object,
                _checklistRepoMock.Object,
                _contactRepoMock.Object,
                _docRepoMock.Object,
                _infoRepoMock.Object,
                _fileStorageMock.Object,
                _tripRepoMock.Object,
                _templateService,
                context);
        }

        [Fact]
        public async Task AutoGenerateChecklistAsync_ShouldCreateChecklist()
        {
            // Arrange
            var userId = Guid.NewGuid();
            var tripId = Guid.NewGuid();
            var trip = new Trip(userId, "Test Trip", "Beach International", DateTime.UtcNow.AddDays(30), DateTime.UtcNow.AddDays(40), TravelType.Leisure);
            trip.GetType().GetProperty("Id")?.SetValue(trip, tripId);

            _tripRepoMock.Setup(r => r.GetByIdAndUserIdAsync(tripId, userId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(trip);

            // Act
            var result = await _service.AutoGenerateChecklistAsync(tripId, userId);

            // Assert
            Assert.True(result.IsSuccess);
            Assert.NotNull(result.Value);
            result.Value.Title.Should().Be("Trip Preparation Checklist");
            _checklistRepoMock.Verify(r => r.AddAsync(It.IsAny<TravelChecklist>()), Times.Once);
            _checklistRepoMock.Verify(r => r.SaveChangesAsync(), Times.Once);
        }
    }
}
