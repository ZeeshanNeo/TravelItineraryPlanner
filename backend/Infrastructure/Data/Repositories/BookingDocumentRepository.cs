using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Domain.Entities;
using Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Data.Repositories;

public class BookingDocumentRepository : IBookingDocumentRepository
{
    private readonly ApplicationDbContext _context;

    public BookingDocumentRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<BookingDocument?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.BookingDocuments
            .Include(d => d.Booking)
            .FirstOrDefaultAsync(d => d.Id == id, cancellationToken);
    }

    public async Task<BookingDocument?> GetByIdAndUserIdAsync(Guid id, Guid userId, CancellationToken cancellationToken = default)
    {
        return await _context.BookingDocuments
            .Include(d => d.Booking)
            .ThenInclude(b => b.Trip)
            .FirstOrDefaultAsync(d => d.Id == id && d.Booking.Trip.UserId == userId, cancellationToken);
    }

    public async Task<IEnumerable<BookingDocument>> GetByBookingIdAsync(Guid bookingId, Guid userId, CancellationToken cancellationToken = default)
    {
        return await _context.BookingDocuments
            .Include(d => d.Booking)
            .ThenInclude(b => b.Trip)
            .Where(d => d.BookingId == bookingId && d.Booking.Trip.UserId == userId)
            .OrderByDescending(d => d.UploadedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<BookingDocument>> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return await _context.BookingDocuments
            .Include(d => d.Booking)
            .ThenInclude(b => b.Trip)
            .Where(d => d.Booking.Trip.UserId == userId)
            .OrderByDescending(d => d.UploadedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task AddAsync(BookingDocument document, CancellationToken cancellationToken = default)
    {
        await _context.BookingDocuments.AddAsync(document, cancellationToken);
    }

    public void Update(BookingDocument document)
    {
        _context.BookingDocuments.Update(document);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var document = await GetByIdAsync(id, cancellationToken);
        if (document != null)
        {
            _context.BookingDocuments.Remove(document);
        }
    }

    public async Task SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        await _context.SaveChangesAsync(cancellationToken);
    }
}