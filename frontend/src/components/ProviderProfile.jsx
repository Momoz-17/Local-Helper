import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ProviderProfile = () => {
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({ averageRating: 0, totalReviews: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Direct live Render backend base URL
  const BASE_URL = 'https://finance-tracker-backend-u3qd.onrender.com/api';

  useEffect(() => {
    const fetchProviderDashboardData = async () => {
      setLoading(true);
      setError(null);
      try {
        // 1. Fetch running tasks accepted by this provider using live backend
        const tasksResponse = await axios.get(`${BASE_URL}/tasks/my-tasks`, {
          withCredentials: true
        });
        setTasks(tasksResponse.data);

        // 2. Fetch aggregation statistics from live backend
        const statsResponse = await axios.get(`${BASE_URL}/tasks/stats`, { 
          withCredentials: true 
        }); 
        
        setStats(statsResponse.data);
      } catch (err) {
        console.error("Dashboard fetching failure:", err);
        setError("Failed to assemble profile elements.");
      } finally {
        setLoading(false);
      }
    };

    fetchProviderDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-slate-50">
        <div className="text-xl font-medium text-slate-500 animate-pulse">
          Loading dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Provider Dashboard</h1>
      
      {error && (
        <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-xl">
          {error}
        </div>
      )}
      
      {/* Statistics Cards */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="p-6 bg-white rounded-2xl shadow-sm border border-slate-100">
          <p className="text-sm text-slate-500 font-medium">Average Rating</p>
          <p className="text-2xl font-bold text-indigo-600">
            ⭐ {typeof stats.averageRating === 'number' ? stats.averageRating.toFixed(1) : "0.0"}
          </p>
        </div>
        <div className="p-6 bg-white rounded-2xl shadow-sm border border-slate-100">
          <p className="text-sm text-slate-500 font-medium">Total Reviews</p>
          <p className="text-2xl font-bold text-slate-800">{stats.totalReviews || 0}</p>
        </div>
      </div>

      {/* Accepted Task Lists */}
      <h2 className="text-xl font-bold mb-4 text-slate-700">My Accepted Commitments ({tasks.length})</h2>
      {tasks.length === 0 ? (
        <div className="p-8 bg-white border border-dashed border-slate-200 text-center rounded-2xl text-slate-400">
          No active tasks on your schedule. Head over to the global feed to find jobs!
        </div>
      ) : (
        <div className="space-y-4">
          {tasks.map(task => (
            <div key={task._id} className="p-6 bg-white rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-lg text-slate-800">{task.title}</h3>
                <p className="text-slate-500 text-sm">{task.description}</p>
                <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold ${
                  task.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                }`}>{task.status.toUpperCase()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProviderProfile;