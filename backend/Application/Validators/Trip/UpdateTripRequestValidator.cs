using Application.DTOs.Trip;
using FluentValidation;

namespace Application.Validators.Trip;

public class UpdateTripRequestValidator : AbstractValidator<UpdateTripRequest>
{
    public UpdateTripRequestValidator()
    {
        RuleFor(x => x.Title)
            .MaximumLength(100).WithMessage("Title must not exceed 100 characters.")
            .When(x => !string.IsNullOrEmpty(x.Title));

        RuleFor(x => x.Destination)
            .MaximumLength(200).WithMessage("Destination must not exceed 200 characters.")
            .When(x => !string.IsNullOrEmpty(x.Destination));

        RuleFor(x => x.EndDate)
            .GreaterThanOrEqualTo(x => x.StartDate)
            .When(x => x.StartDate.HasValue && x.EndDate.HasValue)
            .WithMessage("End date must be after or equal to start date.");

        RuleFor(x => x.TravelType)
            .IsInEnum().WithMessage("Invalid travel type.")
            .When(x => x.TravelType.HasValue);

        RuleFor(x => x.Purpose)
            .MaximumLength(500).WithMessage("Purpose must not exceed 500 characters.")
            .When(x => !string.IsNullOrEmpty(x.Purpose));

        RuleFor(x => x.Notes)
            .MaximumLength(2000).WithMessage("Notes must not exceed 2000 characters.")
            .When(x => !string.IsNullOrEmpty(x.Notes));

        RuleForEach(x => x.TravelCompanions)
            .MaximumLength(100).WithMessage("Each travel companion must not exceed 100 characters.");

        RuleFor(x => x.TravelCompanions)
            .Must(x => x == null || x.Count <= 20).WithMessage("Maximum of 20 travel companions allowed.");
    }
}
