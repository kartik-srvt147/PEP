import api from './api';

const buildQueryString = (params) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, value);
    }
  });

  return searchParams.toString();
};

const getProducts = async (filters = {}) => {
  const queryString = buildQueryString(filters);
  const url = queryString ? `/products?${queryString}` : '/products';
  const { data } = await api.get(url);

  return data;
};

const createProduct = async (product) => {
  const { data } = await api.post('/products', product);

  return data;
};

const updateProduct = async (productId, product) => {
  const { data } = await api.put(`/products/${productId}`, product);

  return data;
};

const deleteProduct = async (productId) => {
  const { data } = await api.delete(`/products/${productId}`);

  return data;
};

export { getProducts, createProduct, updateProduct, deleteProduct };
