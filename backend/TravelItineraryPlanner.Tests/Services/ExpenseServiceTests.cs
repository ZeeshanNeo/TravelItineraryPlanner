using Application.DTOs.Expense;
using Domain.Entities;
using Domain.Interfaces;
using FluentAssertions;
using Infrastructure.Services;
using Moq;
using System;
using System.Threading;
using System.Threading.Tasks;
using Xunit;
using Application.Common.Models;

namespace TravelItineraryPlanner.Tests.Services
{
    public class ExpenseServiceTests
    {
        private readonly Mock<IExpenseRepository> _expenseRepoMock;
        private readonly Mock<ITripRepository> _tripRepoMock;
        private readonly ExpenseService _service;

        public ExpenseServiceTests()
        {
            _expenseRepoMock = new Mock<IExpenseRepository>();
            _tripRepoMock = new Mock<ITripRepository>();
            _service = new ExpenseService(_expenseRepoMock.Object, _tripRepoMock.Object);
        }

        [Fact]
        public async Task CreateExpenseAsync_ShouldSetPaidByUserId()
        {
            // Arrange
            var userId = Guid.NewGuid();
            var tripId = Guid.NewGuid();
            var request = new CreateExpenseRequest
            {
                TripId = tripId,
                Title = "Dinner",
                Amount = 50,
                Currency = "USD",
                Category = ExpenseCategory.Food.ToString(), // Service expects string and parses it
                Date = DateTime.UtcNow
            };

            var trip = new Trip(userId, "Test Trip", "Tokyo", DateTime.UtcNow, DateTime.UtcNow.AddDays(7), TravelType.Leisure);
            trip.GetType().GetProperty("Id")?.SetValue(trip, tripId);

            _tripRepoMock.Setup(r => r.GetByIdAndUserIdAsync(tripId, userId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(trip);

            Expense savedExpense = null!;
            _expenseRepoMock.Setup(r => r.AddAsync(It.IsAny<Expense>(), It.IsAny<CancellationToken>()))
                .Callback<Expense, CancellationToken>((e, c) => savedExpense = e)
                .Returns(Task.CompletedTask);

            // Act
            var result = await _service.CreateExpenseAsync(request, userId);

            // Assert
            Assert.True(result.IsSuccess);
            Assert.NotNull(savedExpense);
            savedExpense.PaidByUserId.Should().Be(userId);
            savedExpense.Title.Should().Be("Dinner");
            _expenseRepoMock.Verify(r => r.AddAsync(It.IsAny<Expense>(), It.IsAny<CancellationToken>()), Times.Once);
            _expenseRepoMock.Verify(r => r.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
        }
    }
}
