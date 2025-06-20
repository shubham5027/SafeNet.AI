// Local storage utilities for data persistence
interface StorageData {
  incidents: any[];
  lastUpdated: string;
}

const STORAGE_KEY = 'safenet_data';

export class LocalStorage {
  static save(key: string, data: any): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  }

  static load<T>(key: string, defaultValue: T): T {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : defaultValue;
    } catch (error) {
      console.error('Failed to load from localStorage:', error);
      return defaultValue;
    }
  }

  static remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Failed to remove from localStorage:', error);
    }
  }

  static clear(): void {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
    }
  }

  // Specific methods for SafeNet data
  static saveIncidents(incidents: any[]): void {
    const data: StorageData = {
      incidents,
      lastUpdated: new Date().toISOString()
    };
    this.save(STORAGE_KEY, data);
  }

  static loadIncidents(): any[] {
    const data = this.load<StorageData>(STORAGE_KEY, { incidents: [], lastUpdated: '' });
    return data.incidents || [];
  }

  static addIncident(incident: any): void {
    const incidents = this.loadIncidents();
    incidents.unshift(incident); // Add to beginning
    this.saveIncidents(incidents);
  }

  static updateIncident(id: string, updates: any): boolean {
    const incidents = this.loadIncidents();
    const index = incidents.findIndex(i => i.id === id);
    if (index !== -1) {
      incidents[index] = { ...incidents[index], ...updates };
      this.saveIncidents(incidents);
      return true;
    }
    return false;
  }

  static deleteIncident(id: string): boolean {
    const incidents = this.loadIncidents();
    const filtered = incidents.filter(i => i.id !== id);
    if (filtered.length !== incidents.length) {
      this.saveIncidents(filtered);
      return true;
    }
    return false;
  }
}