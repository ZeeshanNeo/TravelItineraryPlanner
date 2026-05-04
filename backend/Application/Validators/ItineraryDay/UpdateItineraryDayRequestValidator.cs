using Application.DTOs.ItineraryDay;
using FluentValidation;

namespace Application.Validators.ItineraryDay;

public class UpdateItineraryDayRequestValidator : AbstractValidator<UpdateItineraryDayRequest>
{
    public UpdateItineraryDayRequestValidator()
    {
        RuleFor(x => x.DayNumber)
            .GreaterThan(0).WithMessage("Day number must be greater than 0.")
            .When(x => x.DayNumber.HasValue);

        RuleFor(x => x.Title)
            .MaximumLength(200).WithMessage("Title must not exceed 200 characters.")
            .When(x => x.Title != null);

        RuleFor(x => x.Notes)
            .MaximumLength(2000).WithMessage("Notes must not exceed 2000 characters.")
            .When(x => x.Notes != null);
    }
}