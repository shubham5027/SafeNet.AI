import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import Map, { Marker, Popup, Source, Layer, MapRef } from 'react-map-gl';
import { Incident, NewsItem } from '../../types';
import Supercluster from 'supercluster';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

interface MapboxMapProps {
  incidents: Incident[];
  news: NewsItem[];
  showHeatmap: boolean;
  activeLayer: 'incidents' | 'news' | 'ai-zones' | 'all';
  onIncidentClick?: (incident: Incident) => void;
  onNewsClick?: (news: NewsItem) => void;
}

interface MapDataPoint {
  type: 'Feature';
  properties: {
    cluster: boolean;
    pointType: 'incident' | 'news';
    severity: 'low' | 'medium' | 'high';
    data: Incident | NewsItem;
    id: string;
  };
  geometry: {
    type: 'Point';
    coordinates: [number, number];
  };
}

export default function MapboxMap({ 
  incidents, 
  news, 
  showHeatmap, 
  activeLayer,
  onIncidentClick,
  onNewsClick 
}: MapboxMapProps) {
  const mapRef = useRef<MapRef>(null);
  const [viewState, setViewState] = useState({
    longitude: 72.8777,
    latitude: 19.0760,
    zoom: 11
  });
  const [selectedPoint, setSelectedPoint] = useState<{
    data: Incident | NewsItem;
    type: 'incident' | 'news';
    longitude: number;
    latitude: number;
  } | null>(null);
  const [clusters, setClusters] = useState<any[]>([]);

  // Create supercluster instance
  const supercluster = useMemo(() => new Supercluster({
    radius: 40,
    maxZoom: 16,
    minZoom: 0,
    minPoints: 2
  }), []);

  // Convert incidents and news to GeoJSON points
  const points: MapDataPoint[] = useMemo(() => {
    const incidentPoints: MapDataPoint[] = incidents
      .filter(incident => incident.location.lat && incident.location.lng)
      .map(incident => ({
        type: 'Feature' as const,
        properties: {
          cluster: false,
          pointType: 'incident' as const,
          severity: incident.aiAnalysis.severity,
          data: incident,
          id: incident.id
        },
        geometry: {
          type: 'Point' as const,
          coordinates: [incident.location.lng, incident.location.lat]
        }
      }));

    const newsPoints: MapDataPoint[] = news
      .filter(item => item.location?.lat && item.location?.lng)
      .map(item => ({
        type: 'Feature' as const,
        properties: {
          cluster: false,
          pointType: 'news' as const,
          severity: item.aiAnalysis.severity,
          data: item,
          id: item.id
        },
        geometry: {
          type: 'Point' as const,
          coordinates: [item.location!.lng, item.location!.lat]
        }
      }));

    // Filter based on active layer
    switch (activeLayer) {
      case 'incidents':
        return incidentPoints;
      case 'news':
        return newsPoints;
      case 'all':
        return [...incidentPoints, ...newsPoints];
      default:
        return [...incidentPoints, ...newsPoints];
    }
  }, [incidents, news, activeLayer]);

  const updateClusters = useCallback(() => {
    if (!mapRef.current) return;

    const map = mapRef.current.getMap();
    const bounds = map.getBounds();
    const zoom = Math.floor(map.getZoom());

    const clustersData = supercluster.getClusters(
      [bounds.getWest(), bounds.getSouth(), bounds.getEast(), bounds.getNorth()],
      zoom
    );

    setClusters(clustersData);
  }, [supercluster]);

  // Update clusters when points change
  useEffect(() => {
    supercluster.load(points);
    updateClusters();
  }, [points, supercluster, updateClusters]);

  const handleMapMove = useCallback(() => {
    updateClusters();
  }, [updateClusters]);

  // Get pin color based on severity
  const getPinColor = (severity: 'low' | 'medium' | 'high') => {
    switch (severity) {
      case 'high':
        return '#ef4444'; // red-500
      case 'medium':
        return '#f59e0b'; // amber-500
      case 'low':
        return '#10b981'; // emerald-500
      default:
        return '#6b7280'; // gray-500
    }
  };

  // Get incident type icon
  const getIncidentIcon = (data: Incident | NewsItem) => {
    if ('type' in data) {
      const icons = {
        crime: '🚨',
        emergency: '🆘',
        suspicious: '👁️',
        traffic: '🚗',
        fire: '🔥',
        medical: '🏥'
      };
      return icons[data.type] || '📍';
    }
    return '📰';
  };

  // Heatmap layer configuration
  const heatmapLayer = {
    id: 'heatmap',
    type: 'heatmap' as const,
    paint: {
      'heatmap-weight': [
        'interpolate',
        ['linear'],
        ['get', 'severity'],
        'low', 0.3,
        'medium', 0.6,
        'high', 1
      ],
      'heatmap-intensity': [
        'interpolate',
        ['linear'],
        ['zoom'],
        0, 1,
        9, 3
      ],
      'heatmap-color': [
        'interpolate',
        ['linear'],
        ['heatmap-density'],
        0, 'rgba(33, 102, 172, 0)',
        0.2, 'rgb(103, 169, 207)',
        0.4, 'rgb(209, 229, 240)',
        0.6, 'rgb(253, 219, 199)',
        0.8, 'rgb(239, 138, 98)',
        1, 'rgb(178, 24, 43)'
      ],
      'heatmap-radius': [
        'interpolate',
        ['linear'],
        ['zoom'],
        0, 2,
        9, 20
      ],
      'heatmap-opacity': [
        'interpolate',
        ['linear'],
        ['zoom'],
        7, 1,
        9, 0
      ]
    }
  };

  const handleClusterClick = (cluster: any) => {
    if (!mapRef.current) return;

    const expansionZoom = Math.min(
      supercluster.getClusterExpansionZoom(cluster.id),
      20
    );

    mapRef.current.easeTo({
      center: cluster.geometry.coordinates,
      zoom: expansionZoom,
      duration: 500
    });
  };

  const handlePointClick = (point: any) => {
    const { data, pointType } = point.properties;
    
    setSelectedPoint({
      data,
      type: pointType,
      longitude: point.geometry.coordinates[0],
      latitude: point.geometry.coordinates[1]
    });

    if (pointType === 'incident' && onIncidentClick) {
      onIncidentClick(data);
    } else if (pointType === 'news' && onNewsClick) {
      onNewsClick(data);
    }
  };

  return (
    <div className="w-full h-full relative">
      <Map
        ref={mapRef}
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        onMoveEnd={handleMapMove}
        mapboxAccessToken={MAPBOX_TOKEN}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/dark-v11"
        interactiveLayerIds={['clusters', 'unclustered-point']}
      >
        {/* Heatmap Source and Layer */}
        {showHeatmap && (
          <Source
            id="incidents-heat"
            type="geojson"
            data={{
              type: 'FeatureCollection',
              features: points.map(point => ({
                ...point,
                properties: {
                  ...point.properties,
                  severity: point.properties.severity === 'high' ? 3 : 
                          point.properties.severity === 'medium' ? 2 : 1
                }
              }))
            }}
          >
            <Layer {...heatmapLayer} />
          </Source>
        )}

        {/* Render clusters and individual points */}
        {clusters.map((cluster, index) => {
          const [longitude, latitude] = cluster.geometry.coordinates;
          const { cluster: isCluster, point_count: pointCount } = cluster.properties;

          if (isCluster) {
            return (
              <Marker
                key={`cluster-${cluster.id}-${index}`}
                longitude={longitude}
                latitude={latitude}
              >
                <div
                  className="cluster-marker cursor-pointer flex items-center justify-center rounded-full border-2 border-white shadow-lg hover:scale-110 transition-transform"
                  style={{
                    width: `${30 + (pointCount / points.length) * 40}px`,
                    height: `${30 + (pointCount / points.length) * 40}px`,
                    backgroundColor: '#3b82f6'
                  }}
                  onClick={() => handleClusterClick(cluster)}
                >
                  <span className="text-white font-bold text-sm">{pointCount}</span>
                </div>
              </Marker>
            );
          }

          return (
            <Marker
              key={`point-${cluster.properties.id}-${index}`}
              longitude={longitude}
              latitude={latitude}
            >
              <div
                className="individual-marker cursor-pointer flex items-center justify-center rounded-full border-2 border-white shadow-lg hover:scale-110 transition-transform text-white font-bold text-xs"
                style={{
                  width: '24px',
                  height: '24px',
                  backgroundColor: getPinColor(cluster.properties.severity)
                }}
                onClick={() => handlePointClick(cluster)}
              >
                <span>{getIncidentIcon(cluster.properties.data)}</span>
              </div>
            </Marker>
          );
        })}

        {/* Popup for selected point */}
        {selectedPoint && (
          <Popup
            longitude={selectedPoint.longitude}
            latitude={selectedPoint.latitude}
            anchor="bottom"
            onClose={() => setSelectedPoint(null)}
            className="max-w-sm"
          >
            <div className="p-3 bg-slate-900 text-white rounded-lg">
              <h3 className="font-semibold text-sm mb-2">
                {'title' in selectedPoint.data ? selectedPoint.data.title : selectedPoint.data.title}
              </h3>
              <p className="text-xs text-slate-300 mb-2 line-clamp-3">
                {'description' in selectedPoint.data ? selectedPoint.data.description : selectedPoint.data.description}
              </p>
              <div className="flex items-center justify-between text-xs">
                <span 
                  className="px-2 py-1 rounded text-white"
                  style={{ backgroundColor: getPinColor(selectedPoint.data.aiAnalysis.severity) }}
                >
                  {selectedPoint.data.aiAnalysis.severity} risk
                </span>
                <span className="text-slate-400 capitalize">
                  {selectedPoint.type === 'incident' ? 
                    ('type' in selectedPoint.data ? selectedPoint.data.type : 'news') : 
                    'news'
                  }
                </span>
              </div>
              <div className="text-xs text-slate-400 mt-1">
                Confidence: {Math.round(selectedPoint.data.aiAnalysis.confidence * 100)}%
              </div>
            </div>
          </Popup>
        )}
      </Map>
    </div>
  );
}