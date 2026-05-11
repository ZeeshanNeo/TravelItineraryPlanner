using Application.Common.Interfaces;
using System;

namespace Infrastructure.Services;

public class TimeZoneService : ITimeZoneService
{
    public DateTime GetLocalTime(string timeZoneId)
    {
        try
        {
            var tzi = TimeZoneInfo.FindSystemTimeZoneById(timeZoneId);
            return TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, tzi);
        }
        catch (TimeZoneNotFoundException)
        {
            return DateTime.Now; // Fallback to system local time
        }
    }

    public TimeSpan GetTimeDifference(string sourceTimeZoneId, string destinationTimeZoneId)
    {
        var sourceTzi = GetTimeZoneInfo(sourceTimeZoneId);
        var destTzi = GetTimeZoneInfo(destinationTimeZoneId);

        var now = DateTime.UtcNow;
        return destTzi.GetUtcOffset(now) - sourceTzi.GetUtcOffset(now);
    }

    public DateTime ConvertTime(DateTime dateTime, string sourceTimeZoneId, string destinationTimeZoneId)
    {
        var sourceTzi = GetTimeZoneInfo(sourceTimeZoneId);
        var destTzi = GetTimeZoneInfo(destinationTimeZoneId);

        return TimeZoneInfo.ConvertTime(dateTime, sourceTzi, destTzi);
    }

    private TimeZoneInfo GetTimeZoneInfo(string id)
    {
        try
        {
            return TimeZoneInfo.FindSystemTimeZoneById(id);
        }
        catch
        {
            return TimeZoneInfo.Local;
        }
    }
}
