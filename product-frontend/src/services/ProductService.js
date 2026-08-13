import axiosClient from './axiosClient';

const BASE_URL = '/products';

const ProductService = {

  // Get all products (no pagination)
  getAllProducts: () => axiosClient.get(`${BASE_URL}/all`),

  // Get by ID
  getProductById: (id) => axiosClient.get(`${BASE_URL}/${id}`),

  // Create
  createProduct: (product) => axiosClient.post(BASE_URL, product),

  // Update
  updateProduct: (id, product) => axiosClient.put(`${BASE_URL}/${id}`, product),

  // Delete
  deleteProduct: (id) => axiosClient.delete(`${BASE_URL}/${id}`),

  // Upload image (multipart)
  uploadImage: (id, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return axiosClient.post(`${BASE_URL}/${id}/image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // Paginated + Sorted
  getProductsPaged: (page = 0, size = 5, sortBy = 'id', sortDir = 'asc') =>
    axiosClient.get(BASE_URL, { params: { page, size, sortBy, sortDir } }),

  // Search + Pagination + Sorting
  searchProducts: (keyword, page = 0, size = 5, sortBy = 'id', sortDir = 'asc') =>
    axiosClient.get(`${BASE_URL}/search`, { params: { keyword, page, size, sortBy, sortDir } }),
};

export default ProductService;
