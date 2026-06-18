import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from './components/Navbar';
import TaskFeed from './components/TaskFeed';
import PostTask from './components/PostTask';
import ProviderProfile from './components/ProviderProfile';
import SeekerProfile from './components/SeekerProfile';
import Auth from './components/Auth';
import NearbyTasks from './pages/NearbyTasks';

// Global configurations remain set for cross-origin session cookies
axios.defaults.withCredentials = true;

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Define live Render backend base endpoint
  const BASE_URL = 'https://finance-tracker-backend-u3qd.onrender.com/api';

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Swapped out localhost for the live production Render backend address
        const res = await axios.get(`${BASE_URL}/auth/me`);
        setUser(res.data.user);
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const handleLogout = async () => {
    try {
      // Swapped out localhost for the live production Render backend address
      await axios.post(`${BASE_URL}/auth/logout`);
      setUser(null);
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mb-4"></div>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Booting Community Connect</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Auth onLoginSuccess={(userData) => setUser(userData)} />
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-white">
        <Navbar user={user} onLogout={handleLogout} />
        
        <main className="pt-8 pb-24 px-4">
          <Routes>
            {/* Shared Route */}
            <Route path="/nearby-tasks" element={<NearbyTasks />} />

            {/* Dashboard Redirect Logic */}
            <Route 
              path="/" 
              element={
                user.role === 'provider' 
                  ? <TaskFeed currentUser={user} /> 
                  : <Navigate to="/seeker-profile" replace />
              } 
            />
            
            {/* Seeker Exclusive Routes */}
            <Route 
              path="/post" 
              element={user.role === 'seeker' ? <PostTask currentUser={user} /> : <Navigate to="/" />} 
            />
            <Route 
              path="/seeker-profile" 
              element={user.role === 'seeker' ? <SeekerProfile user={user} /> : <Navigate to="/" />} 
            />

            {/* Provider Exclusive Routes */}
            <Route 
              path="/provider-profile" 
              element={user.role === 'provider' ? <ProviderProfile user={user} /> : <Navigate to="/" />} 
            />

            {/* Global Redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;