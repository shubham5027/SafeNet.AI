import React, { useState, useRef } from 'react';
import { MapPin, Camera, Send, AlertTriangle, CheckCircle, X, Upload, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Incident } from '../types';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export default function ReportIncident() {
  const { addIncident } = useApp();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'suspicious' as Incident['type'],
    location: { lat: 19.0760, lng: 72.8777, address: '' },
    reporterContact: '',
    anonymous: true
  });
  const [images, setImages] = useState<File[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [typeSuggestion, setTypeSuggestion] = useState<string | null>(null);
  const [detailsSuggestion, setDetailsSuggestion] = useState<string | null>(null);
  const [suggestionLoading, setSuggestionLoading] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const incidentTypes = [
    { value: 'crime', label: 'Crime', color: 'text-red-400', icon: '🚨' },
    { value: 'emergency', label: 'Emergency', color: 'text-red-500', icon: '🆘' },
    { value: 'suspicious', label: 'Suspicious Activity', color: 'text-yellow-400', icon: '👁️' },
    { value: 'traffic', label: 'Traffic Incident', color: 'text-orange-400', icon: '🚗' },
    { value: 'fire', label: 'Fire', color: 'text-red-600', icon: '🔥' },
    { value: 'medical', label: 'Medical Emergency', color: 'text-pink-400', icon: '🏥' }
  ];

  const handleLocationCapture = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            location: {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
              address: `${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`
            }
          }));
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Unable to get location. Please enter manually.');
        }
      );
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => {
      const isValidType = file.type.startsWith('image/') || file.type.startsWith('video/');
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB
      return isValidType && isValidSize;
    });

    if (validFiles.length !== files.length) {
      alert('Some files were skipped. Only images and videos under 10MB are allowed.');
    }

    setImages(prev => [...prev, ...validFiles].slice(0, 5)); // Max 5 files
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description) return;

    setIsSubmitting(true);
    setError(null);
    
    try {
      const incident = {
        title: formData.title,
        description: formData.description,
        type: formData.type,
        location: formData.location,
        status: 'pending' as const,
        reporter: 'citizen' as const
      };

      const reporterContact = formData.anonymous ? undefined : formData.reporterContact;
      
      await addIncident(incident, reporterContact, images);
      setSubmitted(true);
      
      // Reset form after 3 seconds
      setTimeout(() => {
        setSubmitted(false);
        setFormData({
          title: '',
          description: '',
          type: 'suspicious',
          location: { lat: 19.0760, lng: 72.8777, address: '' },
          reporterContact: '',
          anonymous: true
        });
        setImages([]);
      }, 3000);
    } catch (error) {
      console.error('Failed to submit incident:', error);
      setError(error instanceof Error ? error.message : 'Failed to submit incident');
    } finally {
      setIsSubmitting(false);
    }
  };

  // LLM suggestion function
  const fetchSuggestions = async (title: string, description: string) => {
    if (!title && !description) {
      setTypeSuggestion(null);
      setDetailsSuggestion(null);
      return;
    }
    setSuggestionLoading(true);
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `Given the following incident report title and description, suggest the most likely incident type (choose from: crime, emergency, suspicious, traffic, fire, medical) and recommend any additional details the user should provide for a better report.\n\nTitle: ${title}\nDescription: ${description}\n\nRespond in JSON: {\"type\":\"...\",\"details\":\"...\"}`
                  }
                ]
              }
            ]
          }),
        }
      );
      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      try {
        const parsed = JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] || '{}');
        setTypeSuggestion(parsed.type || null);
        setDetailsSuggestion(parsed.details || null);
      } catch {
        setTypeSuggestion(null);
        setDetailsSuggestion(null);
      }
    } catch {
      setTypeSuggestion(null);
      setDetailsSuggestion(null);
    } finally {
      setSuggestionLoading(false);
    }
  };

  // Debounced suggestion trigger
  const handleTitleDescChange = (title: string, description: string) => {
    setFormData(prev => ({ ...prev, title, description }));
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchSuggestions(title, description);
    }, 800);
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-8 text-center">
          <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Report Submitted Successfully</h2>
          <p className="text-slate-400 mb-6">
            Your incident report has been saved to our database and is being processed by our AI system. 
            You'll receive updates on the verification status.
          </p>
          <div className="bg-slate-700/50 rounded-lg p-4">
            <p className="text-sm text-slate-300">
              <strong>Database Status:</strong> Successfully stored in Supabase
            </p>
            <p className="text-sm text-slate-300 mt-1">
              <strong>AI Analysis:</strong> Threat level assessment completed
            </p>
            {images.length > 0 && (
              <p className="text-sm text-slate-300 mt-1">
                <strong>Images:</strong> {images.length} file(s) uploaded to secure storage
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Report Safety Incident</h1>
        <p className="text-slate-400">Help keep your community safe by reporting incidents and suspicious activities</p>
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            <span className="text-red-300">{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-400 hover:text-red-300"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-slate-800/50 rounded-lg border border-slate-700 p-6 space-y-6">
        {/* Incident Title */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Incident Title *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleTitleDescChange(e.target.value, formData.description)}
            placeholder="Brief description of the incident"
            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        {/* Incident Description */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Detailed Description *
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleTitleDescChange(formData.title, e.target.value)}
            rows={4}
            placeholder="Provide detailed information about what happened, when, and any other relevant details..."
            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            required
          />
          {/* LLM Suggestions */}
          {(suggestionLoading || typeSuggestion || detailsSuggestion) && (
            <div className="mt-2 bg-slate-700/60 rounded-lg p-3 border border-blue-500/30 text-xs text-slate-200 flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-blue-400 animate-pulse" />
                <span>Smart Suggestions</span>
                {suggestionLoading && <span className="ml-2 text-blue-300 animate-pulse">Loading...</span>}
              </div>
              {typeSuggestion && (
                <div><span className="font-semibold text-blue-300">Suggested Type:</span> {typeSuggestion}</div>
              )}
              {detailsSuggestion && (
                <div><span className="font-semibold text-blue-300">Add Details:</span> {detailsSuggestion}</div>
              )}
            </div>
          )}
        </div>

        {/* Incident Type */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Incident Type *
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {incidentTypes.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, type: type.value as Incident['type'] }))}
                className={`p-3 rounded-lg border transition-all duration-200 text-left ${
                  formData.type === type.value
                    ? 'border-blue-500 bg-blue-500/20'
                    : 'border-slate-600 bg-slate-700/50 hover:border-slate-500'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{type.icon}</span>
                  <div>
                    <div className={`text-sm font-medium ${type.color}`}>
                      {type.label}
                    </div>
                  </div>
                </div>
                {/* Show suggestion highlight */}
                {typeSuggestion && type.value === typeSuggestion.toLowerCase() && (
                  <div className="mt-1 text-xs text-blue-400 flex items-center gap-1"><Sparkles className="h-3 w-3" /> Suggested</div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Location (placeholder for autocomplete) */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Location
          </label>
          <div className="flex space-x-3">
            <input
              type="text"
              value={formData.location.address}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                location: { ...prev.location, address: e.target.value }
              }))}
              placeholder="Enter address or location details (autocomplete coming soon)"
              className="flex-1 px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="button"
              onClick={handleLocationCapture}
              className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center space-x-2"
            >
              <MapPin className="h-4 w-4" />
              <span className="hidden sm:inline">GPS</span>
            </button>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Click GPS to automatically capture your current location
          </p>
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Evidence (Optional)
          </label>
          <div className="space-y-3">
            <label className="border-2 border-dashed border-slate-600 rounded-lg p-6 text-center hover:border-slate-500 transition-colors cursor-pointer block">
              <input
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
              <p className="text-slate-400 text-sm">
                Upload photos or videos to support your report
              </p>
              <p className="text-xs text-slate-500 mt-1">
                JPG, PNG, MP4 up to 10MB (max 5 files)
              </p>
            </label>

            {/* Image Preview */}
            {images.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {images.map((file, index) => (
                  <div key={index} className="relative group">
                    <div className="bg-slate-700 rounded-lg p-3 text-center">
                      <Camera className="h-6 w-6 text-slate-400 mx-auto mb-1" />
                      <p className="text-xs text-slate-300 truncate">{file.name}</p>
                      <p className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(1)}MB</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Reporter Information */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Reporter Information
          </label>
          <div className="space-y-3">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.anonymous}
                onChange={(e) => setFormData(prev => ({ ...prev, anonymous: e.target.checked }))}
                className="rounded border-slate-600 bg-slate-700 text-blue-500 focus:ring-blue-500 focus:ring-offset-slate-800"
              />
              <span className="text-sm text-slate-300">Submit anonymously</span>
            </label>
            
            {!formData.anonymous && (
              <input
                type="text"
                value={formData.reporterContact}
                onChange={(e) => setFormData(prev => ({ ...prev, reporterContact: e.target.value }))}
                placeholder="Email or phone number for follow-up"
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            )}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || !formData.title || !formData.description}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Saving to Supabase...</span>
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              <span>Submit Report</span>
            </>
          )}
        </button>

        {/* Disclaimer */}
        <div className="bg-slate-700/30 rounded-lg p-4">
          <div className="flex space-x-3">
            <AlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-slate-300">
              <p className="font-medium mb-1">Data Storage Notice:</p>
              <p>
                Reports are securely stored in MongoDB and automatically analyzed by AI for threat assessment. 
                Images are uploaded to encrypted storage. For immediate emergencies, please contact local emergency services directly.
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}