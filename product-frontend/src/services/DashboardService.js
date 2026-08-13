import axiosClient from './axiosClient';

const BASE_URL = '/dashboard';

const DashboardService = {

  getSummary: () => axiosClient.get(`${BASE_URL}/summary`),

  getAnalytics: () => axiosClient.get(`${BASE_URL}/analytics`),

  getBrandCount: () => axiosClient.get(`${BASE_URL}/charts/brand-count`),

  getBrandAvgPrice: () => axiosClient.get(`${BASE_URL}/charts/brand-avg-price`),

  getPriceRange: () => axiosClient.get(`${BASE_URL}/charts/price-range`),

  getBrandRating: () => axiosClient.get(`${BASE_URL}/charts/brand-rating`),
};

export default DashboardService;
