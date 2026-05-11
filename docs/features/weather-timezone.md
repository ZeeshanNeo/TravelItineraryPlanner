# Module: Weather & Timezone Intelligence

## Overview
A utility module providing context-aware travel intelligence by integrating weather forecasts and timezone calculations directly into the itinerary and booking workflows.

## Key Performance Indicators (KPIs)
- **Weather Forecasts**: Destination-specific forecasts integrated into the daily itinerary.
- **Timezone Awareness**: Automatic conversion between UTC and local time for all travel events.
- **Dynamic Offsets**: Calculation of time differences to help travelers prepare for jet lag.

## 🏗️ Technical Architecture

### Backend Services
- **`IWeatherService`**: Interface for fetching meteorological data.
    - `WeatherService`: Currently implements a robust mock logic based on destination hash for consistent testing. Extensible for OpenWeatherMap integration.
- **`ITimeZoneService`**: Handles complex date/time math across international boundaries.
    - `TimeZoneService`: Uses .NET `TimeZoneInfo` for high-precision local time conversions.

### Frontend Integration
- **`itinerary.service.ts`**: Provides the `getItineraryWeather` method to fetch data for specific itinerary days.
- **`ItineraryDetail.tsx`**: Consumes weather data to display temperature, conditions, and icons alongside the daily timeline.
- **Form Integration**: `BookingForm.tsx` and `PlanTrip.tsx` include timezone selectors to ensure accurate scheduling.

## 🗄️ Domain Integration
Timezone data is persisted directly on the `Trip` and `Booking` entities:
- `Trip.TimeZone`: The primary timezone for the destination.
- `Booking.TimeZone`: Specific timezone for the booking (e.g., departure vs arrival).

## 🔌 API Endpoints
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/itineraries/{id}/weather?date={date}` | Get forecast for a specific trip day |
| `GET` | `/api/tools/timezones` | List supported IANA timezones |

## 🧪 Testing Strategy
- **Service Tests**: `ItineraryServiceTests.cs` mocks `IWeatherService` to verify integration logic.
- **Frontend Tests**: `itinerary.service.test.ts` validates the API consumption and error handling for weather data.
