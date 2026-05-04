using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Application.DTOs.Booking;
using Application.Services;
using Domain.Entities;
using Domain.Interfaces;

namespace Infrastructure.Services;

public class BookingDocumentService : IBookingDocumentService
{
    private readonly IBookingDocumentRepository _documentRepository;
    private readonly IBookingRepository _bookingRepository;
    private readonly IFileStorageService _fileStorageService;

    public BookingDocumentService(
        IBookingDocumentRepository documentRepository,
        IBookingRepository bookingRepository,
        IFileStorageService fileStorageService)
    {
        _documentRepository = documentRepository;
        _bookingRepository = bookingRepository;
        _fileStorageService = fileStorageService;
    }

    public async Task<BookingDocumentResponse> UploadDocumentAsync(Guid bookingId, FileUploadRequest fileRequest, Guid userId, CancellationToken cancellationToken = default)
    {
        // Validate booking exists and belongs to user
        var booking = await _bookingRepository.GetByIdAndUserIdAsync(bookingId, userId, cancellationToken);
        if (booking == null)
            throw new KeyNotFoundException("Booking not found or you don't have permission to access it.");

        // Save file using the file storage service
        var filePath = await _fileStorageService.SaveFileFromBytesAsync(
            fileRequest.Content,
            fileRequest.FileName,
            fileRequest.ContentType,
            fileRequest.FileSize,
            $"bookings/{bookingId}",
            cancellationToken);

        // Create document record
        var document = new BookingDocument
        {
            BookingId = bookingId,
            FileName = fileRequest.FileName,
            FilePath = filePath,
            FileSize = fileRequest.FileSize,
            ContentType = fileRequest.ContentType,
            UploadedAt = DateTime.UtcNow
        };

        await _documentRepository.AddAsync(document, cancellationToken);
        await _documentRepository.SaveChangesAsync(cancellationToken);

        return MapToResponse(document);
    }

    public async Task<IEnumerable<BookingDocumentResponse>> GetDocumentsAsync(Guid bookingId, Guid userId, CancellationToken cancellationToken = default)
    {
        // Validate booking exists and belongs to user
        var booking = await _bookingRepository.GetByIdAndUserIdAsync(bookingId, userId, cancellationToken);
        if (booking == null)
            throw new KeyNotFoundException("Booking not found or you don't have permission to access it.");

        var documents = await _documentRepository.GetByBookingIdAsync(bookingId, userId, cancellationToken);
        return documents.Select(MapToResponse);
    }

    public async Task<BookingDocumentResponse?> GetDocumentAsync(Guid bookingId, Guid documentId, Guid userId, CancellationToken cancellationToken = default)
    {
        // Validate booking exists and belongs to user
        var booking = await _bookingRepository.GetByIdAndUserIdAsync(bookingId, userId, cancellationToken);
        if (booking == null)
            throw new KeyNotFoundException("Booking not found or you don't have permission to access it.");

        var document = await _documentRepository.GetByIdAndUserIdAsync(documentId, userId, cancellationToken);
        if (document == null || document.BookingId != bookingId)
            return null;

        return MapToResponse(document);
    }

    public async Task DeleteDocumentAsync(Guid bookingId, Guid documentId, Guid userId, CancellationToken cancellationToken = default)
    {
        // Validate booking exists and belongs to user
        var booking = await _bookingRepository.GetByIdAndUserIdAsync(bookingId, userId, cancellationToken);
        if (booking == null)
            throw new KeyNotFoundException("Booking not found or you don't have permission to access it.");

        var document = await _documentRepository.GetByIdAndUserIdAsync(documentId, userId, cancellationToken);
        if (document == null || document.BookingId != bookingId)
            throw new KeyNotFoundException("Document not found or doesn't belong to the booking.");

        // Delete file from storage
        await _fileStorageService.DeleteFileAsync(document.FilePath, cancellationToken);

        // Delete document record
        await _documentRepository.DeleteAsync(documentId, cancellationToken);
        await _documentRepository.SaveChangesAsync(cancellationToken);
    }

    public async Task<byte[]> DownloadDocumentAsync(Guid bookingId, Guid documentId, Guid userId, CancellationToken cancellationToken = default)
    {
        // Validate booking exists and belongs to user
        var booking = await _bookingRepository.GetByIdAndUserIdAsync(bookingId, userId, cancellationToken);
        if (booking == null)
            throw new KeyNotFoundException("Booking not found or you don't have permission to access it.");

        var document = await _documentRepository.GetByIdAndUserIdAsync(documentId, userId, cancellationToken);
        if (document == null || document.BookingId != bookingId)
            throw new KeyNotFoundException("Document not found or doesn't belong to the booking.");

        // Get file bytes from storage
        return await _fileStorageService.GetFileAsync(document.FilePath, cancellationToken);
    }

    private static BookingDocumentResponse MapToResponse(BookingDocument document)
    {
        return new BookingDocumentResponse
        {
            Id = document.Id,
            BookingId = document.BookingId,
            FileName = document.FileName,
            FilePath = document.FilePath,
            FileSize = document.FileSize,
            ContentType = document.ContentType,
            UploadedAt = document.UploadedAt,
            DownloadUrl = $"/api/bookings/{document.BookingId}/documents/{document.Id}/download"
        };
    }
}