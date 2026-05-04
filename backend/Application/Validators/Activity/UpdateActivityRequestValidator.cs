using Application.DTOs.Activity;
using Domain.Entities;
using FluentValidation;

namespace Application.Validators.Activity;

public class UpdateActivityRequestValidator : AbstractValidator<UpdateActivityRequest>
{
    public UpdateActivityRequestValidator()
    {
        RuleFor(x => x.Title)
            .MaximumLength(200).WithMessage("Title must not exceed 200 characters.")
            .When(x => x.Title != null);

        RuleFor(x => x.Description)
            .MaximumLength(2000).WithMessage("Description must not exceed 2000 characters.")
            .When(x => x.Description != null);

        RuleFor(x => x.ActivityType)
            .IsInEnum().WithMessage("Invalid activity type.")
            .When(x => x.ActivityType.HasValue);

        RuleFor(x => x.EndTime)
            .GreaterThan(x => x.StartTime).WithMessage("End time must be after start time.")
            .When(x => x.StartTime.HasValue && x.EndTime.HasValue);

        RuleFor(x => x.Location)
            .MaximumLength(200).WithMessage("Location must not exceed 200 characters.")
            .When(x => x.Location != null);

        RuleFor(x => x.Address)
            .MaximumLength(500).WithMessage("Address must not exceed 500 characters.")
            .When(x => x.Address != null);

        RuleFor(x => x.Cost)
            .GreaterThanOrEqualTo(0).WithMessage("Cost must be greater than or equal to 0.")
            .When(x => x.Cost.HasValue);

        RuleFor(x => x.Currency)
            .MaximumLength(3).WithMessage("Currency must be a 3-character code.")
            .When(x => !string.IsNullOrEmpty(x.Currency));

        RuleFor(x => x.Notes)
            .MaximumLength(2000).WithMessage("Notes must not exceed 2000 characters.")
            .When(x => x.Notes != null);

        RuleFor(x => x.Order)
            .GreaterThanOrEqualTo(0).WithMessage("Order must be greater than or equal to 0.")
            .When(x => x.Order.HasValue);

        RuleFor(x => x.TravelTimeMinutes)
            .GreaterThanOrEqualTo(0).WithMessage("Travel time must be greater than or equal to 0.")
            .When(x => x.TravelTimeMinutes.HasValue);

        RuleFor(x => x.BookingReference)
            .MaximumLength(100).WithMessage("Booking reference must not exceed 100 characters.")
            .When(x => x.BookingReference != null);

        RuleFor(x => x.ContactInfo)
            .MaximumLength(200).WithMessage("Contact info must not exceed 200 characters.")
            .When(x => x.ContactInfo != null);
    }
}