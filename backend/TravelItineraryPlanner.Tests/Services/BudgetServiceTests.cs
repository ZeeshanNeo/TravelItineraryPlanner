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

namespace TravelItineraryPlanner.Tests.Services
{
    public class BudgetServiceTests
    {
        private readonly Mock<ITripBudgetRepository> _budgetRepoMock;
        private readonly Mock<IExpenseRepository> _expenseRepoMock;
        private readonly BudgetService _service;

        public BudgetServiceTests()
        {
            _budgetRepoMock = new Mock<ITripBudgetRepository>();
            _expenseRepoMock = new Mock<IExpenseRepository>();
            _service = new BudgetService(_budgetRepoMock.Object, _expenseRepoMock.Object);
        }

        [Fact]
        public async Task GetBudgetSummaryAsync_ShouldCalculateCorrectTotals()
        {
            // Arrange
            var tripId = Guid.NewGuid();
            var userId = Guid.NewGuid();
            var budget = new TripBudget 
            { 
                TripId = tripId, 
                TotalAmount = 1000, 
                Currency = "USD" 
            };
            
            var expenses = new List<Expense>
            {
                new Expense { Amount = 200, Category = ExpenseCategory.Food, ExchangeRate = 1 },
                new Expense { Amount = 300, Category = ExpenseCategory.Transport, ExchangeRate = 1 }
            };

            _budgetRepoMock.Setup(r => r.GetByTripIdAndUserIdAsync(tripId, userId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(budget);
            _expenseRepoMock.Setup(r => r.GetByTripIdAsync(tripId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(expenses);

            // Act
            var summary = await _service.GetBudgetSummaryAsync(tripId, userId);

            // Assert
            summary.TotalBudget.Should().Be(1000);
            summary.TotalSpent.Should().Be(500);
            summary.RemainingBudget.Should().Be(500);
        }
    }
}
