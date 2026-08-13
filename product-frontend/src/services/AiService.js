import axiosClient from './axiosClient';

const BASE = '/ai';

const AiService = {
  // Feature 1 — NL → SQL → DB
  queryDatabase: (query) => axiosClient.post(`${BASE}/query`, { query }),

  // Feature 2 — Business Analyst
  getInsights: () => axiosClient.get(`${BASE}/insights`),

  // Feature 3 — Product Consultant
  consult: (message) => axiosClient.post(`${BASE}/consult`, { message }),

  // Feature 4 — Recommendation Engine
  getAllScores: () => axiosClient.get(`${BASE}/scores`),
  getTopByCategory: () => axiosClient.get(`${BASE}/scores/top`),

  // Feature 5 — NL Search
  nlSearch: (q) => axiosClient.get(`${BASE}/search`, { params: { q } }),
};

export default AiService;
