using System;
using System.Collections.Generic;

namespace Application.DTOs.TravelDocs
{
    public class PackingListDto
    {
        public Guid Id { get; set; }
        public Guid TripId { get; set; }
        public string Title { get; set; }
        public string Category { get; set; }
        public List<PackingItemDto> Items { get; set; } = new List<PackingItemDto>();
    }

    public class PackingItemDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public int Quantity { get; set; }
        public bool IsPacked { get; set; }
    }

    public class CreatePackingListRequest
    {
        public string Title { get; set; }
        public string Category { get; set; }
    }

    public class AddPackingItemRequest
    {
        public string Name { get; set; }
        public int Quantity { get; set; } = 1;
    }
}
