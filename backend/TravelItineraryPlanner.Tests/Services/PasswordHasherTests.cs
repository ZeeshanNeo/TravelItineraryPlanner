using Application.Common.Interfaces;
using Infrastructure.Services;
using Xunit;

namespace TravelItineraryPlanner.Tests.Services;

public class PasswordHasherTests
{
    private readonly IPasswordHasher _passwordHasher;

    public PasswordHasherTests()
    {
        _passwordHasher = new PasswordHasher();
    }

    [Fact]
    public void HashPassword_Should_Return_Non_Empty_String()
    {
        var password = "TestPassword123!";
        var hashed = _passwordHasher.HashPassword(password);
        
        Assert.NotNull(hashed);
        Assert.NotEmpty(hashed);
        Assert.NotEqual(password, hashed);
    }

    [Fact]
    public void VerifyPassword_Should_Return_True_For_Correct_Password()
    {
        var password = "TestPassword123!";
        var hashed = _passwordHasher.HashPassword(password);
        
        var result = _passwordHasher.VerifyPassword(password, hashed);
        
        Assert.True(result);
    }

    [Fact]
    public void VerifyPassword_Should_Return_False_For_Incorrect_Password()
    {
        var password = "TestPassword123!";
        var wrongPassword = "WrongPassword123!";
        var hashed = _passwordHasher.HashPassword(password);
        
        var result = _passwordHasher.VerifyPassword(wrongPassword, hashed);
        
        Assert.False(result);
    }

    [Fact]
    public void VerifyPassword_Should_Return_False_For_Different_Hash()
    {
        var password = "TestPassword123!";
        var hashed1 = _passwordHasher.HashPassword(password);
        var hashed2 = _passwordHasher.HashPassword("DifferentPassword123!");
        
        var result = _passwordHasher.VerifyPassword(password, hashed2);
        
        Assert.False(result);
    }

    [Fact]
    public void HashPassword_Should_Produce_Different_Hashes_For_Same_Password()
    {
        var password = "TestPassword123!";
        var hashed1 = _passwordHasher.HashPassword(password);
        var hashed2 = _passwordHasher.HashPassword(password);
        
        // BCrypt should produce different hashes due to salt
        Assert.NotEqual(hashed1, hashed2);
    }
}