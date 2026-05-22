import api from './api';

const generateDescription = async (payload) => {
  const { data } = await api.post('/ai/description', payload);

  return data;
};

const generateSeoTags = async (payload) => {
  const { data } = await api.post('/ai/tags', payload);

  return data;
};

const generateMarketingCaptions = async (payload) => {
  const { data } = await api.post('/ai/captions', payload);

  return data;
};

export { generateDescription, generateSeoTags, generateMarketingCaptions };
