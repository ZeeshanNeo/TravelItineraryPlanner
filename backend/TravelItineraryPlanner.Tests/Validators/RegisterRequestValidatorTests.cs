using Application.DTOs.Auth;
using Application.Validators;
using FluentValidation.TestHelper;

namespace TravelItineraryPlanner.Tests.Validators;

public class RegisterRequestValidatorTests
{
    private readonly RegisterRequestValidator _validator;

    public RegisterRequestValidatorTests()
    {
        _validator = new RegisterRequestValidator();
    }

    [Fact]
    public void Should_Have_Error_When_Email_Is_Empty()
    {
        var model = new RegisterRequest { Email = "", Password = "Password123!", FirstName = "John", LastName = "Doe", PhoneNumber = "1234567890" };
        var result = _validator.TestValidate(model);
        result.ShouldHaveValidationErrorFor(x => x.Email);
    }

    [Fact]
    public void Should_Have_Error_When_Email_Is_Invalid()
    {
        var model = new RegisterRequest { Email = "invalid-email", Password = "Password123!", FirstName = "John", LastName = "Doe", PhoneNumber = "1234567890" };
        var result = _validator.TestValidate(model);
        result.ShouldHaveValidationErrorFor(x => x.Email);
    }

    [Fact]
    public void Should_Not_Have_Error_When_Email_Is_Valid()
    {
        var model = new RegisterRequest { Email = "test@example.com", Password = "Password123!", FirstName = "John", LastName = "Doe", PhoneNumber = "1234567890" };
        var result = _validator.TestValidate(model);
        result.ShouldNotHaveValidationErrorFor(x => x.Email);
    }

    [Fact]
    public void Should_Have_Error_When_Password_Is_Too_Short()
    {
        var model = new RegisterRequest { Email = "test@example.com", Password = "Short1!", FirstName = "John", LastName = "Doe", PhoneNumber = "1234567890" };
        var result = _validator.TestValidate(model);
        result.ShouldHaveValidationErrorFor(x => x.Password);
    }

    [Fact]
    public void Should_Have_Error_When_Password_Missing_Uppercase()
    {
        var model = new RegisterRequest { Email = "test@example.com", Password = "password123!", FirstName = "John", LastName = "Doe", PhoneNumber = "1234567890" };
        var result = _validator.TestValidate(model);
        result.ShouldHaveValidationErrorFor(x => x.Password);
    }

    [Fact]
    public void Should_Have_Error_When_Password_Missing_Lowercase()
    {
        var model = new RegisterRequest { Email = "test@example.com", Password = "PASSWORD123!", FirstName = "John", LastName = "Doe", PhoneNumber = "1234567890" };
        var result = _validator.TestValidate(model);
        result.ShouldHaveValidationErrorFor(x => x.Password);
    }

    [Fact]
    public void Should_Have_Error_When_Password_Missing_Digit()
    {
        var model = new RegisterRequest { Email = "test@example.com", Password = "Password!", FirstName = "John", LastName = "Doe", PhoneNumber = "1234567890" };
        var result = _validator.TestValidate(model);
        result.ShouldHaveValidationErrorFor(x => x.Password);
    }

    [Fact]
    public void Should_Have_Error_When_Password_Missing_Special_Character()
    {
        var model = new RegisterRequest { Email = "test@example.com", Password = "Password123", FirstName = "John", LastName = "Doe", PhoneNumber = "1234567890" };
        var result = _validator.TestValidate(model);
        result.ShouldHaveValidationErrorFor(x => x.Password);
    }

    [Fact]
    public void Should_Not_Have_Error_When_Password_Is_Valid()
    {
        var model = new RegisterRequest { Email = "test@example.com", Password = "Password123!", FirstName = "John", LastName = "Doe", PhoneNumber = "1234567890" };
        var result = _validator.TestValidate(model);
        result.ShouldNotHaveValidationErrorFor(x => x.Password);
    }

    [Fact]
    public void Should_Have_Error_When_FirstName_Is_Empty()
    {
        var model = new RegisterRequest { Email = "test@example.com", Password = "Password123!", FirstName = "", LastName = "Doe", PhoneNumber = "1234567890" };
        var result = _validator.TestValidate(model);
        result.ShouldHaveValidationErrorFor(x => x.FirstName);
    }

    [Fact]
    public void Should_Have_Error_When_LastName_Is_Empty()
    {
        var model = new RegisterRequest { Email = "test@example.com", Password = "Password123!", FirstName = "John", LastName = "", PhoneNumber = "1234567890" };
        var result = _validator.TestValidate(model);
        result.ShouldHaveValidationErrorFor(x => x.LastName);
    }

    [Fact]
    public void Should_Not_Have_Error_When_PhoneNumber_Is_Optional()
    {
        var model = new RegisterRequest { Email = "test@example.com", Password = "Password123!", FirstName = "John", LastName = "Doe", PhoneNumber = "" };
        var result = _validator.TestValidate(model);
        result.ShouldNotHaveValidationErrorFor(x => x.PhoneNumber);
    }

    [Fact]
    public void Should_Have_Error_When_PhoneNumber_Is_Too_Long()
    {
        var model = new RegisterRequest { Email = "test@example.com", Password = "Password123!", FirstName = "John", LastName = "Doe", PhoneNumber = new string('1', 21) };
        var result = _validator.TestValidate(model);
        result.ShouldHaveValidationErrorFor(x => x.PhoneNumber);
    }
}