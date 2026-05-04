using System;
using System.IO;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;

namespace Infrastructure.Services;

public interface IFileStorageService
{
    Task<string> SaveFileAsync(IFormFile file, string subdirectory, CancellationToken cancellationToken = default);
    Task<string> SaveFileFromBytesAsync(byte[] fileBytes, string fileName, string contentType, long fileSize, string subdirectory, CancellationToken cancellationToken = default);
    Task<byte[]> GetFileAsync(string filePath, CancellationToken cancellationToken = default);
    Task DeleteFileAsync(string filePath, CancellationToken cancellationToken = default);
    bool FileExists(string filePath);
}

public class FileStorageService : IFileStorageService
{
    private readonly string _baseStoragePath;

    public FileStorageService()
    {
        // Store files in uploads directory (not in wwwroot to separate code and data)
        _baseStoragePath = Path.Combine(Directory.GetCurrentDirectory(), "uploads");
        
        // Ensure the directory exists
        if (!Directory.Exists(_baseStoragePath))
        {
            Directory.CreateDirectory(_baseStoragePath);
        }
    }

    public async Task<string> SaveFileAsync(IFormFile file, string subdirectory, CancellationToken cancellationToken = default)
    {
        if (file == null || file.Length == 0)
            throw new ArgumentException("File is empty or null.");

        // Validate file size (max 10MB as per plan)
        if (file.Length > 10 * 1024 * 1024) // 10MB
            throw new InvalidOperationException("File size exceeds the 10MB limit.");

        // Create subdirectory if it doesn't exist
        var targetDirectory = Path.Combine(_baseStoragePath, subdirectory);
        if (!Directory.Exists(targetDirectory))
        {
            Directory.CreateDirectory(targetDirectory);
        }

        // Generate a unique filename to prevent collisions
        var fileName = $"{Guid.NewGuid()}_{Path.GetFileName(file.FileName)}";
        var filePath = Path.Combine(targetDirectory, fileName);

        // Save the file
        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream, cancellationToken);
        }

        // Return relative path for storage in database
        return Path.Combine("uploads", subdirectory, fileName).Replace('\\', '/');
    }

    public async Task<string> SaveFileFromBytesAsync(byte[] fileBytes, string fileName, string contentType, long fileSize, string subdirectory, CancellationToken cancellationToken = default)
    {
        if (fileBytes == null || fileBytes.Length == 0)
            throw new ArgumentException("File bytes are empty or null.");

        // Validate file size (max 10MB as per plan)
        if (fileSize > 10 * 1024 * 1024) // 10MB
            throw new InvalidOperationException("File size exceeds the 10MB limit.");

        // Create subdirectory if it doesn't exist
        var targetDirectory = Path.Combine(_baseStoragePath, subdirectory);
        if (!Directory.Exists(targetDirectory))
        {
            Directory.CreateDirectory(targetDirectory);
        }

        // Generate a unique filename to prevent collisions
        var uniqueFileName = $"{Guid.NewGuid()}_{Path.GetFileName(fileName)}";
        var filePath = Path.Combine(targetDirectory, uniqueFileName);

        // Save the file
        await File.WriteAllBytesAsync(filePath, fileBytes, cancellationToken);

        // Return relative path for storage in database
        return Path.Combine("uploads", subdirectory, uniqueFileName).Replace('\\', '/');
    }

    public async Task<byte[]> GetFileAsync(string filePath, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrEmpty(filePath))
            throw new ArgumentException("File path is required.");

        var fullPath = Path.Combine(_baseStoragePath, filePath.Replace("uploads/", "").Replace("uploads\\", ""));
        
        if (!File.Exists(fullPath))
            throw new FileNotFoundException($"File not found: {filePath}");

        return await File.ReadAllBytesAsync(fullPath, cancellationToken);
    }

    public async Task DeleteFileAsync(string filePath, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrEmpty(filePath))
            return;

        var fullPath = Path.Combine(_baseStoragePath, filePath.Replace("uploads/", "").Replace("uploads\\", ""));
        
        if (File.Exists(fullPath))
        {
            await Task.Run(() => File.Delete(fullPath), cancellationToken);
        }
    }

    public bool FileExists(string filePath)
    {
        if (string.IsNullOrEmpty(filePath))
            return false;

        var fullPath = Path.Combine(_baseStoragePath, filePath.Replace("uploads/", "").Replace("uploads\\", ""));
        return File.Exists(fullPath);
    }
}