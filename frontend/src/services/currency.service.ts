import api from './api';

export interface ExchangeRateResponse {
  from: string;
  to: string;
  rate: number;
}

const currencyService = {
  getExchangeRate: async (from: string, to: string): Promise<number> => {
    const response = await api.get<number>(`/tools/currency/rate?from=${from}&to=${to}`);
    return response.data;
  },

  convert: async (amount: number, from: string, to: string): Promise<number> => {
    const response = await api.get<number>(`/tools/currency/convert?amount=${amount}&from=${from}&to=${to}`);
    return response.data;
  },

  getSupportedCurrencies: async (): Promise<string[]> => {
    const response = await api.get<string[]>('/tools/currency/supported');
    return response.data;
  }
};

export default currencyService;
