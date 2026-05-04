using Domain.Entities;
using System;

namespace Application.DTOs.TravelDocs
{
    public class LocalInfoNoteDto
    {
        public Guid Id { get; set; }
        public Guid TripId { get; set; }
        public string Title { get; set; }
        public LocalInfoCategory Category { get; set; }
        public string Content { get; set; }
    }

    public class CreateLocalInfoNoteRequest
    {
        public string Title { get; set; }
        public LocalInfoCategory Category { get; set; }
        public string Content { get; set; }
    }
}
