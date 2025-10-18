import React, { useState } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Rocket, Globe as GlobeIcon, Satellite, Loader2, AlertCircle, TrendingUp } from 'lucide-react';
import Globe from 'react-globe.gl';

const BACKEND_URL = 'http://localhost:8000';

// Space agency markers with exact coordinates
const spaceAgencyMarkers = [
  {
    lat: 13.7199,
    lng: 80.2304,
    size: 0.8,
    color: '#ff9933',
    label: 'Indian Space Research Organisation - Satish Dhawan Space Centre'
  },
  {
    lat: 28.5729,
    lng: -80.6490,
    size: 0.8,
    color: '#ff3333',
    label: 'National Aeronautics and Space Administration - Kennedy Space Center'
  },
  {
    lat: 25.9972,
    lng: -97.1572,
    size: 0.8,
    color: '#00ff00',
    label: 'SpaceX - Starbase Texas'
  }
];

const SpaceApp = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError('');
    setResults(null);

    try {
      const response = await fetch(`${BACKEND_URL}/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to fetch data');
      }

      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderVisualization = (viz, index) => {
    const colors = ['#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444'];

    switch (viz.type) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={viz.data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="label" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} />
              <Legend />
              <Line type="monotone" dataKey="value" stroke={colors[index % colors.length]} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={viz.data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="label" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} />
              <Legend />
              <Bar dataKey="value" fill={colors[index % colors.length]} />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={viz.data} dataKey="value" nameKey="label" cx="50%" cy="50%" outerRadius={80} label>
                {viz.data.map((entry, i) => (
                  <Cell key={`cell-${i}`} fill={colors[i % colors.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );

      case 'scatter':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="label" stroke="#9ca3af" />
              <YAxis dataKey="value" stroke="#9ca3af" />
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} />
              <Legend />
              <Scatter name="Data Points" data={viz.data} fill={colors[index % colors.length]} />
            </ScatterChart>
          </ResponsiveContainer>
        );

      case 'timeline':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={viz.data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} />
              <Legend />
              <Line type="monotone" dataKey="value" stroke={colors[index % colors.length]} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        );

      default:
        return <div className="text-gray-400">Unsupported visualization type: {viz.type}</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900">
      {/* Header */}
      <header className="bg-black bg-opacity-50 backdrop-blur-md border-b border-purple-500">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Rocket className="w-8 h-8 text-purple-400" />
            <h1 className="text-2xl font-bold text-white">Space Mission AI</h1>
          </div>
          <div className="flex items-center gap-4">
            <Satellite className="w-6 h-6 text-purple-300 animate-pulse" />
            <span className="text-purple-300 text-sm">System Operational</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* 3D Globe Section */}
        <div className="mb-12">
          <div className="text-center mb-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <GlobeIcon className="w-6 h-6 text-blue-400" />
              <h2 className="text-3xl font-bold text-white">Global Space Agency Locations</h2>
            </div>
            <p className="text-gray-400 text-sm">Interactive 3D Earth showing NASA, ISRO, and SpaceX facilities</p>
          </div>
          
          <div className="rounded-xl overflow-hidden border border-purple-500 shadow-2xl bg-black flex items-center justify-center" style={{ height: '400px' }}>
            <Globe
              globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
              backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
              pointsData={spaceAgencyMarkers}
              pointAltitude={0.01}
              pointRadius="size"
              pointColor="color"
              pointLabel="label"
              pointsTransitionDuration={1000}
              atmosphereColor="#4488ff"
              atmosphereAltitude={0.15}
              height={400}
              width={800}
            />
          </div>
          
          {/* Legend */}
          <div className="flex justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#ff3333' }}></div>
              <span className="text-gray-300 text-sm">National Aeronautics and Space Administration (USA)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#ff9933' }}></div>
              <span className="text-gray-300 text-sm">Indian Space Research Organisation (India)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#00ff00' }}></div>
              <span className="text-gray-300 text-sm">SpaceX (USA)</span>
            </div>
          </div>
        </div>

        {/* Query Section */}
        <div className="bg-gray-800 bg-opacity-50 backdrop-blur-md rounded-xl p-6 mb-8 border border-purple-500">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-purple-300 mb-2 font-medium">Ask about Space Missions</label>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g., Show me SpaceX launches in 2024, Compare ISRO and NASA missions..."
                className="w-full px-4 py-3 bg-gray-900 text-white border border-purple-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-gray-500"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing Query...
                </>
              ) : (
                <>
                  <TrendingUp className="w-5 h-5" />
                  Analyze Mission Data
                </>
              )}
            </button>
          </form>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-900 bg-opacity-50 border border-red-500 rounded-xl p-4 mb-8 flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-red-200 font-medium mb-1">Error</h3>
              <p className="text-red-300">{error}</p>
            </div>
          </div>
        )}

        {/* Results Display */}
        {results && (
          <div className="space-y-6">
            {/* Insights */}
            <div className="bg-gradient-to-r from-purple-900 to-blue-900 bg-opacity-50 backdrop-blur-md rounded-xl p-6 border border-purple-400">
              <h3 className="text-xl font-bold text-purple-200 mb-3 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                AI Insights
              </h3>
              <p className="text-gray-200 leading-relaxed">{results.insights}</p>
            </div>

            {/* Visualizations */}
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                <Satellite className="w-6 h-6 text-purple-400" />
                Mission Analytics
              </h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {results.visualizations.map((viz, index) => (
                  <div 
                    key={index}
                    className="bg-gray-800 bg-opacity-50 backdrop-blur-md rounded-xl p-6 border border-purple-500 hover:border-purple-400 transition-colors"
                  >
                    <h4 className="text-lg font-semibold text-purple-300 mb-2">{viz.title}</h4>
                    <p className="text-gray-400 text-sm mb-4">{viz.description}</p>
                    <div className="mt-4">
                      {renderVisualization(viz, index)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Query Metadata */}
            <div className="bg-gray-800 bg-opacity-30 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">Query: <span className="text-purple-300">{results.query}</span></span>
                <span className="text-gray-400">Timestamp: <span className="text-purple-300">{new Date(results.timestamp).toLocaleString()}</span></span>
              </div>
            </div>
          </div>
        )}

        {/* Welcome Message (when no results) */}
        {!results && !loading && !error && (
          <div className="text-center py-12">
            <Rocket className="w-16 h-16 text-purple-400 mx-auto mb-4 animate-bounce" />
            <h3 className="text-2xl font-bold text-white mb-2">Ready for Mission Analysis</h3>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Enter your query above to explore space missions from NASA, ISRO, SpaceX and more. 
              Get real-time insights and interactive visualizations powered by AI agents.
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="mt-12 py-6 border-t border-purple-900 bg-black bg-opacity-30">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-400 text-sm">
          <p>Powered by Agentic AI System | LangGraph + Perplexity Sonar Pro</p>
          <p className="mt-1">Real-time Space Mission Data Analysis</p>
        </div>
      </footer>
    </div>
  );
};

export default SpaceApp;