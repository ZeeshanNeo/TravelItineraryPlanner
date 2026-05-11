using System;
using Application.DTOs.Trip;
using Domain.Entities;
using Mapster;

namespace Application.Common.Mappings;

public static class MappingConfig
{
    public static void Configure()
    {
        TypeAdapterConfig<Trip, TripResponse>.NewConfig()
            .Map(dest => dest.TravelType, src => src.TravelType.ToString())
            .Map(dest => dest.TravelCompanions, src => src.TravelCompanions != null 
                ? System.Text.Json.JsonSerializer.Deserialize<System.Collections.Generic.List<string>>(src.TravelCompanions.RootElement.GetRawText(), (System.Text.Json.JsonSerializerOptions?)null) 
                : null);
    }
}
