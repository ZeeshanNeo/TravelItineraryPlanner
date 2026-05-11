using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace Infrastructure.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users { get; set; }
    public DbSet<RefreshToken> RefreshTokens { get; set; }
    public DbSet<PasswordResetToken> PasswordResetTokens { get; set; }
    public DbSet<Trip> Trips { get; set; }
    public DbSet<Itinerary> Itineraries { get; set; }
    public DbSet<ItineraryDay> ItineraryDays { get; set; }
    public DbSet<Activity> Activities { get; set; }
    public DbSet<Booking> Bookings { get; set; }
    public DbSet<BookingDocument> BookingDocuments { get; set; }
    public DbSet<Expense> Expenses { get; set; }
    public DbSet<TripBudget> TripBudgets { get; set; }
    public DbSet<CategoryBudget> CategoryBudgets { get; set; }
    public DbSet<PackingList> PackingLists { get; set; }
    public DbSet<PackingItem> PackingItems { get; set; }
    public DbSet<TravelChecklist> TravelChecklists { get; set; }
    public DbSet<ChecklistItem> ChecklistItems { get; set; }
    public DbSet<EmergencyContact> EmergencyContacts { get; set; }
    public DbSet<TravelDocument> TravelDocuments { get; set; }
    public DbSet<LocalInfoNote> LocalInfoNotes { get; set; }
    public DbSet<MemoryPhoto> MemoryPhotos { get; set; }
    public DbSet<JournalEntry> JournalEntries { get; set; }
    public DbSet<MemoryTag> MemoryTags { get; set; }
    public DbSet<MemoryTagMapping> MemoryTagMappings { get; set; }
    public DbSet<TripMember> TripMembers { get; set; }
    public DbSet<Comment> Comments { get; set; }
    public DbSet<TripTask> TripTasks { get; set; }
    public DbSet<ExpenseSplit> ExpenseSplits { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Email).IsUnique();
            entity.Property(e => e.Email).IsRequired().HasMaxLength(255);
            entity.Property(e => e.PasswordHash).IsRequired();
            entity.Property(e => e.FirstName).IsRequired().HasMaxLength(50);
            entity.Property(e => e.LastName).IsRequired().HasMaxLength(50);
            entity.Property(e => e.PhoneNumber).HasMaxLength(20);
            entity.Property(e => e.TravelPreferences)
                .HasConversion(
                    v => v != null ? v.RootElement.ToString() : null,
                    v => v != null ? JsonDocument.Parse(v, new JsonDocumentOptions()) : null
                )
                .HasColumnType("nvarchar(max)");
            entity.Property(e => e.PassportDetails)
                .HasConversion(
                    v => v != null ? v.RootElement.ToString() : null,
                    v => v != null ? JsonDocument.Parse(v, new JsonDocumentOptions()) : null
                )
                .HasColumnType("nvarchar(max)");
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("GETUTCDATE()");
            entity.Property(e => e.FailedLoginAttempts).HasDefaultValue(0);
            entity.Property(e => e.EmailVerified).HasDefaultValue(false);
            entity.Property(e => e.IsActive).HasDefaultValue(true);

            entity.HasMany(e => e.RefreshTokens)
                .WithOne(e => e.User)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasMany(e => e.PasswordResetTokens)
                .WithOne(e => e.User)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasMany(e => e.Trips)
                .WithOne(e => e.User)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<RefreshToken>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.UserId);
            entity.Property(e => e.TokenHash).IsRequired().HasMaxLength(512);
            entity.Property(e => e.ExpiresAt).IsRequired();
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
            entity.Property(e => e.IsRevoked).HasDefaultValue(false);
            entity.Property(e => e.ReplacedByTokenHash).HasMaxLength(512);
        });

        modelBuilder.Entity<PasswordResetToken>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.UserId);
            entity.Property(e => e.TokenHash).IsRequired().HasMaxLength(512);
            entity.Property(e => e.ExpiresAt).IsRequired();
            entity.Property(e => e.IsUsed).HasDefaultValue(false);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
        });

        modelBuilder.Entity<Trip>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.UserId);
            entity.HasIndex(e => e.IsArchived);
            entity.HasIndex(e => e.StartDate);

            entity.Property(e => e.Title).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Destination).IsRequired().HasMaxLength(200);
            entity.Property(e => e.StartDate).IsRequired();
            entity.Property(e => e.EndDate).IsRequired();
            entity.Property(e => e.TravelType).HasConversion<string>().IsRequired();
            entity.Property(e => e.Purpose).HasMaxLength(500);
            entity.Property(e => e.Notes).HasMaxLength(2000);
            entity.Property(e => e.DestinationTimeZoneId).HasMaxLength(50);
            
            entity.Property(e => e.TravelCompanions)
                .HasConversion(
                    v => v != null ? v.RootElement.ToString() : null,
                    v => v != null ? JsonDocument.Parse(v, new JsonDocumentOptions()) : null
                )
                .HasColumnType("nvarchar(max)");

            entity.Property(e => e.IsArchived).HasDefaultValue(false);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("GETUTCDATE()");

            entity.HasMany(e => e.Itineraries)
                .WithOne(e => e.Trip)
                .HasForeignKey(e => e.TripId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Itinerary>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.TripId);
            entity.HasIndex(e => e.IsArchived);
            entity.HasIndex(e => e.StartDate);

            entity.Property(e => e.Title).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Description).HasMaxLength(1000);
            entity.Property(e => e.StartDate).IsRequired();
            entity.Property(e => e.EndDate).IsRequired();
            entity.Property(e => e.TotalDays).IsRequired();
            entity.Property(e => e.TimeZone).HasMaxLength(50);
            
            entity.Property(e => e.Tags)
                .HasConversion(
                    v => v != null ? v.RootElement.ToString() : null,
                    v => v != null ? JsonDocument.Parse(v, new JsonDocumentOptions()) : null
                )
                .HasColumnType("nvarchar(max)");

            entity.Property(e => e.IsPublic).HasDefaultValue(false);
            entity.Property(e => e.IsArchived).HasDefaultValue(false);
            entity.Property(e => e.ShareToken).HasMaxLength(100);
            entity.Property(e => e.ShareTokenExpiresAt);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("GETUTCDATE()");

            entity.HasMany(e => e.Days)
                .WithOne(e => e.Itinerary)
                .HasForeignKey(e => e.ItineraryId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<ItineraryDay>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.ItineraryId);
            entity.HasIndex(e => e.Date);
            entity.HasIndex(e => e.DayNumber);

            entity.Property(e => e.Date).IsRequired();
            entity.Property(e => e.DayNumber).IsRequired();
            entity.Property(e => e.Title).HasMaxLength(100);
            entity.Property(e => e.Notes).HasMaxLength(2000);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("GETUTCDATE()");

            entity.HasMany(e => e.Activities)
                .WithOne(e => e.ItineraryDay)
                .HasForeignKey(e => e.ItineraryDayId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Activity>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.ItineraryDayId);
            entity.HasIndex(e => e.ActivityType);
            entity.HasIndex(e => e.StartTime);
            entity.HasIndex(e => e.Order);

            entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Description).HasMaxLength(2000);
            entity.Property(e => e.ActivityType).HasConversion<string>().IsRequired();
            entity.Property(e => e.StartTime).IsRequired();
            entity.Property(e => e.EndTime).IsRequired();
            entity.Property(e => e.Location).HasMaxLength(200);
            entity.Property(e => e.Address).HasMaxLength(500);
            entity.Property(e => e.Cost).HasPrecision(18, 2);
            entity.Property(e => e.Currency).HasMaxLength(3);
            entity.Property(e => e.Notes).HasMaxLength(2000);
            entity.Property(e => e.Order).IsRequired();
            entity.Property(e => e.TravelTimeMinutes);
            entity.Property(e => e.IsFlexible).HasDefaultValue(false);
            entity.Property(e => e.BookingReference).HasMaxLength(100);
            entity.Property(e => e.ContactInfo).HasMaxLength(500);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("GETUTCDATE()");
        });

        modelBuilder.Entity<Booking>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.TripId);
            entity.HasIndex(e => e.ActivityId);
            entity.HasIndex(e => e.Category);
            entity.HasIndex(e => e.Status);
            entity.HasIndex(e => e.IsArchived);
            entity.HasIndex(e => e.CreatedAt);

            entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Description).HasMaxLength(1000);
            entity.Property(e => e.Category).HasConversion<string>().IsRequired();
            entity.Property(e => e.Status).HasConversion<string>().IsRequired();
            entity.Property(e => e.TimeZone).HasMaxLength(50);
            entity.Property(e => e.Location).HasMaxLength(200);
            entity.Property(e => e.Address).HasMaxLength(500);
            entity.Property(e => e.Provider).HasMaxLength(200);
            entity.Property(e => e.ConfirmationCode).HasMaxLength(100);
            entity.Property(e => e.Cost).HasPrecision(18, 2);
            entity.Property(e => e.Currency).HasMaxLength(3);
            entity.Property(e => e.Notes).HasMaxLength(2000);
            entity.Property(e => e.ContactInfo).HasMaxLength(500);
            entity.Property(e => e.IsArchived).HasDefaultValue(false);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("GETUTCDATE()");

            entity.HasOne(e => e.Trip)
                .WithMany()
                .HasForeignKey(e => e.TripId)
                .OnDelete(DeleteBehavior.NoAction);

            entity.HasOne(e => e.Activity)
                .WithMany()
                .HasForeignKey(e => e.ActivityId)
                .OnDelete(DeleteBehavior.SetNull);

            entity.HasMany(e => e.Documents)
                .WithOne(e => e.Booking)
                .HasForeignKey(e => e.BookingId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<BookingDocument>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.BookingId);
            entity.HasIndex(e => e.UploadedAt);

            entity.Property(e => e.FileName).IsRequired().HasMaxLength(255);
            entity.Property(e => e.FilePath).IsRequired().HasMaxLength(500);
            entity.Property(e => e.ContentType).IsRequired().HasMaxLength(100);
            entity.Property(e => e.FileSize).IsRequired();
            entity.Property(e => e.UploadedAt).HasDefaultValueSql("GETUTCDATE()");

            entity.HasOne(e => e.Booking)
                .WithMany(e => e.Documents)
                .HasForeignKey(e => e.BookingId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Expense>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.TripId);
            entity.HasIndex(e => e.BookingId);
            entity.HasIndex(e => e.ActivityId);
            entity.HasIndex(e => e.Category);
            entity.HasIndex(e => e.Date);

            entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Description).HasMaxLength(1000);
            entity.Property(e => e.Category).HasConversion<string>().IsRequired();
            entity.Property(e => e.Amount).HasPrecision(18, 2);
            entity.Property(e => e.Currency).HasMaxLength(3);
            entity.Property(e => e.ExchangeRate).HasPrecision(18, 4);
            entity.Property(e => e.Date).IsRequired();
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("GETUTCDATE()");

            entity.HasOne(e => e.Trip)
                .WithMany()
                .HasForeignKey(e => e.TripId)
                .OnDelete(DeleteBehavior.NoAction);

            entity.HasOne(e => e.PaidByUser)
                .WithMany()
                .HasForeignKey(e => e.PaidByUserId)
                .OnDelete(DeleteBehavior.NoAction);

            entity.HasOne(e => e.Booking)
                .WithMany()
                .HasForeignKey(e => e.BookingId)
                .OnDelete(DeleteBehavior.SetNull);

            entity.HasOne(e => e.Activity)
                .WithMany()
                .HasForeignKey(e => e.ActivityId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<TripBudget>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.TripId).IsUnique();

            entity.Property(e => e.TotalAmount).HasPrecision(18, 2);
            entity.Property(e => e.Currency).HasMaxLength(3);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("GETUTCDATE()");

            entity.HasOne(e => e.Trip)
                .WithOne()
                .HasForeignKey<TripBudget>(e => e.TripId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasMany(e => e.CategoryBudgets)
                .WithOne(e => e.TripBudget)
                .HasForeignKey(e => e.TripBudgetId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<CategoryBudget>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.TripBudgetId);
            entity.HasIndex(e => e.Category);

            entity.Property(e => e.Category).HasConversion<string>().IsRequired();
            entity.Property(e => e.Amount).HasPrecision(18, 2);

            entity.HasOne(e => e.TripBudget)
                .WithMany(e => e.CategoryBudgets)
                .HasForeignKey(e => e.TripBudgetId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<PackingList>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.TripId);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Category).HasMaxLength(50);
            entity.Property(e => e.IsTemplate).HasDefaultValue(false);
            entity.Property(e => e.TemplateCategory).HasMaxLength(50);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("GETUTCDATE()");

            entity.HasOne(e => e.Trip)
                .WithMany()
                .HasForeignKey(e => e.TripId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasMany(e => e.Items)
                .WithOne(e => e.PackingList)
                .HasForeignKey(e => e.PackingListId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<PackingItem>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.PackingListId);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Quantity).HasDefaultValue(1);
            entity.Property(e => e.IsPacked).HasDefaultValue(false);
        });

        modelBuilder.Entity<TravelChecklist>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.TripId);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(100);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("GETUTCDATE()");

            entity.HasOne(e => e.Trip)
                .WithMany()
                .HasForeignKey(e => e.TripId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasMany(e => e.Items)
                .WithOne(e => e.Checklist)
                .HasForeignKey(e => e.ChecklistId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<ChecklistItem>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.ChecklistId);
            entity.Property(e => e.Task).IsRequired().HasMaxLength(500);
            entity.Property(e => e.IsCompleted).HasDefaultValue(false);
        });

        modelBuilder.Entity<EmergencyContact>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.TripId);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Relationship).HasMaxLength(50);
            entity.Property(e => e.PhoneNumber).HasMaxLength(20);
            entity.Property(e => e.Email).HasMaxLength(255);
            entity.Property(e => e.Notes).HasMaxLength(500);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("GETUTCDATE()");

            entity.HasOne(e => e.Trip)
                .WithMany()
                .HasForeignKey(e => e.TripId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<TravelDocument>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.TripId);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Type).HasConversion<string>().IsRequired();
            entity.Property(e => e.FileName).IsRequired().HasMaxLength(255);
            entity.Property(e => e.FilePath).IsRequired().HasMaxLength(500);
            entity.Property(e => e.ContentType).HasMaxLength(100);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");

            entity.HasOne(e => e.Trip)
                .WithMany()
                .HasForeignKey(e => e.TripId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<LocalInfoNote>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.TripId);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Category).HasConversion<string>().IsRequired();
            entity.Property(e => e.Content).IsRequired().HasColumnType("nvarchar(max)");
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("GETUTCDATE()");

            entity.HasOne(e => e.Trip)
                .WithMany()
                .HasForeignKey(e => e.TripId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<MemoryPhoto>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.TripId);
            entity.Property(e => e.Title).HasMaxLength(200);
            entity.Property(e => e.FilePath).IsRequired().HasMaxLength(500);
            entity.Property(e => e.Location).HasMaxLength(200);
            entity.Property(e => e.UploadedAt).HasDefaultValueSql("GETUTCDATE()");

            entity.HasOne(e => e.Trip)
                .WithMany()
                .HasForeignKey(e => e.TripId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Activity)
                .WithMany()
                .HasForeignKey(e => e.ActivityId)
                .OnDelete(DeleteBehavior.NoAction);
        });

        modelBuilder.Entity<JournalEntry>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.TripId);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Content).IsRequired().HasColumnType("nvarchar(max)");
            entity.Property(e => e.Location).HasMaxLength(200);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("GETUTCDATE()");

            entity.HasOne(e => e.Trip)
                .WithMany()
                .HasForeignKey(e => e.TripId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Activity)
                .WithMany()
                .HasForeignKey(e => e.ActivityId)
                .OnDelete(DeleteBehavior.NoAction);
        });

        modelBuilder.Entity<MemoryTag>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Name).IsUnique();
            entity.Property(e => e.Name).IsRequired().HasMaxLength(50);
            entity.Property(e => e.Category).HasMaxLength(50);
        });

        modelBuilder.Entity<MemoryTagMapping>(entity =>
        {
            entity.HasKey(e => new { e.PhotoId, e.TagId });

            entity.HasOne(e => e.Photo)
                .WithMany(p => p.Tags)
                .HasForeignKey(e => e.PhotoId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Tag)
                .WithMany(t => t.Photos)
                .HasForeignKey(e => e.TagId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<TripMember>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => new { e.TripId, e.UserId }).IsUnique();
            entity.Property(e => e.Role).HasConversion<string>().IsRequired();
            entity.Property(e => e.JoinedAt).HasDefaultValueSql("GETUTCDATE()");

            entity.HasOne(e => e.Trip)
                .WithMany()
                .HasForeignKey(e => e.TripId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.User)
                .WithMany()
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.NoAction);
        });

        modelBuilder.Entity<Comment>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.TripId);
            entity.HasIndex(e => e.ActivityId);
            entity.Property(e => e.Text).IsRequired().HasMaxLength(2000);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");

            entity.HasOne(e => e.Trip)
                .WithMany()
                .HasForeignKey(e => e.TripId)
                .OnDelete(DeleteBehavior.NoAction);

            entity.HasOne(e => e.User)
                .WithMany()
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.NoAction);

            entity.HasOne(e => e.Activity)
                .WithMany()
                .HasForeignKey(e => e.ActivityId)
                .OnDelete(DeleteBehavior.NoAction);
        });

        modelBuilder.Entity<TripTask>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.TripId);
            entity.HasIndex(e => e.AssignedToUserId);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Status).HasConversion<string>().IsRequired();
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("GETUTCDATE()");

            entity.HasOne(e => e.Trip)
                .WithMany()
                .HasForeignKey(e => e.TripId)
                .OnDelete(DeleteBehavior.NoAction);

            entity.HasOne(e => e.AssignedToUser)
                .WithMany()
                .HasForeignKey(e => e.AssignedToUserId)
                .OnDelete(DeleteBehavior.NoAction);
        });

        modelBuilder.Entity<ExpenseSplit>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.ExpenseId);
            entity.HasIndex(e => e.UserId);
            entity.Property(e => e.Amount).HasPrecision(18, 2);
            entity.Property(e => e.IsPaid).HasDefaultValue(false);

            entity.HasOne(e => e.Expense)
                .WithMany(e => e.Splits)
                .HasForeignKey(e => e.ExpenseId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.User)
                .WithMany()
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.NoAction); // Avoid multiple cascade paths
        });


    }
}