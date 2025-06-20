import { LocalStorage } from '../lib/storage';
import { Incident } from '../types';
import axios from 'axios';

const BACKEND_URL = 'http://localhost:5000/api/reports';
const UPLOAD_URL = 'http://localhost:5000/api/reports/upload';

export class IncidentService {
  // Generate unique ID
  private generateId(): string {
    return `incident_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Simulate AI analysis
  private generateAIAnalysis(incident: Omit<Incident, 'id' | 'timestamp' | 'aiAnalysis'>): Incident['aiAnalysis'] {
    const content = `${incident.title} ${incident.description}`.toLowerCase();
    
    // Determine severity based on keywords and type
    let severity: 'low' | 'medium' | 'high' = 'low';
    let threatLevel = 1;

    const highRiskKeywords = ['murder', 'explosion', 'shooting', 'attack', 'fire', 'emergency'];
    const mediumRiskKeywords = ['accident', 'theft', 'robbery', 'suspicious', 'crime'];

    if (incident.type === 'emergency' || incident.type === 'fire' || incident.type === 'medical') {
      severity = 'high';
      threatLevel = Math.floor(Math.random() * 3) + 8; // 8-10
    } else if (highRiskKeywords.some(keyword => content.includes(keyword))) {
      severity = 'high';
      threatLevel = Math.floor(Math.random() * 3) + 8; // 8-10
    } else if (incident.type === 'crime' || mediumRiskKeywords.some(keyword => content.includes(keyword))) {
      severity = 'medium';
      threatLevel = Math.floor(Math.random() * 3) + 5; // 5-7
    } else {
      severity = 'low';
      threatLevel = Math.floor(Math.random() * 4) + 1; // 1-4
    }

    // Generate tags based on content
    const tags: string[] = [];
    if (content.includes('school')) tags.push('school-safety');
    if (content.includes('traffic') || incident.type === 'traffic') tags.push('traffic');
    if (content.includes('fire') || incident.type === 'fire') tags.push('fire-emergency');
    if (content.includes('medical') || incident.type === 'medical') tags.push('medical-emergency');
    if (content.includes('crime') || incident.type === 'crime') tags.push('crime');
    if (content.includes('suspicious') || incident.type === 'suspicious') tags.push('suspicious-activity');
    if (tags.length === 0) tags.push('general');

    return {
      severity,
      confidence: Math.random() * 0.3 + 0.7, // 0.7-1.0
      tags,
      threatLevel
    };
  }

  // Fetch all incidents (try backend first)
  async getIncidents(): Promise<Incident[]> {
    try {
      const response = await axios.get(BACKEND_URL);
      // Map backend data to Incident type if needed
      return response.data.map((item: any) => ({
        ...item,
        id: item._id || item.id,
        timestamp: item.date || item.timestamp || new Date().toISOString(),
        aiAnalysis: item.aiAnalysis || { severity: 'low', confidence: 1, tags: [], threatLevel: 1 },
        images: item.images || []
      }));
    } catch (error) {
      // Fallback to empty array if backend fails
      return [];
    }
  }

  // Upload incident images to backend
  async uploadIncidentImages(incidentId: string, files: File[]): Promise<string[]> {
    const formData = new FormData();
    files.forEach(file => formData.append('images', file));
    const response = await axios.post(UPLOAD_URL, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data.urls;
  }

  // Create new incident (send to backend, with images)
  async createIncident(incident: Omit<Incident, 'id' | 'timestamp' | 'aiAnalysis'>, reporterContact?: string, images?: File[]): Promise<Incident> {
    try {
      let imageUrls: string[] = [];
      if (images && images.length > 0) {
        imageUrls = await this.uploadIncidentImages('', images);
      }
      const payload = { ...incident, reporterContact, images: imageUrls };
      const response = await axios.post(BACKEND_URL, payload);
      // Map backend data to Incident type if needed
      return {
        ...response.data,
        id: response.data._id || response.data.id,
        timestamp: response.data.date || response.data.timestamp || new Date().toISOString(),
        aiAnalysis: response.data.aiAnalysis || { severity: 'low', confidence: 1, tags: [], threatLevel: 1 },
        images: response.data.images || []
      };
    } catch (error) {
      // Fallback to local storage
      const newIncident: Incident = {
        ...incident,
        id: this.generateId(),
        timestamp: new Date().toISOString(),
        aiAnalysis: this.generateAIAnalysis(incident),
        images: []
      };
      LocalStorage.addIncident(newIncident);
      return newIncident;
    }
  }

  // Update incident status
  async updateIncidentStatus(id: string, status: Incident['status']): Promise<void> {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 100));

      const updated = LocalStorage.updateIncident(id, { 
        status, 
        updated_at: new Date().toISOString() 
      });

      if (!updated) {
        throw new Error('Incident not found');
      }
    } catch (error) {
      console.error('Error updating incident status:', error);
      throw new Error('Failed to update incident status');
    }
  }

  // Get incidents by location radius (mock implementation)
  async getIncidentsByLocation(lat: number, lng: number, radiusKm: number = 10): Promise<Incident[]> {
    try {
      const allIncidents = await this.getIncidents();
      
      // Simple distance filter (not geographically accurate, but functional)
      return allIncidents.filter(incident => {
        const latDiff = Math.abs(incident.location.lat - lat);
        const lngDiff = Math.abs(incident.location.lng - lng);
        const approximateDistance = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff) * 111; // Rough km conversion
        
        return approximateDistance <= radiusKm;
      });
    } catch (error) {
      console.error('Error fetching incidents by location:', error);
      return this.getIncidents();
    }
  }

  // Get incident statistics
  async getIncidentStats(): Promise<{
    total: number;
    byStatus: Record<string, number>;
    bySeverity: Record<string, number>;
    byType: Record<string, number>;
  }> {
    try {
      const incidents = await this.getIncidents();

      const stats = {
        total: incidents.length,
        byStatus: {} as Record<string, number>,
        bySeverity: {} as Record<string, number>,
        byType: {} as Record<string, number>
      };

      incidents.forEach(incident => {
        stats.byStatus[incident.status] = (stats.byStatus[incident.status] || 0) + 1;
        stats.bySeverity[incident.aiAnalysis.severity] = (stats.bySeverity[incident.aiAnalysis.severity] || 0) + 1;
        stats.byType[incident.type] = (stats.byType[incident.type] || 0) + 1;
      });

      return stats;
    } catch (error) {
      console.error('Error fetching incident stats:', error);
      throw new Error('Failed to fetch incident statistics');
    }
  }
}

export const incidentService = new IncidentService();