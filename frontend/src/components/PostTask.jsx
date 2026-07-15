import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const PostTask = () => {
  const [formData, setFormData] = useState({ title: '', description: '', address: '' });
  const [coords, setCoords] = useState({ lat: null, lng: null });
  const [loading, setLoading] = useState(false);
  // 'loading' | 'success' | 'error' - lets us tell the difference between
  // "still waiting" and "permission denied / failed", so the user isn't
  // stuck forever with no explanation and no way to recover.
  const [locationStatus, setLocationStatus] = useState('loading');
  const [locationErrorMsg, setLocationErrorMsg] = useState('');
  const navigate = useNavigate();
  const hasLatitude = coords.lat !== null && coords.lat !== undefined;

  const requestLocation = () => {
    setLocationStatus('loading');
    setLocationErrorMsg('');

    if (!navigator.geolocation) {
      setLocationStatus('error');
      setLocationErrorMsg('Your browser does not support location access.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocationStatus('success');
      },
      (err) => {
        console.error("Location tracking error:", err);
        setLocationStatus('error');
        // err.code: 1 = permission denied, 2 = position unavailable, 3 = timeout
        if (err.code === 1) {
          setLocationErrorMsg('Location access was denied. Please allow location access for this site in your browser settings, then click Retry.');
        } else if (err.code === 3) {
          setLocationErrorMsg('Location request timed out. Check that location services are turned on for your device/browser, then click Retry.');
        } else {
          setLocationErrorMsg('Could not determine your location. Check that location services are enabled, then click Retry.');
        }
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  useEffect(() => {
    requestLocation();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.title.length < 5) return alert("Title must be at least 5 characters long.");
    if (!hasLatitude) {
      return alert(
        locationStatus === 'error'
          ? `Location is required to post a request. ${locationErrorMsg}`
          : "Still acquiring precise GPS coordinate locking sequence... please wait a moment and try again."
      );
    }

    setLoading(true);
    try {
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        address: formData.address.trim() || "Current Coordinates",
        longitude: coords.lng,
        latitude: coords.lat
      };
      
      await axios.post('https://local-helper-backend.onrender.com/api/tasks', payload, { withCredentials: true });
      navigate('/seeker-profile'); 
    } catch (err) {
      // Backend sends { message: ... } (and sometimes { error: ... }) -
      // check both so the real reason shows instead of the generic fallback.
      alert(
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to broadcast operational claim parameters."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 p-4 md:p-8 flex items-center justify-center">
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 25 }}
        className="w-full max-w-xl bg-white rounded-[2.5rem] shadow-xl border border-slate-100 p-6 md:p-10"
      >
        <div className="mb-8">
          <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
            Broadcaster Node
          </span>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter mt-3 mb-1">Request Local Help.</h2>
          <p className="text-slate-500 font-medium text-sm">Deploy an operational workspace claim to neighborhood volunteers.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 mb-2">Task Title</label>
            <input 
              className="w-full px-5 py-4 rounded-xl bg-slate-50/50 border border-slate-100 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 outline-none font-bold text-slate-800 transition-all placeholder:text-slate-300"
              placeholder="e.g. Help moving a couch"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              required
            />
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 mb-2">Address / Landmark</label>
            <input 
              className="w-full px-5 py-4 rounded-xl bg-slate-50/50 border border-slate-100 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 outline-none font-bold text-slate-800 transition-all placeholder:text-slate-300"
              placeholder="e.g. Near the main gate of Sunrise Apts"
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
              required
            />
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 mb-2">Details & Context</label>
            <textarea 
              className="w-full px-5 py-4 rounded-xl bg-slate-50/50 border border-slate-100 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 outline-none font-medium text-slate-700 h-32 resize-none transition-all placeholder:text-slate-300 leading-relaxed"
              placeholder="What specific tasks do you require field assistance with?"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              required
            />
          </div>

          <div className="text-[11px] font-semibold text-slate-500 bg-slate-50 rounded-xl p-3.5 border border-slate-100 flex items-center gap-2 select-none">
            <span className={hasLatitude ? "text-indigo-600 animate-pulse" : locationStatus === 'error' ? "text-red-500" : "text-slate-400"}>📍</span>
            {locationStatus === 'success' && hasLatitude ? (
              <span className="font-mono tracking-tight text-slate-600">
                Geospatial Lock Verified: <span className="text-indigo-600 font-bold">{coords.lat.toFixed(5)}° N</span>, <span className="text-indigo-600 font-bold">{coords.lng.toFixed(5)}° E</span>
              </span>
            ) : locationStatus === 'error' ? (
              <span className="flex items-center gap-2 flex-wrap">
                <span className="text-red-500">{locationErrorMsg}</span>
                <button
                  type="button"
                  onClick={requestLocation}
                  className="underline font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                >
                  Retry
                </button>
              </span>
            ) : (
              <span className="italic animate-pulse text-slate-400">Synchronizing satellite GPS coordinate array lock...</span>
            )}
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className={`w-full py-4 rounded-xl font-black text-xs uppercase tracking-widest text-white transition-all active:scale-[0.99] cursor-pointer ${
              loading 
                ? 'bg-slate-300 cursor-not-allowed shadow-none' 
                : 'bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-100'
            }`}
          >
            {loading ? "Publishing Index..." : "Post Request"}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default PostTask;