import React, { useState, useEffect } from 'react';
import { RefreshCcw, DollarSign } from 'lucide-react';
import currencyService from '../../../services/currency.service';

const CurrencyConverter: React.FC = () => {
  const [amount, setAmount] = useState<number>(100);
  const [from, setFrom] = useState<string>('USD');
  const [to, setTo] = useState<string>('EUR');
  const [result, setResult] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currencies] = useState(['USD', 'EUR', 'GBP', 'INR', 'JPY', 'CAD', 'AUD']);

  const handleConvert = async () => {
    setIsLoading(true);
    try {
      const converted = await currencyService.convert(amount, from, to);
      setResult(converted);
    } catch (error) {
      console.error('Conversion failed', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    handleConvert();
  }, [from, to]);

  const swapCurrencies = () => {
    const temp = from;
    setFrom(to);
    setTo(temp);
  };

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 border border-slate-200 shadow-xl enterprise-surface">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-200">
          <DollarSign size={20} />
        </div>
        <h3 className="text-lg font-black text-slate-900 tracking-tight uppercase">Currency Intelligence</h3>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Amount</label>
          <input 
            type="number" 
            value={amount} 
            onChange={(e) => setAmount(Number(e.target.value))}
            onBlur={handleConvert}
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
          />
        </div>

        <div className="flex items-end gap-2">
          <div className="flex-1">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">From</label>
            <select 
              value={from} 
              onChange={(e) => setFrom(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            >
              {currencies.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <button 
            onClick={swapCurrencies}
            className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-blue-600 hover:text-white transition-all active:scale-90 mb-0.5"
          >
            <RefreshCcw size={16} />
          </button>

          <div className="flex-1">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">To</label>
            <select 
              value={to} 
              onChange={(e) => setTo(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            >
              {currencies.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div className="pt-6 mt-4 border-t border-slate-100 flex flex-col items-center text-center">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Estimated Result</p>
          {isLoading ? (
            <div className="h-8 w-24 bg-slate-100 animate-pulse rounded-lg"></div>
          ) : (
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-blue-600">{result?.toFixed(2)}</span>
              <span className="text-sm font-black text-slate-400">{to}</span>
            </div>
          )}
          <p className="text-[8px] font-bold text-slate-300 mt-4 uppercase tracking-widest">Powered by Real-time Exchange Rates</p>
        </div>
      </div>
    </div>
  );
};

export default CurrencyConverter;
