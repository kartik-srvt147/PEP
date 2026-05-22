import api from './api';

const getAnalyticsDashboard = async (params = {}) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, value);
    }
  });

  const queryString = searchParams.toString();
  const { data } = await api.get(`/analytics/dashboard${queryString ? `?${queryString}` : ''}`);

  return data;
};

export { getAnalyticsDashboard };
