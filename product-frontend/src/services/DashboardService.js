import axios from 'axios';

const BASE_URL = '/api/dashboard';

const DashboardService = {

  getSummary: () => axios.get(`${BASE_URL}/summary`),

  getAnalytics: () => axios.get(`${BASE_URL}/analytics`),

  getBrandCount: () => axios.get(`${BASE_URL}/charts/brand-count`),

  getBrandAvgPrice: () => axios.get(`${BASE_URL}/charts/brand-avg-price`),

  getPriceRange: () => axios.get(`${BASE_URL}/charts/price-range`),

  getBrandRating: () => axios.get(`${BASE_URL}/charts/brand-rating`),
};

export default DashboardService;
