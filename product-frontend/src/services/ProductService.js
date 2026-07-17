import axios from 'axios';

const BASE_URL = '/api/products';

const ProductService = {

  // Get all products (no pagination)
  getAllProducts: () => axios.get(`${BASE_URL}/all`),

  // Get by ID
  getProductById: (id) => axios.get(`${BASE_URL}/${id}`),

  // Create
  createProduct: (product) => axios.post(BASE_URL, product),

  // Update
  updateProduct: (id, product) => axios.put(`${BASE_URL}/${id}`, product),

  // Delete
  deleteProduct: (id) => axios.delete(`${BASE_URL}/${id}`),

  // Paginated + Sorted
  getProductsPaged: (page = 0, size = 5, sortBy = 'id', sortDir = 'asc') =>
    axios.get(BASE_URL, { params: { page, size, sortBy, sortDir } }),

  // Search + Pagination + Sorting
  searchProducts: (keyword, page = 0, size = 5, sortBy = 'id', sortDir = 'asc') =>
    axios.get(`${BASE_URL}/search`, { params: { keyword, page, size, sortBy, sortDir } }),
};

export default ProductService;
