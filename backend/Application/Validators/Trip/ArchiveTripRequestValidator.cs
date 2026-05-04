using Application.DTOs.Trip;
using FluentValidation;

namespace Application.Validators.Trip;

public class ArchiveTripRequestValidator : AbstractValidator<ArchiveTripRequest>
{
    public ArchiveTripRequestValidator()
    {
        RuleFor(x => x.IsArchived)
            .NotNull().WithMessage("IsArchived is required.");
    }
}
