using Application.DTOs.Budget;
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
    public class BudgetServiceTests
    {
        private readonly Mock<ITripBudgetRepository> _budgetRepoMock;
        private readonly Mock<IExpenseRepository> _expenseRepoMock;
        private readonly Mock<ITripRepository> _tripRepoMock;
        private readonly BudgetService _service;

        public BudgetServiceTests()
        {
            _budgetRepoMock = new Mock<ITripBudgetRepository>();
            _expenseRepoMock = new Mock<IExpenseRepository>();
            _tripRepoMock = new Mock<ITripRepository>();
            _service = new BudgetService(_budgetRepoMock.Object, _expenseRepoMock.Object, _tripRepoMock.Object);
        }

        [Fact]
        public async Task GetBudgetSummaryAsync_ShouldCalculateCorrectTotals()
        {
            // Arrange
            var tripId = Guid.NewGuid();
            var userId = Guid.NewGuid();
            var budget = new TripBudget(tripId, 1000, "USD");
            
            var trip = new Trip(userId, "Test Trip", "Tokyo", DateTime.UtcNow, DateTime.UtcNow.AddDays(7), TravelType.Leisure);
            trip.GetType().GetProperty("Id")?.SetValue(trip, tripId);

            var expense1 = new Expense(tripId, "Lunch", ExpenseCategory.Food, 200, "USD", userId, DateTime.UtcNow);
            var expense2 = new Expense(tripId, "Taxi", ExpenseCategory.Transport, 300, "USD", userId, DateTime.UtcNow);
            
            var expenses = new List<Expense> { expense1, expense2 };

            _tripRepoMock.Setup(r => r.GetByIdAndUserIdAsync(tripId, userId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(trip);
            _budgetRepoMock.Setup(r => r.GetByTripIdAndUserIdAsync(tripId, userId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(budget);
            _expenseRepoMock.Setup(r => r.GetByTripIdAsync(tripId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(expenses);

            // Act
            var result = await _service.GetBudgetSummaryAsync(tripId, userId);

            // Assert
            Assert.True(result.IsSuccess);
            Assert.NotNull(result.Value);
            result.Value.TotalBudget.Should().Be(1000);
            result.Value.TotalSpent.Should().Be(500);
            result.Value.RemainingBudget.Should().Be(500);
        }
    }
}
