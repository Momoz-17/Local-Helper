import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import TaskCard from './TaskCard';

const TaskFeed = ({ currentUser }) => {
  const [tasks, setTasks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingTask, setEditingTask] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', description: '' });
  
  // Real-time Feed Mode: 'global' or 'nearby'
  const [feedMode, setFeedMode] = useState('global');
  const [geoError, setGeoError] = useState(null);

  useEffect(() => {
    if (feedMode === 'global') {
      fetchGlobalTasks();
    } else {
      fetchNearbyTasks();
    }
  }, [feedMode]);

  const fetchGlobalTasks = async () => {
    setLoading(true);
    setGeoError(null);
    try {
      const response = await axios.get('http://localhost:5000/api/tasks', { withCredentials: true });
      setTasks(response.data);
    } catch (error) {
      console.error("Error fetching global tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchNearbyTasks = () => {
    if (!navigator.geolocation) {
      setGeoError("Geolocation is not supported by your browser.");
      setFeedMode('global');
      return;
    }

    setLoading(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { longitude, latitude } = position.coords;
          // Calls your backend location endpoint with coordinates
          const response = await axios.get(
            `http://localhost:5000/api/tasks/nearby?lng=${longitude}&lat=${latitude}`, 
            { withCredentials: true }
          );
          setTasks(response.data);
        } catch (error) {
          console.error("Error fetching nearby tasks:", error);
          setGeoError("Failed to fetch location-specific tasks.");
          setFeedMode('global');
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        console.error("Geolocation tracking failed:", error);
        setGeoError("Permission denied. Could not access your current location.");
        setFeedMode('global');
        setLoading(false);
      }
    );
  };

  const handleAcceptTask = async (taskId) => {
    try {
      const response = await axios.patch(`http://localhost:5000/api/tasks/${taskId}/accept`, {}, { withCredentials: true });
      setTasks(prev => prev.map(t => t._id === taskId ? response.data : t));
    } catch (error) {
      alert(error.response?.data?.message || "Could not accept task.");
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Delete this request forever?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/tasks/${taskId}`, { withCredentials: true });
      setTasks(prev => prev.filter(task => task._id !== taskId));
    } catch (error) {
      alert(error.response?.data?.message || "Failed to delete task");
    }
  };

  const handleEditClick = (task) => {
    setEditingTask(task._id);
    setEditForm({ title: task.title, description: task.description });
  };

  const handleUpdateTask = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(`http://localhost:5000/api/tasks/${editingTask}`, editForm, { withCredentials: true });
      setTasks(prev => prev.map(t => t._id === editingTask ? response.data : t));
      setEditingTask(null);
    } catch (error) {
      alert(error.response?.data?.message || "Failed to update task");
    }
  };

  const filteredTasks = tasks.filter(task => 
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Framer Motion variant mappings
  const feedContainerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-slate-50/40">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-14 h-14 border-4 border-indigo-100 border-t-indigo-600 rounded-full"
        />
        <motion.p 
          initial={{ opacity: 0.5 }}
          animate={{ opacity: 1 }}
          transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut", repeatType: "reverse" }}
          className="mt-4 text-xs font-bold text-slate-500 tracking-widest uppercase"
        >
          {feedMode === 'nearby' ? "Querying Local Proximity Satellites..." : "Scanning Community Feed..."}
        </motion.p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 min-h-screen">
      
      {/* Edit Modal Component Overlay */}
      <AnimatePresence>
        {editingTask && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl p-6 md:p-10 border border-slate-100"
            >
              <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Edit Request</h2>
              <p className="text-slate-500 mb-6 text-sm font-medium">Update your active help request configurations.</p>
              
              <form onSubmit={handleUpdateTask} className="space-y-5">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 mb-2 block">Task Title</label>
                  <input 
                    className="w-full px-5 py-4 rounded-xl bg-slate-50 border border-transparent focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none font-bold text-slate-800 transition-all"
                    value={editForm.title}
                    onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 mb-2 block">Description</label>
                  <textarea 
                    className="w-full px-5 py-4 rounded-xl bg-slate-50 border border-transparent focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none font-medium text-slate-700 min-h-[120px] resize-none transition-all leading-relaxed"
                    value={editForm.description}
                    onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                    required
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setEditingTask(null)} className="flex-1 py-4 bg-slate-100 text-slate-500 font-bold rounded-xl hover:bg-slate-200 uppercase tracking-wider text-xs transition-colors">Cancel</button>
                  <button type="submit" className="flex-1 py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 uppercase tracking-wider text-xs transition-all">Save Changes</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dynamic Header & Toolbar Controller Layout */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12 border-b border-slate-100 pb-8">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
            Real-time Activity Exchange
          </span>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter mt-3 mb-1">Feed.</h1>
          <p className="text-slate-500 font-medium text-sm md:text-base">
            Discover, claim, and respond to community operations waiting in your current quadrant.
          </p>
        </div>
        
        {/* Actions Menu Container: Modes & Text Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          
          {/* Proximity Geospatial Toggle Controller Slider */}
          <div className="flex p-1 bg-slate-100 rounded-xl relative gap-1 select-none">
            {[
              { id: 'global', label: 'Global Feed', icon: '🌐' },
              { id: 'nearby', label: 'Proximity (10km)', icon: '📍' }
            ].map((mode) => {
              const isSelected = feedMode === mode.id;
              return (
                <button
                  key={mode.id}
                  onClick={() => setFeedMode(mode.id)}
                  className={`px-4 py-2 text-xs font-bold rounded-lg relative z-10 transition-colors duration-300 flex items-center gap-1.5 whitespace-nowrap ${
                    isSelected ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <span>{mode.icon}</span>
                  <span>{mode.label}</span>
                  {isSelected && (
                    <motion.div
                      layoutId="feedModeIndicator"
                      className="absolute inset-0 bg-white rounded-lg shadow-sm -z-10"
                      transition={{ type: "spring", stiffness: 380, damping: 28 }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Text String Filter Search Input Box */}
          <div className="relative group min-w-[240px]">
            <input 
              type="text"
              placeholder="Search feed index..."
              className="w-full pl-10 pr-4 py-2.5 text-xs font-medium rounded-xl bg-white border border-slate-200 focus:ring-4 focus:ring-indigo-50 focus:border-indigo-300 outline-none transition-all shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm grayscale opacity-40 group-focus-within:grayscale-0 group-focus-within:opacity-100 transition-all">🔍</span>
          </div>
        </div>
      </div>

      {geoError && (
        <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="p-4 mb-6 text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-100 rounded-xl flex items-center gap-2">
          <span>💡</span> {geoError} Falling back to global listing pool.
        </motion.div>
      )}

      {/* Grid Pipeline Board View Renderer */}
      <motion.div layout className="relative min-h-[300px]">
        <AnimatePresence mode="popLayout">
          {filteredTasks.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="bg-slate-50/40 py-24 rounded-[2.5rem] border-2 border-dashed border-slate-100 text-center flex flex-col items-center justify-center p-6"
            >
              <div className="w-14 h-14 bg-white shadow-sm rounded-full flex items-center justify-center text-xl text-slate-400 mb-3 border border-slate-100">
                ⚡
              </div>
              <p className="text-slate-700 font-bold text-sm">No tasks found matching query</p>
              <p className="text-slate-400 text-xs max-w-xs mt-1 leading-relaxed">
                {feedMode === 'nearby' 
                  ? "There are currently no location-indexed listings surrounding your exact quadrant coordinates." 
                  : "We couldn't track tasks matching those search criteria. Expand your query terminology or check back later."}
              </p>
            </motion.div>
          ) : (
            <motion.div 
              variants={feedContainerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
            >
              {filteredTasks.map(task => (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 260, damping: 25 }}
                  key={task._id}
                  className="h-full"
                >
                  <TaskCard 
                    task={task} 
                    currentUser={currentUser} 
                    onAccept={handleAcceptTask} 
                    onEdit={() => handleEditClick(task)}
                    onDelete={handleDeleteTask}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default TaskFeed;