using System;

namespace Domain.Entities
{
    public class TravelDocument
    {
        public Guid Id { get; set; }
        public Guid TripId { get; set; }
        public string Title { get; set; }
        public TravelDocumentType Type { get; set; }
        public string FileName { get; set; }
        public string FilePath { get; set; }
        public string ContentType { get; set; }
        public long FileSize { get; set; }
        public DateTime UploadDate { get; set; }

        // Navigation properties
        public Trip Trip { get; set; }
    }
}
