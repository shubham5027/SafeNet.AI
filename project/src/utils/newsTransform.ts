import { NewsItem, AIAnalysis } from '../types';
import { GNewsArticle } from '../services/newsService';

// AI analysis simulation - in production, this would call actual AI services
const simulateAIAnalysis = (article: GNewsArticle): AIAnalysis => {
  const title = article.title.toLowerCase();
  const description = article.description.toLowerCase();
  const content = `${title} ${description}`;

  // Simulate severity based on keywords
  let severity: 'low' | 'medium' | 'high' = 'low';
  let threatLevel = 1;

  const highRiskKeywords = ['murder', 'terrorist', 'explosion', 'shooting', 'attack', 'violence', 'emergency', 'critical'];
  const mediumRiskKeywords = ['accident', 'fire', 'theft', 'robbery', 'crime', 'arrest', 'investigation'];
  const lowRiskKeywords = ['safety', 'awareness', 'prevention', 'community', 'initiative'];

  if (highRiskKeywords.some(keyword => content.includes(keyword))) {
    severity = 'high';
    threatLevel = Math.floor(Math.random() * 3) + 8; // 8-10
  } else if (mediumRiskKeywords.some(keyword => content.includes(keyword))) {
    severity = 'medium';
    threatLevel = Math.floor(Math.random() * 3) + 5; // 5-7
  } else {
    severity = 'low';
    threatLevel = Math.floor(Math.random() * 4) + 1; // 1-4
  }

  // Generate tags based on content
  const tags: string[] = [];
  if (content.includes('police') || content.includes('law enforcement')) tags.push('law-enforcement');
  if (content.includes('traffic') || content.includes('accident')) tags.push('traffic');
  if (content.includes('fire')) tags.push('fire-safety');
  if (content.includes('crime') || content.includes('theft')) tags.push('crime');
  if (content.includes('emergency')) tags.push('emergency');
  if (content.includes('safety')) tags.push('public-safety');

  return {
    severity,
    confidence: Math.random() * 0.3 + 0.7, // 0.7-1.0
    tags: tags.length > 0 ? tags : ['general'],
    threatLevel
  };
};

const categorizeNews = (article: GNewsArticle): string => {
  const content = `${article.title} ${article.description}`.toLowerCase();
  
  if (content.includes('police') || content.includes('law enforcement') || content.includes('arrest')) {
    return 'law-enforcement';
  } else if (content.includes('traffic') || content.includes('accident') || content.includes('road')) {
    return 'traffic';
  } else if (content.includes('ambulance') || content.includes('hospital') || content.includes('emergency')) {
    return 'emergency-services';
  } else if (content.includes('fire') || content.includes('firefighter')) {
    return 'fire-safety';
  } else if (content.includes('crime') || content.includes('theft') || content.includes('robbery')) {
    return 'crime';
  } else {
    return 'general';
  }
};

const extractLocation = (article: GNewsArticle) => {
  // Simple location extraction - in production, use NER services
  const content = `${article.title} ${article.description}`;
  const locationPatterns = [
    /Mumbai/i, /Delhi/i, /Bangalore/i, /Chennai/i, /Kolkata/i, /Hyderabad/i,
    /Pune/i, /Ahmedabad/i, /Jaipur/i, /Lucknow/i
  ];

  for (const pattern of locationPatterns) {
    const match = content.match(pattern);
    if (match) {
      return {
        lat: 19.0760 + (Math.random() - 0.5) * 0.1, // Mock coordinates around Mumbai
        lng: 72.8777 + (Math.random() - 0.5) * 0.1,
        address: match[0]
      };
    }
  }

  return undefined;
};

export const transformGNewsToNewsItem = (article: GNewsArticle): NewsItem => {
  return {
    id: `gnews-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    title: article.title,
    description: article.description || article.content?.substring(0, 200) + '...' || '',
    source: article.source.name,
    timestamp: article.publishedAt,
    location: extractLocation(article),
    category: categorizeNews(article),
    url: article.url,
    aiAnalysis: simulateAIAnalysis(article)
  };
};