import React, { useState, useEffect } from 'react';
import { Search, Filter, ExternalLink, MapPin, Clock, TrendingUp, RefreshCw, AlertCircle, CheckCircle, Wifi, WifiOff } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { newsService } from '../services/newsService';
import NewsCard from '../components/NewsCard';

export default function NewsFeed() {
  const { news, newsLoading, newsError, searchNews, fetchNewsByCategory, fetchSafetyNews } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [isSearching, setIsSearching] = useState(false);
  const [apiStatus, setApiStatus] = useState<'unknown' | 'connected' | 'error'>('unknown');

  const categories = [
    { value: 'all', label: 'All Categories', count: news.length },
    { value: 'law-enforcement', label: 'Law Enforcement', count: news.filter(n => n.category === 'law-enforcement').length },
    { value: 'traffic', label: 'Traffic', count: news.filter(n => n.category === 'traffic').length },
    { value: 'emergency-services', label: 'Emergency Services', count: news.filter(n => n.category === 'emergency-services').length },
    { value: 'crime', label: 'Crime', count: news.filter(n => n.category === 'crime').length },
    { value: 'fire-safety', label: 'Fire Safety', count: news.filter(n => n.category === 'fire-safety').length },
  ];

  // Test API connection on component mount
  useEffect(() => {
    const testConnection = async () => {
      try {
        const result = await newsService.testConnection();
        setApiStatus(result.success ? 'connected' : 'error');
        if (!result.success) {
          console.warn('News API test failed:', result.message);
        }
      } catch (error) {
        setApiStatus('error');
        console.warn('News API test error:', error);
      }
    };

    testConnection();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim() || !searchNews) return;
    
    setIsSearching(true);
    try {
      await searchNews(searchTerm);
    } finally {
      setIsSearching(false);
    }
  };

  const handleCategoryChange = async (category: string) => {
    setSelectedCategory(category);
    if (category === 'all') {
      fetchSafetyNews && await fetchSafetyNews();
    } else {
      fetchNewsByCategory && await fetchNewsByCategory(category);
    }
  };

  const handleRefresh = () => {
    if (selectedCategory === 'all') {
      fetchSafetyNews && fetchSafetyNews();
    } else {
      fetchNewsByCategory && fetchNewsByCategory(selectedCategory);
    }
  };

  const filteredNews = news
    .filter(item => {
      if (searchTerm) {
        return item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
               item.description.toLowerCase().includes(searchTerm.toLowerCase());
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'recent') {
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      } else if (sortBy === 'severity') {
        const severityOrder = { high: 3, medium: 2, low: 1 };
        return severityOrder[b.aiAnalysis.severity] - severityOrder[a.aiAnalysis.severity];
      }
      return 0;
    });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Safety News Feed</h1>
            <p className="text-slate-400">Live news and updates on public safety and security</p>
          </div>
          <div className="flex items-center space-x-4">
            {/* API Status Indicator */}
            <div className="flex items-center space-x-2">
              {apiStatus === 'connected' && (
                <>
                  <Wifi className="h-4 w-4 text-green-400" />
                  <span className="text-xs text-green-400">API Connected</span>
                </>
              )}
              {apiStatus === 'error' && (
                <>
                  <WifiOff className="h-4 w-4 text-red-400" />
                  <span className="text-xs text-red-400">API Offline</span>
                </>
              )}
            </div>

            <button
              onClick={handleRefresh}
              disabled={newsLoading}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white rounded-lg transition-colors"
            >
              <RefreshCw className={`h-4 w-4 ${newsLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-6 mb-8">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1 flex space-x-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search safety news..."
                className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              type="submit"
              disabled={isSearching || !searchTerm.trim()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white rounded-lg transition-colors"
            >
              {isSearching ? 'Searching...' : 'Search'}
            </button>
          </form>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {categories.map(category => (
              <option key={category.value} value={category.value}>
                {category.label} ({category.count})
              </option>
            ))}
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="recent">Most Recent</option>
            <option value="severity">By Severity</option>
          </select>
        </div>
      </div>

      {/* Error State */}
      {newsError && (
        <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 mb-8">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <span className="text-red-300">{newsError}</span>
            <button
              onClick={handleRefresh}
              className="ml-auto text-red-400 hover:text-red-300 underline"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Success Message for API Connection */}
      {apiStatus === 'connected' && !newsLoading && !newsError && (
        <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4 mb-8">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-400" />
            <span className="text-green-300">News service is connected and operational</span>
          </div>
        </div>
      )}

      {/* Loading State */}
      {newsLoading && (
        <div className="text-center py-12">
          <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
            <h3 className="text-lg font-medium text-white mb-2">Loading Latest News</h3>
            <p className="text-slate-400">Fetching real-time safety updates...</p>
          </div>
        </div>
      )}

      {/* News Grid */}
      {!newsLoading && (
        <>
          {filteredNews.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredNews.map(item => (
                <NewsCard key={item.id} news={item} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-8">
                <TrendingUp className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">No articles found</h3>
                <p className="text-slate-400 mb-4">
                  {searchTerm ? 'Try adjusting your search terms or filters' : 'No news articles available at the moment'}
                </p>
                {searchTerm && (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      handleCategoryChange('all');
                    }}
                    className="text-blue-400 hover:text-blue-300 underline"
                  >
                    Clear search and show all news
                  </button>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* News Stats */}
      {!newsLoading && filteredNews.length > 0 && (
        <div className="mt-8 bg-slate-800/50 rounded-lg border border-slate-700 p-6">
          <h3 className="text-lg font-medium text-white mb-4">News Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{filteredNews.length}</div>
              <div className="text-sm text-slate-400">Total Articles</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-400">
                {filteredNews.filter(n => n.aiAnalysis.severity === 'high').length}
              </div>
              <div className="text-sm text-slate-400">High Priority</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">
                {filteredNews.length > 0 ? Math.round(filteredNews.reduce((sum, n) => sum + n.aiAnalysis.confidence, 0) / filteredNews.length * 100) : 0}%
              </div>
              <div className="text-sm text-slate-400">Avg Confidence</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">
                {filteredNews.filter(n => n.location).length}
              </div>
              <div className="text-sm text-slate-400">Geo-Located</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}