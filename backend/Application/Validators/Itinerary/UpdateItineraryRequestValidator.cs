using Application.DTOs.Itinerary;
using FluentValidation;

namespace Application.Validators.Itinerary;

public class UpdateItineraryRequestValidator : AbstractValidator<UpdateItineraryRequest>
{
    public UpdateItineraryRequestValidator()
    {
        RuleFor(x => x.Title)
            .MaximumLength(200).WithMessage("Title must not exceed 200 characters.")
            .When(x => x.Title != null);

        RuleFor(x => x.Description)
            .MaximumLength(2000).WithMessage("Description must not exceed 2000 characters.")
            .When(x => x.Description != null);

        RuleFor(x => x.EndDate)
            .GreaterThanOrEqualTo(x => x.StartDate).WithMessage("End date must be after or equal to start date.")
            .When(x => x.StartDate.HasValue && x.EndDate.HasValue);

        RuleFor(x => x.TimeZone)
            .MaximumLength(50).WithMessage("Time zone must not exceed 50 characters.")
            .When(x => x.TimeZone != null);

        RuleForEach(x => x.Tags)
            .MaximumLength(50).WithMessage("Each tag must not exceed 50 characters.")
            .When(x => x.Tags != null);

        RuleFor(x => x.Tags)
            .Must(x => x == null || x.Count <= 20).WithMessage("Maximum of 20 tags allowed.")
            .When(x => x.Tags != null);
    }
}