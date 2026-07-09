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
import Home from './pages/Home'; // Import the new home page

axios.defaults.withCredentials = true;

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await axios.get('https://local-helper-backend.onrender.com/api/auth/me');
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
      await axios.post('https://local-helper-backend.onrender.com/api/auth/logout');
      setUser(null);
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  const getRoleRedirectPath = (role) => {
    if (role === 'provider') return '/feed';
    if (role === 'seeker') return '/seeker-profile';
    return '/';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mb-4"></div>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Booting Community Connect</p>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-white">
        {/* Navbar remains global and can change options depending on if the user is logged in */}
        <Navbar user={user} onLogout={handleLogout} />
        
        <main className="pt-8 pb-24 px-4">
          <Routes>
            {/* PUBLIC ROUTES (Accessible to anyone) */}
            <Route path="/" element={<Home user={user} />} />
            <Route path="/nearby-tasks" element={<NearbyTasks />} />
            
            {/* AUTH ENTRY ROUTE (Redirects to dashboard home if already authenticated) */}
            <Route 
              path="/login" 
              element={
                !user ? (
                  <div className="min-h-[80vh] flex items-center justify-center">
                    <Auth onLoginSuccess={(userData) => setUser(userData)} />
                  </div>
                ) : (
                  <Navigate to={getRoleRedirectPath(user.role)} replace />
                )
              } 
            />

            {/* SHARED/PROVIDER DASHBOARD FEED */}
            <Route 
              path="/feed" 
              element={
                user && user.role === 'provider' 
                  ? <TaskFeed currentUser={user} /> 
                  : <Navigate to={user ? getRoleRedirectPath(user.role) : '/login'} replace />
              } 
            />
            
            {/* SEEKER EXCLUSIVE ROUTES */}
            <Route 
              path="/post" 
              element={user && user.role === 'seeker' ? <PostTask currentUser={user} /> : <Navigate to={user ? getRoleRedirectPath(user.role) : '/login'} replace />} 
            />
            <Route 
              path="/seeker-profile" 
              element={user && user.role === 'seeker' ? <SeekerProfile user={user} /> : <Navigate to={user ? getRoleRedirectPath(user.role) : '/login'} replace />} 
            />

            {/* PROVIDER EXCLUSIVE ROUTES */}
            <Route 
              path="/provider-profile" 
              element={user && user.role === 'provider' ? <ProviderProfile user={user} /> : <Navigate to={user ? getRoleRedirectPath(user.role) : '/login'} replace />} 
            />

            {/* GLOBAL REDIRECT FALLBACK */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;