using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Application.DTOs.Booking;

namespace Application.Services;

public interface IBookingDocumentService
{
    Task<BookingDocumentResponse> UploadDocumentAsync(Guid bookingId, FileUploadRequest fileRequest, Guid userId, CancellationToken cancellationToken = default);
    Task<IEnumerable<BookingDocumentResponse>> GetDocumentsAsync(Guid bookingId, Guid userId, CancellationToken cancellationToken = default);
    Task<BookingDocumentResponse?> GetDocumentAsync(Guid bookingId, Guid documentId, Guid userId, CancellationToken cancellationToken = default);
    Task DeleteDocumentAsync(Guid bookingId, Guid documentId, Guid userId, CancellationToken cancellationToken = default);
    Task<byte[]> DownloadDocumentAsync(Guid bookingId, Guid documentId, Guid userId, CancellationToken cancellationToken = default);
}