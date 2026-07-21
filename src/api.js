import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;

// Auth
export const register = (data) => api.post('/auth/register', data);
export const login = (data) => api.post('/auth/login', data);
export const getMe = () => api.get('/auth/me');

// Products
export const getProducts = (params) => api.get('/products/', { params });
export const getProduct = (id) => api.get(`/products/${id}`);
export const createProduct = (data) => api.post('/products/', data);
export const updateProduct = (id, data) => api.put(`/products/${id}`, data);
export const deleteProduct = (id) => api.delete(`/products/${id}`);
export const uploadImage = (formData) => api.post('/products/upload', formData, {
  headers: { 'Content-Type': 'multipart/form-data' },
});

// Cart
export const getCart = () => api.get('/cart/');
export const addToCart = (data) => api.post('/cart/add', data);
export const updateCartItem = (id, quantity) => api.put(`/cart/update/${id}?quantity=${quantity}`);
export const removeFromCart = (id) => api.delete(`/cart/remove/${id}`);

// Wishlist
export const getWishlist = () => api.get('/wishlist/');
export const addToWishlist = (data) => api.post('/wishlist/add', data);
export const removeFromWishlist = (productId) => api.delete(`/wishlist/remove/${productId}`);

// Orders
export const placeOrder = (data) => api.post('/orders/place', data);
export const placeDirectOrder = (params) => api.post('/orders/place-direct', null, { params });
export const getOrders = () => api.get('/orders/');

// Admin
export const getAdminOrders = (status) => api.get('/admin/orders', { params: { status } });
export const updateOrderStatus = (id, status) => api.put(`/admin/orders/${id}/status`, { order_status: status });
export const getAdminUsers = () => api.get('/admin/users');
export const getAdminStats = () => api.get('/admin/stats');

// Categories
export const getCategories = () => api.get('/categories/');
export const getAllCategories = () => api.get('/categories/all');
export const createCategory = (data) => api.post('/categories/', data);
export const updateCategory = (id, data) => api.put(`/categories/${id}`, data);
export const deleteCategory = (id) => api.delete(`/categories/${id}`);
