using Application.DTOs.Itinerary;
using FluentValidation;

namespace Application.Validators.Itinerary;

public class CreateItineraryRequestValidator : AbstractValidator<CreateItineraryRequest>
{
    public CreateItineraryRequestValidator()
    {
        RuleFor(x => x.TripId)
            .NotEmpty().WithMessage("Trip ID is required.");

        RuleFor(x => x.Title)
            .NotEmpty().WithMessage("Title is required.")
            .MaximumLength(200).WithMessage("Title must not exceed 200 characters.");

        RuleFor(x => x.Description)
            .MaximumLength(2000).WithMessage("Description must not exceed 2000 characters.");

        RuleFor(x => x.StartDate)
            .NotEmpty().WithMessage("Start date is required.");

        RuleFor(x => x.EndDate)
            .NotEmpty().WithMessage("End date is required.")
            .GreaterThanOrEqualTo(x => x.StartDate).WithMessage("End date must be after or equal to start date.");

        RuleFor(x => x.TimeZone)
            .MaximumLength(50).WithMessage("Time zone must not exceed 50 characters.");

        RuleForEach(x => x.Tags)
            .MaximumLength(50).WithMessage("Each tag must not exceed 50 characters.");

        RuleFor(x => x.Tags)
            .Must(x => x == null || x.Count <= 20).WithMessage("Maximum of 20 tags allowed.");
    }
}