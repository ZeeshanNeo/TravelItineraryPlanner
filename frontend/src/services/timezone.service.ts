import api from './api';

const timezoneService = {
  getLocalTime: async (timeZoneId: string): Promise<string> => {
    const response = await api.get<string>(`/tools/timezone/local?timeZoneId=${encodeURIComponent(timeZoneId)}`);
    return response.data;
  },

  getTimeDifference: async (source: string, destination: string): Promise<string> => {
    const response = await api.get<string>(`/tools/timezone/difference?source=${encodeURIComponent(source)}&destination=${encodeURIComponent(destination)}`);
    return response.data;
  }
};

export default timezoneService;
