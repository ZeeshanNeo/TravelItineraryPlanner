using System;
using Domain.Common;

namespace Domain.Entities
{
    public class TravelDocument : BaseEntity
    {
        public Guid TripId { get; private set; }
        public string Title { get; private set; } = null!;
        public TravelDocumentType Type { get; private set; }
        public string FileName { get; private set; } = null!;
        public string FilePath { get; private set; } = null!;
        public string ContentType { get; private set; } = null!;
        public long FileSize { get; private set; }

        // Navigation properties
        public Trip Trip { get; private set; } = null!;

        private TravelDocument() { } // For EF

        public TravelDocument(
            Guid tripId,
            string title,
            TravelDocumentType type,
            string fileName,
            string filePath,
            string contentType,
            long fileSize)
        {
            if (tripId == Guid.Empty) throw new ArgumentException("TripId is required.", nameof(tripId));
            if (string.IsNullOrWhiteSpace(title)) throw new ArgumentException("Title is required.", nameof(title));
            if (string.IsNullOrWhiteSpace(fileName)) throw new ArgumentException("FileName is required.", nameof(fileName));
            if (string.IsNullOrWhiteSpace(filePath)) throw new ArgumentException("FilePath is required.", nameof(filePath));

            Id = Guid.NewGuid();
            TripId = tripId;
            Title = title;
            Type = type;
            FileName = fileName;
            FilePath = filePath;
            ContentType = contentType;
            FileSize = fileSize;
            CreatedAt = DateTime.UtcNow;
            UpdatedAt = DateTime.UtcNow;
        }

        public void UpdateTitle(string title)
        {
            if (string.IsNullOrWhiteSpace(title)) throw new ArgumentException("Title is required.", nameof(title));
            Title = title;
            UpdatedAt = DateTime.UtcNow;
        }

        public void UpdateType(TravelDocumentType type)
        {
            Type = type;
            UpdatedAt = DateTime.UtcNow;
        }
    }
}
