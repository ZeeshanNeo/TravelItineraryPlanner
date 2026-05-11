using Application.Common.Interfaces;
using Microsoft.Extensions.Logging;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Infrastructure.Services;

public class CurrencyService : ICurrencyService
{
    private readonly ILogger<CurrencyService> _logger;
    private readonly Dictionary<string, double> _mockRates = new()
    {
        { "USD_EUR", 0.92 },
        { "EUR_USD", 1.09 },
        { "USD_GBP", 0.79 },
        { "GBP_USD", 1.27 },
        { "USD_INR", 83.35 },
        { "INR_USD", 0.012 }
    };

    public CurrencyService(ILogger<CurrencyService> logger)
    {
        _logger = logger;
    }

    public async Task<double> GetExchangeRateAsync(string fromCurrency, string toCurrency)
    {
        if (fromCurrency == toCurrency) return 1.0;

        var key = $"{fromCurrency}_{toCurrency}";
        if (_mockRates.TryGetValue(key, out var rate))
        {
            return await Task.FromResult(rate);
        }

        _logger.LogWarning("Exchange rate not found for {Key}. Returning default 1.0", key);
        return await Task.FromResult(1.0);
    }

    public async Task<double> ConvertAsync(double amount, string fromCurrency, string toCurrency)
    {
        var rate = await GetExchangeRateAsync(fromCurrency, toCurrency);
        return amount * rate;
    }
}
