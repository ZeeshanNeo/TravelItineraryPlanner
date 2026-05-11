using System;

namespace Application.Common.Interfaces;

public interface ITimeZoneService
{
    DateTime GetLocalTime(string timeZoneId);
    TimeSpan GetTimeDifference(string sourceTimeZoneId, string destinationTimeZoneId);
    DateTime ConvertTime(DateTime dateTime, string sourceTimeZoneId, string destinationTimeZoneId);
}
