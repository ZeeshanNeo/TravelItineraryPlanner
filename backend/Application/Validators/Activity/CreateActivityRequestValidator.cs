using Application.DTOs.Activity;
using Domain.Entities;
using FluentValidation;

namespace Application.Validators.Activity;

public class CreateActivityRequestValidator : AbstractValidator<CreateActivityRequest>
{
    public CreateActivityRequestValidator()
    {
        RuleFor(x => x.ItineraryDayId)
            .NotEmpty().WithMessage("Itinerary Day ID is required.");

        RuleFor(x => x.Title)
            .NotEmpty().WithMessage("Title is required.")
            .MaximumLength(200).WithMessage("Title must not exceed 200 characters.");

        RuleFor(x => x.Description)
            .MaximumLength(2000).WithMessage("Description must not exceed 2000 characters.");

        RuleFor(x => x.ActivityType)
            .IsInEnum().WithMessage("Invalid activity type.");

        RuleFor(x => x.StartTime)
            .NotEmpty().WithMessage("Start time is required.");

        RuleFor(x => x.EndTime)
            .NotEmpty().WithMessage("End time is required.")
            .GreaterThan(x => x.StartTime).WithMessage("End time must be after start time.");

        RuleFor(x => x.Location)
            .MaximumLength(200).WithMessage("Location must not exceed 200 characters.");

        RuleFor(x => x.Address)
            .MaximumLength(500).WithMessage("Address must not exceed 500 characters.");

        RuleFor(x => x.Cost)
            .GreaterThanOrEqualTo(0).WithMessage("Cost must be greater than or equal to 0.")
            .When(x => x.Cost.HasValue);

        RuleFor(x => x.Currency)
            .MaximumLength(3).WithMessage("Currency must be a 3-character code.")
            .When(x => !string.IsNullOrEmpty(x.Currency));

        RuleFor(x => x.Notes)
            .MaximumLength(2000).WithMessage("Notes must not exceed 2000 characters.");

        RuleFor(x => x.Order)
            .GreaterThanOrEqualTo(0).WithMessage("Order must be greater than or equal to 0.");

        RuleFor(x => x.TravelTimeMinutes)
            .GreaterThanOrEqualTo(0).WithMessage("Travel time must be greater than or equal to 0.")
            .When(x => x.TravelTimeMinutes.HasValue);

        RuleFor(x => x.BookingReference)
            .MaximumLength(100).WithMessage("Booking reference must not exceed 100 characters.");

        RuleFor(x => x.ContactInfo)
            .MaximumLength(200).WithMessage("Contact info must not exceed 200 characters.");
    }
}