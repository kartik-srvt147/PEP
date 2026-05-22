import api from './api';

const buildPayload = (products) => ({
  products: products.map((product) => ({
    title: product.title,
    category: product.category,
    sales: product.salesCount ?? product.sales ?? 0,
    stock: product.stock ?? 0,
    revenue: product.revenue ?? 0,
    pricing: product.price ?? product.pricing ?? 0,
  })),
});

const generatePricingInsights = async (products) => {
  const { data } = await api.post('/ai-insights/pricing', buildPayload(products));

  return data;
};

const generateBusinessInsights = async (products) => {
  const { data } = await api.post('/ai-insights/summary', buildPayload(products));

  return data;
};

const generateTrendingInsights = async (products) => {
  const { data } = await api.post('/ai-insights/trending-products', buildPayload(products));

  return data;
};

const generateInventoryAlerts = async (products) => {
  const { data } = await api.post('/ai-insights/inventory-alerts', buildPayload(products));

  return data;
};

const generateImprovementSuggestions = async (products) => {
  const { data } = await api.post('/ai-insights/product-improvements', buildPayload(products));

  return data;
};

export {
  generateBusinessInsights,
  generatePricingInsights,
  generateTrendingInsights,
  generateInventoryAlerts,
  generateImprovementSuggestions,
};
