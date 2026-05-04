using Domain.Entities;
using System;

namespace Application.DTOs.TravelDocs
{
    public class TravelDocumentDto
    {
        public Guid Id { get; set; }
        public Guid TripId { get; set; }
        public string Title { get; set; }
        public TravelDocumentType Type { get; set; }
        public string FileName { get; set; }
        public long FileSize { get; set; }
        public DateTime UploadDate { get; set; }
    }

    public class UploadTravelDocumentRequest
    {
        public string Title { get; set; }
        public TravelDocumentType Type { get; set; }
    }
}
