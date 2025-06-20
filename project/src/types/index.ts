export interface Location {
  lat: number;
  lng: number;
  address?: string;
}

export interface AIAnalysis {
  severity: 'low' | 'medium' | 'high';
  confidence: number;
  tags: string[];
  threatLevel: number;
}

export interface Incident {
  id: string;
  title: string;
  description: string;
  location: Location;
  timestamp: string;
  images?: string[];
  type: 'crime' | 'emergency' | 'suspicious' | 'traffic' | 'fire' | 'medical';
  status: 'pending' | 'verified' | 'resolved' | 'dismissed';
  reporter: 'citizen' | 'authority' | 'system';
  aiAnalysis: AIAnalysis;
}

export interface NewsItem {
  id: string;
  title: string;
  description: string;
  source: string;
  timestamp: string;
  location?: Location;
  category: string;
  url: string;
  aiAnalysis: AIAnalysis;
}

export interface AppContextType {
  incidents: Incident[];
  news: NewsItem[];
  loading: boolean;
  newsLoading?: boolean;
  newsError?: string | null;
  addIncident: (incident: Omit<Incident, 'id' | 'timestamp' | 'aiAnalysis'>, reporterContact?: string, images?: File[]) => Promise<Incident>;
  updateIncidentStatus?: (id: string, status: Incident['status']) => Promise<void>;
  setLoading: (loading: boolean) => void;
  fetchSafetyNews?: () => Promise<void>;
  searchNews?: (query: string) => Promise<void>;
  fetchNewsByCategory?: (category: string) => Promise<void>;
  refreshIncidents?: () => Promise<void>;
}