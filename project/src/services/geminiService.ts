import axios from 'axios';

const API_URL = 'http://localhost:5000/api/gemini';

export async function fetchGeminiInsights(incidents: any[], news: any[]) {
  const response = await axios.post(API_URL, { incidents, news });
  return response.data;
} 