import React, { useState, useEffect, useRef } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Rocket, Globe, Satellite, Loader2, AlertCircle, TrendingUp } from 'lucide-react';
import * as THREE from 'three';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

const SpaceApp = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState(null);
  const globeRef = useRef(null);
  const sceneRef = useRef(null);

  // Initialize 3D Globe
  useEffect(() => {
    if (!globeRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, globeRef.current.clientWidth / globeRef.current.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    
    renderer.setSize(globeRef.current.clientWidth, globeRef.current.clientHeight);
    globeRef.current.appendChild(renderer.domElement);

    // Create Earth
    const geometry = new THREE.SphereGeometry(2, 32, 32);
    const textureLoader = new THREE.TextureLoader();
    
    // Create a basic blue earth with grid
    const material = new THREE.MeshPhongMaterial({
      color: 0x2233ff,
      emissive: 0x112244,
      specular: 0x333333,
      shininess: 25,
      wireframe: false
    });
    
    const earth = new THREE.Mesh(geometry, material);
    scene.add(earth);

    // Add grid lines for continents effect
    const wireframe = new THREE.WireframeGeometry(geometry);
    const line = new THREE.LineSegments(wireframe);
    line.material.opacity = 0.1;
    line.material.transparent = true;
    line.material.color = new THREE.Color(0xffffff);
    earth.add(line);

    // Add launch sites as glowing points
    const launchSites = [
      { lat: 28.5, lon: -80.6, name: 'Kennedy Space Center' }, // Florida
      { lat: 13.7, lon: 80.2, name: 'Satish Dhawan' }, // India
      { lat: 34.6, lon: -120.6, name: 'Vandenberg' }, // California
      { lat: 31.2, lon: 121.5, name: 'Shanghai' }, // China
    ];

    launchSites.forEach(site => {
      const phi = (90 - site.lat) * (Math.PI / 180);
      const theta = (site.lon + 180) * (Math.PI / 180);
      
      const x = -(2 * Math.sin(phi) * Math.cos(theta));
      const y = 2 * Math.cos(phi);
      const z = 2 * Math.sin(phi) * Math.sin(theta);

      const markerGeometry = new THREE.SphereGeometry(0.05, 8, 8);
      const markerMaterial = new THREE.MeshBasicMaterial({ color: 0xff3333, emissive: 0xff0000 });
      const marker = new THREE.Mesh(markerGeometry, markerMaterial);
      marker.position.set(x, y, z);
      earth.add(marker);
    });

    // Add stars
    const starsGeometry = new THREE.BufferGeometry();
    const starsMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.02 });
    
    const starsVertices = [];
    for (let i = 0; i < 1000; i++) {
      const x = (Math.random() - 0.5) * 20;
      const y = (Math.random() - 0.5) * 20;
      const z = (Math.random() - 0.5) * 20;
      starsVertices.push(x, y, z);
    }
    
    starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
    const stars = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(stars);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 2);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 3, 5);
    scene.add(directionalLight);

    camera.position.z = 5;

    // Animation
    const animate = () => {
      requestAnimationFrame(animate);
      earth.rotation.y += 0.002;
      stars.rotation.y += 0.0002;
      renderer.render(scene, camera);
    };
    
    animate();
    sceneRef.current = { scene, camera, renderer, earth };

    // Cleanup
    return () => {
      if (globeRef.current && renderer.domElement) {
        globeRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

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
        <div className="mb-12 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Globe className="w-6 h-6 text-blue-400" />
            <h2 className="text-3xl font-bold text-white">Global Launch Sites</h2>
          </div>
          <div 
            ref={globeRef} 
            className="w-full h-96 mx-auto rounded-xl overflow-hidden bg-black bg-opacity-30 backdrop-blur-sm border border-purple-500 shadow-2xl"
          />
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