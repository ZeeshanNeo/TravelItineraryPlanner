using System.Threading.Tasks;

namespace Application.Common.Interfaces;

public interface ICurrencyService
{
    Task<double> GetExchangeRateAsync(string fromCurrency, string toCurrency);
    Task<double> ConvertAsync(double amount, string fromCurrency, string toCurrency);
}
