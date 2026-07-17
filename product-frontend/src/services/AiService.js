import axios from 'axios';

const BASE = '/api/ai';

const AiService = {
  // Feature 1 — NL → SQL → DB
  queryDatabase: (query) => axios.post(`${BASE}/query`, { query }),

  // Feature 2 — Business Analyst
  getInsights: () => axios.get(`${BASE}/insights`),

  // Feature 3 — Product Consultant
  consult: (message) => axios.post(`${BASE}/consult`, { message }),

  // Feature 4 — Recommendation Engine
  getAllScores: () => axios.get(`${BASE}/scores`),
  getTopByCategory: () => axios.get(`${BASE}/scores/top`),

  // Feature 5 — NL Search
  nlSearch: (q) => axios.get(`${BASE}/search`, { params: { q } }),
};

export default AiService;
