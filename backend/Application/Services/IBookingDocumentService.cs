using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Application.Common.Models;
using Application.DTOs.Booking;

namespace Application.Services;

public interface IBookingDocumentService
{
    Task<Result<BookingDocumentResponse>> UploadDocumentAsync(Guid bookingId, FileUploadRequest fileRequest, Guid userId, CancellationToken cancellationToken = default);
    Task<Result<IEnumerable<BookingDocumentResponse>>> GetDocumentsAsync(Guid bookingId, Guid userId, CancellationToken cancellationToken = default);
    Task<Result<BookingDocumentResponse>> GetDocumentAsync(Guid bookingId, Guid documentId, Guid userId, CancellationToken cancellationToken = default);
    Task<Result> DeleteDocumentAsync(Guid bookingId, Guid documentId, Guid userId, CancellationToken cancellationToken = default);
    Task<Result<byte[]>> DownloadDocumentAsync(Guid bookingId, Guid documentId, Guid userId, CancellationToken cancellationToken = default);
}