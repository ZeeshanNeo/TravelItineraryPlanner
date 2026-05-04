using Application.DTOs.ItineraryDay;
using FluentValidation;

namespace Application.Validators.ItineraryDay;

public class CreateItineraryDayRequestValidator : AbstractValidator<CreateItineraryDayRequest>
{
    public CreateItineraryDayRequestValidator()
    {
        RuleFor(x => x.ItineraryId)
            .NotEmpty().WithMessage("Itinerary ID is required.");

        RuleFor(x => x.DayNumber)
            .GreaterThan(0).WithMessage("Day number must be greater than 0.");

        RuleFor(x => x.Date)
            .NotEmpty().WithMessage("Date is required.");

        RuleFor(x => x.Title)
            .NotEmpty().WithMessage("Title is required.")
            .MaximumLength(200).WithMessage("Title must not exceed 200 characters.");

        RuleFor(x => x.Notes)
            .MaximumLength(2000).WithMessage("Notes must not exceed 2000 characters.");
    }
}