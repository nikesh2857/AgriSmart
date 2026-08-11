import React, { useState, useEffect, useRef, useCallback } from 'react';
import Map, { NavigationControl, Source, Layer, Marker, MapRef } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { ArrowLeft, Search, Sparkles, Loader2, X, Navigation, PenTool, ExternalLink, Undo2, Redo2, Trash2 } from 'lucide-react';
import { area } from '@turf/area';
import { polygon } from '@turf/helpers';

const API_KEY = import.meta.env.VITE_MAPTILER_KEY || '6i5vYS8W5BzmW1BZdiwT';

export function PlotMap({ onNavigate }: { onNavigate?: (page: any) => void }) {
  const mapRef = useRef<MapRef>(null);
  const [areaAcres, setAreaAcres] = useState<number | null>(null);
  const [currentLocation, setCurrentLocation] = useState<string>('India');
  const [liveLocation, setLiveLocation] = useState<{lat: number, lng: number} | null>(null);
  const [isTrackingLive, setIsTrackingLive] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const watchIdRef = useRef<number | null>(null);

  // AI Insights State
  const [aiInsights, setAiInsights] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [showAiPanel, setShowAiPanel] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [drawingPoints, setDrawingPoints] = useState<{lat: number, lng: number}[]>([]);
  
  // Undo/Redo history states
  const [history, setHistory] = useState<{lat: number, lng: number}[][]>([[]]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  const fetchInsights = async (locationName: string) => {
    setIsAiLoading(true);
    setShowAiPanel(true);
    setAiInsights(null);
    try {
      const response = await fetch('/api/maps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: `Tell me about the agricultural conditions, soil types, and suitable crops in ${locationName}. Use Maps data to be accurate.` })
      });
      const data = await response.json();
      if (data.text) {
        setAiInsights(data.text);
      } else {
        setAiInsights('Could not generate insights at this time.');
      }
    } catch (err) {
      setAiInsights('An error occurred while fetching insights.');
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    try {
      const res = await fetch(`https://api.maptiler.com/geocoding/${encodeURIComponent(searchQuery)}.json?key=${API_KEY}`);
      const data = await res.json();
      if (data.features && data.features.length > 0) {
        const feature = data.features[0];
        const [lng, lat] = feature.center;
        mapRef.current?.flyTo({ center: [lng, lat], zoom: 14 });
        setCurrentLocation(feature.place_name || searchQuery);
      }
    } catch (err) {
      console.error("Geocoding failed", err);
    }
  };

  const onMapClick = useCallback((event: any) => {
    if (!isDrawing) return;
    const { lngLat } = event;
    const nextPoints = [...drawingPoints, { lat: lngLat.lat, lng: lngLat.lng }];
    
    setDrawingPoints(nextPoints);
    
    const nextHistory = history.slice(0, historyIndex + 1);
    setHistory([...nextHistory, nextPoints]);
    setHistoryIndex(nextHistory.length);
  }, [isDrawing, drawingPoints, history, historyIndex]);

  useEffect(() => {
    if (drawingPoints.length > 2) {
      const coords = drawingPoints.map(p => [p.lng, p.lat]);
      // Close the polygon
      coords.push([drawingPoints[0].lng, drawingPoints[0].lat]);
      try {
        const poly = polygon([coords]);
        const sqMeters = area(poly);
        const acres = sqMeters * 0.000247105;
        setAreaAcres(acres);
      } catch (err) {
        console.error("Area calculation error", err);
      }
    } else {
      setAreaAcres(null);
    }
  }, [drawingPoints]);

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      setHistoryIndex(prevIndex);
      setDrawingPoints(history[prevIndex]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      setHistoryIndex(nextIndex);
      setDrawingPoints(history[nextIndex]);
    }
  };

  const handleClear = () => {
    setDrawingPoints([]);
    setHistory([[]]);
    setHistoryIndex(0);
    setAreaAcres(null);
    setIsDrawing(false);
  };

  const toggleDrawingMode = () => {
    setIsDrawing(!isDrawing);
    setDrawingPoints([]);
    setHistory([[]]);
    setHistoryIndex(0);
    setAreaAcres(null);
  };

  const openInGoogleMapsApp = () => {
    let url = 'https://www.google.com/maps';
    if (liveLocation) {
      url = `https://www.google.com/maps?q=${liveLocation.lat},${liveLocation.lng}`;
    } else if (mapRef.current) {
      const center = mapRef.current.getCenter();
      url = `https://www.google.com/maps?q=${center.lat},${center.lng}`;
    }
    window.open(url, '_blank');
  };

  const toggleLiveTracking = () => {
    if (isTrackingLive) {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      setIsTrackingLive(false);
      setLiveLocation(null);
    } else {
      if (navigator.geolocation) {
        setIsTrackingLive(true);
        watchIdRef.current = navigator.geolocation.watchPosition(
          (position) => {
            const pos = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };
            setLiveLocation(pos);
            mapRef.current?.flyTo({ center: [pos.lng, pos.lat], zoom: 17 });
          },
          (error) => {
            console.error('Error getting live location:', error);
            setIsTrackingLive(false);
            alert('Failed to access location. Please check your browser permissions.');
          },
          { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
        );
      } else {
        alert('Geolocation is not supported by your browser.');
      }
    }
  };

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, []);

  const features: any[] = [];
  
  drawingPoints.forEach((p, idx) => {
    features.push({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [p.lng, p.lat] },
      properties: { id: idx }
    });
  });

  if (drawingPoints.length >= 2) {
    const coords = drawingPoints.map(p => [p.lng, p.lat]);
    if (drawingPoints.length > 2) {
      coords.push([drawingPoints[0].lng, drawingPoints[0].lat]);
    }
    features.push({
      type: 'Feature',
      geometry: { type: 'LineString', coordinates: coords }
    });
  }

  if (drawingPoints.length > 2) {
    const coords = drawingPoints.map(p => [p.lng, p.lat]);
    coords.push([drawingPoints[0].lng, drawingPoints[0].lat]);
    features.push({
      type: 'Feature',
      geometry: { type: 'Polygon', coordinates: [coords] }
    });
  }

  const geojson = {
    type: 'FeatureCollection',
    features
  };

  return (
    <div className="h-[calc(100vh-120px)] w-full relative rounded-3xl overflow-hidden border border-slate-200 shadow-sm">
      <div className="absolute top-4 left-4 z-10 w-96 flex items-center gap-2">
        {onNavigate && (
          <button 
            onClick={() => onNavigate('erp')}
            className="p-3 bg-white hover:bg-slate-50 rounded-xl shadow-md border border-slate-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
        )}
        <form onSubmit={handleSearch} className="relative flex-1">
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            type="text"
            placeholder="Search location..."
            className="w-full bg-white px-4 py-3 pl-12 pr-12 rounded-xl shadow-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <button 
            type="button"
            onClick={() => fetchInsights(currentLocation)}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-green-50 text-green-600 rounded-lg transition-colors group"
            title="Get AI insights for this location"
          >
            <Sparkles className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </button>
        </form>
          <button
            onClick={toggleLiveTracking}
            className={`p-3 rounded-xl shadow-md border transition-colors flex items-center justify-center shrink-0 ${
              isTrackingLive 
                ? 'bg-blue-50 border-blue-200 text-blue-600' 
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
            title="Track Live Location"
          >
            <Navigation className={`w-5 h-5 ${isTrackingLive ? 'animate-pulse' : ''}`} />
          </button>
          <button
            onClick={toggleDrawingMode}
            className={`p-3 rounded-xl shadow-md border transition-colors flex items-center justify-center shrink-0 ${
              isDrawing
                ? 'bg-green-50 border-green-200 text-green-600'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
            title="Draw Plot to Calculate Area"
          >
            <PenTool className="w-5 h-5" />
          </button>
          <button
            onClick={openInGoogleMapsApp}
            className="p-3 rounded-xl shadow-md border transition-colors flex items-center justify-center shrink-0 bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
            title="Open in Google Maps App"
          >
            <ExternalLink className="w-5 h-5" />
          </button>
        </div>

      {showAiPanel && (
        <div className="absolute top-20 left-4 z-10 w-96 max-h-[60vh] bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50">
            <div className="flex items-center gap-2 text-green-700 font-semibold">
              <Sparkles className="w-4 h-4" />
              <span>Location Insights</span>
            </div>
            <button onClick={() => setShowAiPanel(false)} className="text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-4 overflow-y-auto flex-1 text-sm text-slate-700 leading-relaxed">
            {isAiLoading ? (
              <div className="flex flex-col items-center justify-center py-8 text-slate-500 gap-3">
                <Loader2 className="w-6 h-6 animate-spin text-green-500" />
                <p>Analyzing {currentLocation}...</p>
              </div>
            ) : (
              <div className="prose prose-sm max-w-none">
                {aiInsights?.split('\n').map((paragraph, idx) => (
                  <p key={idx} className="mb-2">{paragraph}</p>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {isDrawing && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 bg-white px-6 py-4 rounded-2xl shadow-lg border border-slate-200 flex flex-col items-center gap-3">
          <div className="text-center">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Drawing Mode</p>
            {areaAcres !== null ? (
              <p className="text-2xl font-bold text-green-600 mt-1">
                {areaAcres.toFixed(2)} <span className="text-sm text-slate-500 font-normal">Acres</span>
              </p>
            ) : (
              <p className="text-sm text-slate-500 mt-1">Click on the map to add points (min 3 for area)</p>
            )}
          </div>
          
          <div className="flex items-center gap-3 border-t border-slate-100 pt-3 w-full justify-center">
            <button
              onClick={handleUndo}
              disabled={historyIndex <= 0}
              className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-medium transition-colors border border-slate-200 flex items-center gap-1.5"
              title="Undo last point"
            >
              <Undo2 className="w-3.5 h-3.5" /> Undo
            </button>
            <button
              onClick={handleRedo}
              disabled={historyIndex >= history.length - 1}
              className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-medium transition-colors border border-slate-200 flex items-center gap-1.5"
              title="Redo next point"
            >
              <Redo2 className="w-3.5 h-3.5" /> Redo
            </button>
            <button
              onClick={handleClear}
              className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-medium transition-colors border border-red-100 flex items-center gap-1.5"
              title="Clear selection"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear
            </button>
          </div>
        </div>
      )}

      <Map
        ref={mapRef}
        initialViewState={{
          longitude: 78.9629,
          latitude: 20.5937,
          zoom: 4
        }}
        mapStyle={`https://api.maptiler.com/maps/hybrid/style.json?key=${API_KEY}`}
        onClick={onMapClick}
        cursor={isDrawing ? 'crosshair' : 'grab'}
      >
        <NavigationControl position="bottom-right" />
        
        {liveLocation && (
          <Marker longitude={liveLocation.lng} latitude={liveLocation.lat} anchor="bottom">
            <div className="relative flex items-center justify-center w-8 h-8">
              <div className="absolute w-full h-full bg-blue-500 rounded-full opacity-30 animate-ping"></div>
              <div className="relative w-4 h-4 bg-blue-500 border-2 border-white rounded-full shadow-md shadow-blue-500/50"></div>
            </div>
          </Marker>
        )}

        {drawingPoints.length > 0 && (
          <Source id="draw-polygon" type="geojson" data={geojson as any}>
            <Layer 
              id="draw-polygon-fill" 
              type="fill"
              filter={['==', '$type', 'Polygon']}
              paint={{
                'fill-color': '#22c55e',
                'fill-opacity': 0.3
              }} 
            />
            <Layer 
              id="draw-polygon-stroke" 
              type="line"
              filter={['==', '$type', 'LineString']}
              paint={{
                'line-color': '#16a34a',
                'line-width': 3
              }} 
            />
            <Layer
              id="draw-polygon-points"
              type="circle"
              filter={['==', '$type', 'Point']}
              paint={{
                'circle-radius': 6,
                'circle-color': '#ffffff',
                'circle-stroke-width': 2,
                'circle-stroke-color': '#16a34a'
              }}
            />
          </Source>
        )}
      </Map>
    </div>
  );
}
