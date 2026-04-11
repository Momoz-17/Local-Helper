import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const PostTask = () => {
  const [formData, setFormData] = useState({ title: '', description: '', address: '' });
  const [coords, setCoords] = useState({ lat: null, lng: null });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => console.error("Location error:", err),
      { enableHighAccuracy: true }
    );
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.title.length < 5) return alert("Title is too short.");
    if (!coords.lat) return alert("Waiting for GPS location...");

    setLoading(true);
    try {
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        address: formData.address.trim() || "Current Location",
        longitude: coords.lng,
        latitude: coords.lat
      };
      
      await axios.post('http://localhost:5000/api/tasks', payload, { withCredentials: true });
      navigate('/seeker-profile'); 
    } catch (err) {
      alert(err.response?.data?.error || "Post failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-10 p-8 bg-white rounded-2xl shadow-xl border border-slate-100">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Request Local Help</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Task Title</label>
          <input 
            className="w-full p-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
            placeholder="e.g. Help moving a couch"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Address / Landmark</label>
          <input 
            className="w-full p-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
            placeholder="e.g. Near the main gate of Sunrise Apts"
            value={formData.address}
            onChange={(e) => setFormData({...formData, address: e.target.value})}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Details</label>
          <textarea 
            className="w-full p-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none h-32"
            placeholder="What do you need help with?"
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            required
          />
        </div>

        <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-100 italic flex items-center gap-2">
          <span>📍</span>
          {coords.lat ? `Location Captured: ${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}` : "Detecting precise location..."}
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className={`w-full py-3 rounded-xl font-bold text-white transition-all active:scale-[0.98] ${loading ? 'bg-slate-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100'}`}
        >
          {loading ? "Posting..." : "Post Request"}
        </button>
      </form>
    </div>
  );
};

export default PostTask;