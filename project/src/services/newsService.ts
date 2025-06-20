const GNEWS_API_KEY = import.meta.env.VITE_GNEWS_API_KEY;
const GNEWS_BASE_URL = import.meta.env.VITE_GNEWS_BASE_URL || 'https://gnews.io/api/v4';

export interface GNewsArticle {
  title: string;
  description: string;
  content: string;
  url: string;
  image: string;
  publishedAt: string;
  source: {
    name: string;
    url: string;
  };
}

export interface GNewsResponse {
  totalArticles: number;
  articles: GNewsArticle[];
  error?: string;
}

class NewsService {
  private validateConfiguration(): { isValid: boolean; error?: string } {
    // Check GNews API key
    if (!GNEWS_API_KEY) {
      return {
        isValid: false,
        error: 'GNews API key is not configured. Please set VITE_GNEWS_API_KEY in your .env file.'
      };
    }
    
    if (GNEWS_API_KEY === 'your_gnews_api_key_here') {
      return {
        isValid: false,
        error: 'GNews API key is set to placeholder value. Please update VITE_GNEWS_API_KEY in your .env file with your actual API key.'
      };
    }

    return { isValid: true };
  }

  private async makeRequest(endpoint: string, params: Record<string, string>): Promise<GNewsResponse> {
    // Validate configuration first
    const validation = this.validateConfiguration();
    if (!validation.isValid) {
      return {
        totalArticles: 0,
        articles: [],
        error: validation.error
      };
    }

    // Make direct API call to GNews
    return this.makeDirectRequest(endpoint, params);
  }

  private async makeDirectRequest(endpoint: string, params: Record<string, string>): Promise<GNewsResponse> {
    const urlParams = new URLSearchParams({
      ...params,
      token: GNEWS_API_KEY!,
    });

    const apiUrl = `${GNEWS_BASE_URL}${endpoint}?${urlParams}`;

    try {
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'SafeNet.AI/1.0'
        },
      });
      
      if (!response.ok) {
        let errorMessage = `GNews API error (${response.status})`;
        
        if (response.status === 401) {
          errorMessage = 'Invalid GNews API key. Please check your VITE_GNEWS_API_KEY in the .env file.';
        } else if (response.status === 403) {
          errorMessage = 'GNews API access forbidden. Please check your API key permissions.';
        } else if (response.status === 429) {
          errorMessage = 'GNews API rate limit exceeded. Please try again later or upgrade your plan.';
        } else if (response.status === 422) {
          errorMessage = 'Invalid request parameters. Please check your search query.';
        } else if (response.status >= 500) {
          errorMessage = 'GNews service is temporarily unavailable. Please try again later.';
        }
        
        throw new Error(errorMessage);
      }
      
      const data: GNewsResponse = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      return data;
    } catch (error) {
      console.error('Direct GNews API request failed:', error);
      
      let errorMessage = 'Failed to fetch news';
      
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        errorMessage = 'Unable to connect to GNews API. This might be due to CORS restrictions. Please check your internet connection or consider using a CORS proxy.';
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      return {
        totalArticles: 0,
        articles: [],
        error: errorMessage
      };
    }
  }

  // Get safety and crime related news
  async getSafetyNews(limit: number = 20): Promise<GNewsResponse> {
    return this.makeRequest('/search', {
      q: 'safety OR crime OR security OR emergency OR police OR fire OR accident OR "public safety" OR incident OR "law enforcement"',
      lang: 'en',
      country: 'in',
      max: limit.toString(),
      sortby: 'publishedAt'
    });
  }

  // Search news with custom query
  async searchNews(query: string, limit: number = 20): Promise<GNewsResponse> {
    return this.makeRequest('/search', {
      q: query,
      lang: 'en',
      country: 'in',
      max: limit.toString(),
      sortby: 'publishedAt'
    });
  }

  // Get top headlines
  async getTopHeadlines(limit: number = 20): Promise<GNewsResponse> {
    return this.makeRequest('/top-headlines', {
      lang: 'en',
      country: 'in',
      max: limit.toString(),
      category: 'general'
    });
  }

  // Get news by category
  async getNewsByCategory(category: string, limit: number = 20): Promise<GNewsResponse> {
    const categoryQueries: Record<string, string> = {
      'law-enforcement': 'police OR "law enforcement" OR arrest OR investigation OR "crime prevention"',
      'traffic': 'traffic OR accident OR "road safety" OR collision OR "traffic jam"',
      'emergency-services': 'ambulance OR hospital OR "emergency services" OR rescue OR "first responders"',
      'fire-safety': 'fire OR firefighters OR "fire department" OR explosion OR "fire safety"',
      'crime': 'crime OR theft OR robbery OR violence OR murder OR "criminal activity"',
      'security': 'security OR surveillance OR "public safety" OR threat OR "homeland security"'
    };

    const query = categoryQueries[category] || category;
    return this.makeRequest('/search', {
      q: query,
      lang: 'en',
      country: 'in',
      max: limit.toString(),
      sortby: 'publishedAt'
    });
  }

  // Test API connection
  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const validation = this.validateConfiguration();
      if (!validation.isValid) {
        return { success: false, message: validation.error! };
      }

      const result = await this.makeRequest('/search', {
        q: 'test',
        lang: 'en',
        country: 'in',
        max: '1',
        sortby: 'publishedAt'
      });

      if (result.error) {
        return { success: false, message: result.error };
      }

      return { success: true, message: 'GNews API connection successful' };
    } catch (error) {
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }
}

export const newsService = new NewsService();