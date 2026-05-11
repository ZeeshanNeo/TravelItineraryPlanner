using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Application.Common.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ToolsController : ControllerBase
{
    private readonly ICurrencyService _currencyService;
    private readonly ITimeZoneService _timeZoneService;

    public ToolsController(ICurrencyService currencyService, ITimeZoneService timeZoneService)
    {
        _currencyService = currencyService;
        _timeZoneService = timeZoneService;
    }

    [HttpGet("currency/rate")]
    public async Task<ActionResult<double>> GetExchangeRate([FromQuery] string from, [FromQuery] string to)
    {
        var rate = await _currencyService.GetExchangeRateAsync(from, to);
        return Ok(rate);
    }

    [HttpGet("currency/convert")]
    public async Task<ActionResult<double>> ConvertCurrency([FromQuery] double amount, [FromQuery] string from, [FromQuery] string to)
    {
        var result = await _currencyService.ConvertAsync(amount, from, to);
        return Ok(result);
    }

    [HttpGet("currency/supported")]
    public ActionResult<IEnumerable<string>> GetSupportedCurrencies()
    {
        return Ok(new[] { "USD", "EUR", "GBP", "INR", "JPY", "CAD", "AUD" });
    }

    [HttpGet("timezone/local")]
    public ActionResult<DateTime> GetLocalTime([FromQuery] string timeZoneId)
    {
        try
        {
            var localTime = _timeZoneService.GetLocalTime(timeZoneId);
            return Ok(localTime);
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpGet("timezone/difference")]
    public ActionResult<TimeSpan> GetTimeDifference([FromQuery] string source, [FromQuery] string destination)
    {
        try
        {
            var diff = _timeZoneService.GetTimeDifference(source, destination);
            return Ok(diff);
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }
}
