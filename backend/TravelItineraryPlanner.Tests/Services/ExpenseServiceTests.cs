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

namespace TravelItineraryPlanner.Tests.Services
{
    public class ExpenseServiceTests
    {
        private readonly Mock<IExpenseRepository> _expenseRepoMock;
        private readonly ExpenseService _service;

        public ExpenseServiceTests()
        {
            _expenseRepoMock = new Mock<IExpenseRepository>();
            _service = new ExpenseService(_expenseRepoMock.Object);
        }

        [Fact]
        public async Task CreateExpenseAsync_ShouldSetPaidByUserId()
        {
            // Arrange
            var userId = Guid.NewGuid();
            var request = new CreateExpenseRequest
            {
                TripId = Guid.NewGuid(),
                Title = "Dinner",
                Amount = 50,
                Currency = "USD",
                Category = "Food",
                Date = DateTime.UtcNow
            };

            Expense savedExpense = null;
            _expenseRepoMock.Setup(r => r.AddAsync(It.IsAny<Expense>(), It.IsAny<CancellationToken>()))
                .Callback<Expense, CancellationToken>((e, c) => savedExpense = e)
                .Returns(Task.CompletedTask);

            // Act
            await _service.CreateExpenseAsync(request, userId);

            // Assert
            savedExpense.Should().NotBeNull();
            savedExpense.PaidByUserId.Should().Be(userId);
            savedExpense.Title.Should().Be("Dinner");
        }
    }
}
