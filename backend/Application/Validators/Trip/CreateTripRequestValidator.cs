using Application.DTOs.Trip;
using FluentValidation;

namespace Application.Validators.Trip;

public class CreateTripRequestValidator : AbstractValidator<CreateTripRequest>
{
    public CreateTripRequestValidator()
    {
        RuleFor(x => x.Title)
            .NotEmpty().WithMessage("Title is required.")
            .MaximumLength(100).WithMessage("Title must not exceed 100 characters.");

        RuleFor(x => x.Destination)
            .NotEmpty().WithMessage("Destination is required.")
            .MaximumLength(200).WithMessage("Destination must not exceed 200 characters.");

        RuleFor(x => x.StartDate)
            .NotEmpty().WithMessage("Start date is required.");

        RuleFor(x => x.EndDate)
            .NotEmpty().WithMessage("End date is required.")
            .GreaterThanOrEqualTo(x => x.StartDate).WithMessage("End date must be after or equal to start date.");

        RuleFor(x => x.TravelType)
            .IsInEnum().WithMessage("Invalid travel type.");

        RuleFor(x => x.Purpose)
            .MaximumLength(500).WithMessage("Purpose must not exceed 500 characters.");

        RuleFor(x => x.Notes)
            .MaximumLength(2000).WithMessage("Notes must not exceed 2000 characters.");

        RuleForEach(x => x.TravelCompanions)
            .MaximumLength(100).WithMessage("Each travel companion must not exceed 100 characters.");

        RuleFor(x => x.TravelCompanions)
            .Must(x => x == null || x.Count <= 20).WithMessage("Maximum of 20 travel companions allowed.");
    }
}
