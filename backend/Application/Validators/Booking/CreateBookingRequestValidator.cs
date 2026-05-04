using Application.DTOs.Booking;
using Domain.Entities;
using FluentValidation;

namespace Application.Validators.Booking;

public class CreateBookingRequestValidator : AbstractValidator<CreateBookingRequest>
{
    public CreateBookingRequestValidator()
    {
        RuleFor(x => x.TripId)
            .NotEmpty().WithMessage("Trip ID is required.");

        RuleFor(x => x.Category)
            .IsInEnum().WithMessage("Invalid booking category.");

        RuleFor(x => x.Title)
            .NotEmpty().WithMessage("Title is required.")
            .MaximumLength(200).WithMessage("Title must not exceed 200 characters.");

        RuleFor(x => x.Description)
            .MaximumLength(1000).WithMessage("Description must not exceed 1000 characters.");

        RuleFor(x => x.Status)
            .IsInEnum().WithMessage("Invalid booking status.");

        // Date validation: if both start and end dates are provided, end date must be after or equal to start date
        RuleFor(x => x.EndDate)
            .GreaterThanOrEqualTo(x => x.StartDate)
            .When(x => x.StartDate.HasValue && x.EndDate.HasValue)
            .WithMessage("End date must be after or equal to start date.");

        RuleFor(x => x.TimeZone)
            .MaximumLength(50).WithMessage("Time zone must not exceed 50 characters.");

        RuleFor(x => x.Location)
            .MaximumLength(200).WithMessage("Location must not exceed 200 characters.");

        RuleFor(x => x.Address)
            .MaximumLength(500).WithMessage("Address must not exceed 500 characters.");

        RuleFor(x => x.Provider)
            .MaximumLength(200).WithMessage("Provider must not exceed 200 characters.");

        RuleFor(x => x.ConfirmationCode)
            .MaximumLength(100).WithMessage("Confirmation code must not exceed 100 characters.");

        // Cost validation: if cost is provided, it must be >= 0
        RuleFor(x => x.Cost)
            .GreaterThanOrEqualTo(0).When(x => x.Cost.HasValue)
            .WithMessage("Cost must be greater than or equal to 0.");

        RuleFor(x => x.Currency)
            .MaximumLength(3).WithMessage("Currency must be a 3-character ISO code.")
            .Matches("^[A-Z]{3}$").When(x => !string.IsNullOrEmpty(x.Currency))
            .WithMessage("Currency must be a valid ISO 4217 code (3 uppercase letters).");

        RuleFor(x => x.Notes)
            .MaximumLength(2000).WithMessage("Notes must not exceed 2000 characters.");

        RuleFor(x => x.ContactInfo)
            .MaximumLength(500).WithMessage("Contact information must not exceed 500 characters.");
    }
}