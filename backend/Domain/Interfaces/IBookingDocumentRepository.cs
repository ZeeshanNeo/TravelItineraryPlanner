using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Domain.Entities;

namespace Domain.Interfaces;

public interface IBookingDocumentRepository
{
    Task<BookingDocument?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<BookingDocument?> GetByIdAndUserIdAsync(Guid id, Guid userId, CancellationToken cancellationToken = default);
    Task<IEnumerable<BookingDocument>> GetByBookingIdAsync(Guid bookingId, Guid userId, CancellationToken cancellationToken = default);
    Task<IEnumerable<BookingDocument>> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default);
    Task AddAsync(BookingDocument document, CancellationToken cancellationToken = default);
    void Update(BookingDocument document);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
    Task SaveChangesAsync(CancellationToken cancellationToken = default);
}