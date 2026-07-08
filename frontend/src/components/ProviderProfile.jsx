import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

const ProviderProfile = () => {
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({ averageRating: 0, totalReviews: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    const fetchProviderDashboardData = async () => {
      setLoading(true);
      setError(null);
      try {
        const tasksResponse = await axios.get('http://localhost:5000/api/tasks/my-tasks', {
          withCredentials: true
        });
        setTasks(tasksResponse.data);

        const statsResponse = await axios.get('http://localhost:5000/api/tasks/stats', { 
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

  const totalCompleted = tasks.filter(t => t.status === 'completed').length;
  const totalActive = tasks.filter(t => t.status === 'accepted').length;

  const filteredTasks = tasks.filter(task => {
    if (activeTab === 'all') return true;
    if (activeTab === 'active') return task.status === 'accepted';
    if (activeTab === 'completed') return task.status === 'completed';
    return true;
  });

  // Animation Variant Configurations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-slate-50/50">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full"
        />
        <motion.div 
          initial={{ opacity: 0.5 }}
          animate={{ opacity: 1 }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut", repeatType: "reverse" }}
          className="mt-4 text-sm font-semibold text-slate-600 tracking-wide"
        >
          Assembling your personal workspace...
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 p-4 md:p-8 max-w-7xl mx-auto"
    >
      {/* Header Profile Section */}
      <motion.div variants={itemVariants} className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
            Service Provider Account
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mt-2">
            Welcome back, Specialist
          </h1>
          <p className="text-slate-500 mt-1 text-sm md:text-base">
            Track your client operations, manage task state transitions, and review earnings performance indicators.
          </p>
        </div>
      </motion.div>

      {error && (
        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="p-4 mb-6 text-sm text-red-700 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2">
          <span>⚠️</span> {error}
        </motion.div>
      )}
      
      {/* Premium Statistics Overview Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { title: "Average Rating", value: typeof stats.averageRating === 'number' ? stats.averageRating.toFixed(1) : "0.0", color: "text-indigo-600", bg: "bg-indigo-50/30", border: "hover:border-indigo-200", icon: "⭐" },
          { title: "Total Feedback", value: stats.totalReviews || 0, color: "text-slate-800", bg: "bg-blue-50/30", border: "hover:border-blue-200", icon: "💬" },
          { title: "In Progress", value: totalActive, color: "text-amber-600", bg: "bg-amber-50/30", border: "hover:border-amber-200", icon: "⏳" },
          { title: "Fulfilled Jobs", value: totalCompleted, color: "text-emerald-600", bg: "bg-emerald-50/30", border: "hover:border-emerald-200", icon: "✅" }
        ].map((card, idx) => (
          <motion.div
            key={idx}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className={`p-6 bg-white rounded-2xl shadow-sm border border-slate-100 ${card.border} transition-shadow hover:shadow-md relative overflow-hidden`}
          >
            <div className={`absolute right-0 top-0 h-16 w-16 ${card.bg} rounded-bl-full`} />
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{card.title}</p>
            <div className="flex items-baseline gap-2 mt-2">
              <p className={`text-3xl font-black ${card.color} tracking-tight`}>{card.value}</p>
              {card.title === "Average Rating" && <span className="text-lg animate-bounce">{card.icon}</span>}
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Task List Workspace Layout */}
      <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 md:p-6">
        
        {/* Navigation Tabs and Section Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">Assigned Schedule</h2>
            <p className="text-xs text-slate-400 mt-0.5">Filter, monitor status updates, and view details</p>
          </div>
          
          {/* Animated Segmented Control Tabs */}
          <div className="flex p-1 bg-slate-100 rounded-xl w-full sm:w-auto relative">
            {['all', 'active', 'completed'].map((tab) => {
              const label = tab === 'all' ? `All (${tasks.length})` : tab === 'active' ? `Active (${totalActive})` : `Completed (${totalCompleted})`;
              const isSelected = activeTab === tab;
              const colorMap = { all: 'text-indigo-600', active: 'text-amber-600', completed: 'text-emerald-600' };

              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 sm:flex-none px-4 py-1.5 text-xs font-bold rounded-lg relative z-10 transition-colors duration-200 ${isSelected ? colorMap[tab] : 'text-slate-500 hover:text-slate-800'}`}
                >
                  {label}
                  {isSelected && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute inset-0 bg-white rounded-lg shadow-sm -z-10"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Task Cards Pipeline Render */}
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredTasks.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="p-12 border-2 border-dashed border-slate-200 text-center rounded-2xl col-span-full"
              >
                <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto text-2xl mb-4 font-light">
                  📁
                </div>
                <h3 className="font-bold text-slate-700 text-base">No tasks match this filter</h3>
                <p className="text-slate-400 text-xs max-w-sm mx-auto mt-1">
                  There are no matching assignments recorded here. Visit the global map feed tab to find and claim nearby open service requests.
                </p>
              </motion.div>
            ) : (
              filteredTasks.map((task) => (
                <motion.div 
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  whileHover={{ y: -2, transition: { duration: 0.2 } }}
                  key={task._id} 
                  className="group p-5 bg-slate-50/50 hover:bg-white rounded-xl border border-slate-100 hover:border-slate-200 hover:shadow-md transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start gap-4 mb-2">
                      <h3 className="font-bold text-slate-800 text-base tracking-tight line-clamp-1 group-hover:text-indigo-600 transition-colors duration-200">
                        {task.title}
                      </h3>
                      <span className={`shrink-0 px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase ${
                        task.status === 'completed' 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                          : 'bg-amber-50 text-amber-700 border border-amber-100'
                      }`}>
                        {task.status === 'accepted' ? 'Active' : task.status}
                      </span>
                    </div>
                    <p className="text-slate-500 text-xs leading-relaxed line-clamp-2 mb-4">
                      {task.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-100/80 pt-3 mt-auto text-[11px] text-slate-400 font-medium">
                    <div className="flex items-center gap-1.5 truncate max-w-[75%]">
                      <span className="text-sm shrink-0">📍</span>
                      <span className="truncate">{task.address || "Location Specified on Map"}</span>
                    </div>
                    <div className="text-right shrink-0 font-semibold text-slate-500">
                      {task.createdAt ? new Date(task.createdAt).toLocaleDateString(undefined, {month: 'short', day: 'numeric'}) : 'Recent'}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default ProviderProfile;