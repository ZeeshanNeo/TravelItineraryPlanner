using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Application.Common.Models;
using Application.DTOs.Booking;
using Application.Services;
using Domain.Entities;
using Domain.Interfaces;
using Mapster;

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

    public async Task<Result<BookingDocumentResponse>> UploadDocumentAsync(Guid bookingId, FileUploadRequest fileRequest, Guid userId, CancellationToken cancellationToken = default)
    {
        var booking = await _bookingRepository.GetByIdAndUserIdAsync(bookingId, userId, cancellationToken);
        if (booking == null)
            return Result<BookingDocumentResponse>.Failure("Booking not found or you don't have permission to access it.");

        var filePath = await _fileStorageService.SaveFileFromBytesAsync(
            fileRequest.Content,
            fileRequest.FileName,
            fileRequest.ContentType,
            fileRequest.FileSize,
            $"bookings/{bookingId}",
            cancellationToken);

        try
        {
            var document = new BookingDocument(
                bookingId,
                fileRequest.FileName,
                filePath,
                fileRequest.FileSize,
                fileRequest.ContentType
            );

            await _documentRepository.AddAsync(document, cancellationToken);
            await _documentRepository.SaveChangesAsync(cancellationToken);

            var response = document.Adapt<BookingDocumentResponse>();
            response.DownloadUrl = $"/api/bookings/{bookingId}/documents/{document.Id}/download";
            return Result<BookingDocumentResponse>.Success(response);
        }
        catch (ArgumentException ex)
        {
            await _fileStorageService.DeleteFileAsync(filePath, cancellationToken);
            return Result<BookingDocumentResponse>.Failure(ex.Message);
        }
    }

    public async Task<Result<IEnumerable<BookingDocumentResponse>>> GetDocumentsAsync(Guid bookingId, Guid userId, CancellationToken cancellationToken = default)
    {
        var booking = await _bookingRepository.GetByIdAndUserIdAsync(bookingId, userId, cancellationToken);
        if (booking == null)
            return Result<IEnumerable<BookingDocumentResponse>>.Failure("Booking not found or you don't have permission to access it.");

        var documents = await _documentRepository.GetByBookingIdAsync(bookingId, userId, cancellationToken);
        return Result<IEnumerable<BookingDocumentResponse>>.Success(documents.Select(d => 
        {
            var response = d.Adapt<BookingDocumentResponse>();
            response.DownloadUrl = $"/api/bookings/{bookingId}/documents/{d.Id}/download";
            return response;
        }));
    }

    public async Task<Result<BookingDocumentResponse>> GetDocumentAsync(Guid bookingId, Guid documentId, Guid userId, CancellationToken cancellationToken = default)
    {
        var booking = await _bookingRepository.GetByIdAndUserIdAsync(bookingId, userId, cancellationToken);
        if (booking == null)
            return Result<BookingDocumentResponse>.Failure("Booking not found or you don't have permission to access it.");

        var document = await _documentRepository.GetByIdAndUserIdAsync(documentId, userId, cancellationToken);
        if (document == null || document.BookingId != bookingId)
            return Result<BookingDocumentResponse>.Failure("Document not found or doesn't belong to the booking.");

        var response = document.Adapt<BookingDocumentResponse>();
        response.DownloadUrl = $"/api/bookings/{bookingId}/documents/{document.Id}/download";
        return Result<BookingDocumentResponse>.Success(response);
    }

    public async Task<Result> DeleteDocumentAsync(Guid bookingId, Guid documentId, Guid userId, CancellationToken cancellationToken = default)
    {
        var booking = await _bookingRepository.GetByIdAndUserIdAsync(bookingId, userId, cancellationToken);
        if (booking == null)
            return Result.Failure("Booking not found or you don't have permission to access it.");

        var document = await _documentRepository.GetByIdAndUserIdAsync(documentId, userId, cancellationToken);
        if (document == null || document.BookingId != bookingId)
            return Result.Failure("Document not found or doesn't belong to the booking.");

        await _fileStorageService.DeleteFileAsync(document.FilePath, cancellationToken);
        await _documentRepository.DeleteAsync(documentId, cancellationToken);
        await _documentRepository.SaveChangesAsync(cancellationToken);
        
        return Result.Success();
    }

    public async Task<Result<byte[]>> DownloadDocumentAsync(Guid bookingId, Guid documentId, Guid userId, CancellationToken cancellationToken = default)
    {
        var booking = await _bookingRepository.GetByIdAndUserIdAsync(bookingId, userId, cancellationToken);
        if (booking == null)
            return Result<byte[]>.Failure("Booking not found or you don't have permission to access it.");

        var document = await _documentRepository.GetByIdAndUserIdAsync(documentId, userId, cancellationToken);
        if (document == null || document.BookingId != bookingId)
            return Result<byte[]>.Failure("Document not found or doesn't belong to the booking.");

        var fileBytes = await _fileStorageService.GetFileAsync(document.FilePath, cancellationToken);
        return Result<byte[]>.Success(fileBytes);
    }
}