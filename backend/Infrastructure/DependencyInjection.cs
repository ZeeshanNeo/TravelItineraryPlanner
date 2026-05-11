using Application.Common.Interfaces;
using Application.Interfaces;
using Application.Services;
using Domain.Interfaces;
using Infrastructure.Data;
using Infrastructure.Data.Repositories;
using Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        // Database
        services.AddDbContext<ApplicationDbContext>(options =>
            options.UseSqlServer(configuration.GetConnectionString("DefaultConnection"))
                   .ConfigureWarnings(w => w.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.RelationalEventId.PendingModelChangesWarning)));

        // Repositories
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IRefreshTokenRepository, RefreshTokenRepository>();
        services.AddScoped<IPasswordResetTokenRepository, PasswordResetTokenRepository>();
        services.AddScoped<ITripRepository, TripRepository>();
        services.AddScoped<IItineraryRepository, ItineraryRepository>();
        services.AddScoped<IItineraryDayRepository, ItineraryDayRepository>();
        services.AddScoped<IActivityRepository, ActivityRepository>();
        services.AddScoped<IBookingRepository, BookingRepository>();
        services.AddScoped<IBookingDocumentRepository, BookingDocumentRepository>();
        services.AddScoped<IExpenseRepository, ExpenseRepository>();
        services.AddScoped<ITripBudgetRepository, TripBudgetRepository>();
        services.AddScoped<IPackingListRepository, PackingListRepository>();
        services.AddScoped<IChecklistRepository, ChecklistRepository>();
        services.AddScoped<IEmergencyContactRepository, EmergencyContactRepository>();
        services.AddScoped<ITravelDocumentRepository, TravelDocumentRepository>();
        services.AddScoped<ILocalInfoRepository, LocalInfoRepository>();
        services.AddScoped<IMemoryRepository, MemoryRepository>();
        services.AddScoped<IJournalRepository, JournalRepository>();
        services.AddScoped<ITagRepository, TagRepository>();
        services.AddScoped<ITripMemberRepository, TripMemberRepository>();
        services.AddScoped<ICommentRepository, CommentRepository>();
        services.AddScoped<ITaskRepository, TaskRepository>();
        services.AddScoped<IExpenseSplitRepository, ExpenseSplitRepository>();

        // Services
        services.AddScoped<IPasswordHasher, PasswordHasher>();
        services.AddScoped<ITokenService, TokenService>();
        services.AddScoped<IEmailService, EmailService>();
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IProfileService, ProfileService>();
        services.AddScoped<ITripService, TripService>();
        services.AddScoped<IItineraryService, ItineraryService>();
        services.AddScoped<IBookingService, BookingService>();
        services.AddScoped<IBookingDocumentService, BookingDocumentService>();
        services.AddScoped<IFileStorageService, FileStorageService>();
        services.AddScoped<IBudgetService, BudgetService>();
        services.AddScoped<IExpenseService, ExpenseService>();
        services.AddScoped<ITravelDocService, TravelDocService>();
        services.AddScoped<IMemoryService, MemoryService>();
        services.AddScoped<ICollaborationService, CollaborationService>();
        services.AddScoped<ICommentService, CommentService>();
        services.AddScoped<ITaskService, TaskService>();
        services.AddScoped<ISharedExpenseService, SharedExpenseService>();
        services.AddScoped<IWeatherService, WeatherService>();
        services.AddScoped<ICurrencyService, CurrencyService>();
        services.AddScoped<ITimeZoneService, TimeZoneService>();
        services.AddScoped<DestinationTemplateService>();
        
        // Identity & Context
        services.AddHttpContextAccessor();
        services.AddScoped<ICurrentUserService, CurrentUserService>();

        return services;
    }
}