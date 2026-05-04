namespace Application.DTOs.Booking;

public class BookingSummaryResponse
{
    public int TotalBookings { get; set; }
    public int ConfirmedCount { get; set; }
    public int PendingCount { get; set; }
    public decimal TotalCost { get; set; }
}
