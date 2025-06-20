import React, { createContext, useContext, useState, useEffect } from 'react';
import { Incident, NewsItem, AppContextType } from '../types';
import { newsService } from '../services/newsService';
import { incidentService } from '../services/incidentService';
import { transformGNewsToNewsItem } from '../utils/newsTransform';

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [newsLoading, setNewsLoading] = useState(true);
  const [newsError, setNewsError] = useState<string | null>(null);

  // Fetch incidents and news on component mount
  useEffect(() => {
    fetchIncidents();
    fetchSafetyNews();
  }, []);

  const fetchIncidents = async () => {
    try {
      setLoading(true);
      const fetchedIncidents = await incidentService.getIncidents();
      setIncidents(fetchedIncidents);
    } catch (error) {
      console.error('Failed to fetch incidents:', error);
      
      // Keep existing incidents on error to maintain UI functionality
      if (incidents.length === 0) {
        // If no incidents exist, this might be first load failure
        console.warn('No incidents loaded, this might be a first-time load issue');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchSafetyNews = async () => {
    setNewsLoading(true);
    setNewsError(null);
    
    try {
      const response = await newsService.getSafetyNews(50);
      
      // Check if there's an error in the response
      if (response.error) {
        console.warn('News service warning:', response.error);
        setNewsError(response.error);
        setNews([]); // Set empty news array
        return;
      }
      
      const transformedNews = response.articles.map(transformGNewsToNewsItem);
      setNews(transformedNews);
    } catch (error) {
      console.error('Failed to fetch news:', error);
      
      let errorMessage = 'News service is temporarily unavailable. Please try again later.';
      
      if (error instanceof Error) {
        if (error.message.includes('configuration') || error.message.includes('placeholder')) {
          errorMessage = error.message;
        } else if (error.message.includes('Failed to fetch')) {
          errorMessage = 'Unable to connect to news service. Please check your internet connection and API configuration.';
        }
      }
      
      setNewsError(errorMessage);
      setNews([]);
    } finally {
      setNewsLoading(false);
    }
  };

  const searchNews = async (query: string) => {
    setNewsLoading(true);
    setNewsError(null);
    
    try {
      const response = await newsService.searchNews(query, 30);
      
      // Check if there's an error in the response
      if (response.error) {
        console.warn('News search warning:', response.error);
        setNewsError(response.error);
        setNews([]);
        return;
      }
      
      const transformedNews = response.articles.map(transformGNewsToNewsItem);
      setNews(transformedNews);
    } catch (error) {
      console.error('Failed to search news:', error);
      
      let errorMessage = 'Failed to search news. Please try again.';
      
      if (error instanceof Error && (error.message.includes('configuration') || error.message.includes('placeholder'))) {
        errorMessage = error.message;
      }
      
      setNewsError(errorMessage);
      setNews([]);
    } finally {
      setNewsLoading(false);
    }
  };

  const fetchNewsByCategory = async (category: string) => {
    setNewsLoading(true);
    setNewsError(null);
    
    try {
      const response = await newsService.getNewsByCategory(category, 30);
      
      // Check if there's an error in the response
      if (response.error) {
        console.warn('News category warning:', response.error);
        setNewsError(response.error);
        setNews([]);
        return;
      }
      
      const transformedNews = response.articles.map(transformGNewsToNewsItem);
      setNews(transformedNews);
    } catch (error) {
      console.error('Failed to fetch news by category:', error);
      
      let errorMessage = 'Failed to load category news. Please try again.';
      
      if (error instanceof Error && (error.message.includes('configuration') || error.message.includes('placeholder'))) {
        errorMessage = error.message;
      }
      
      setNewsError(errorMessage);
      setNews([]);
    } finally {
      setNewsLoading(false);
    }
  };

  const addIncident = async (
    incident: Omit<Incident, 'id' | 'timestamp' | 'aiAnalysis'>, 
    reporterContact?: string,
    images?: File[]
  ): Promise<Incident> => {
    try {
      setLoading(true);
      
      // Create incident in local storage
      const newIncident = await incidentService.createIncident(incident, reporterContact);
      
      // Upload images if provided
      if (images && images.length > 0) {
        const imageUrls = await incidentService.uploadIncidentImages(newIncident.id, images);
        newIncident.images = imageUrls;
      }
      
      // Update local state
      setIncidents(prev => [newIncident, ...prev]);
      
      return newIncident;
    } catch (error) {
      console.error('Failed to create incident:', error);
      
      let errorMessage = 'Failed to submit incident. Please try again.';
      
      if (error instanceof Error) {
        if (error.message.includes('configuration') || error.message.includes('placeholder')) {
          errorMessage = error.message;
        } else if (error.message.includes('connect')) {
          errorMessage = 'Unable to save incident. Please check your browser settings allow local storage.';
        }
      }
      
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateIncidentStatus = async (id: string, status: Incident['status']) => {
    try {
      await incidentService.updateIncidentStatus(id, status);
      
      // Update local state
      setIncidents(prev => 
        prev.map(incident => 
          incident.id === id ? { ...incident, status } : incident
        )
      );
    } catch (error) {
      console.error('Failed to update incident status:', error);
      
      let errorMessage = 'Failed to update incident status.';
      
      if (error instanceof Error && (error.message.includes('configuration') || error.message.includes('placeholder'))) {
        errorMessage = error.message;
      }
      
      throw new Error(errorMessage);
    }
  };

  const value = {
    incidents,
    news,
    loading,
    newsLoading,
    newsError,
    addIncident,
    updateIncidentStatus,
    setLoading,
    fetchSafetyNews,
    searchNews,
    fetchNewsByCategory,
    refreshIncidents: fetchIncidents
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}