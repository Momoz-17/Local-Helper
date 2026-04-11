import React, { useEffect, useState } from 'react';
import axios from 'axios';
import TaskCard from './TaskCard';

const TaskFeed = ({ currentUser }) => {
  const [tasks, setTasks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingTask, setEditingTask] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', description: '' });

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/tasks');
      setTasks(response.data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setLoading(false);
    }
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

  if (loading) return <div className="p-20 text-center font-black uppercase tracking-widest text-slate-300 animate-pulse">Scanning Community Feed...</div>;

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Edit Modal */}
      {editingTask && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl p-10 border border-slate-100">
            <h2 className="text-3xl font-black text-slate-900 mb-2">Edit Request</h2>
            <p className="text-slate-500 mb-8 font-medium">Update your help request details.</p>
            <form onSubmit={handleUpdateTask} className="space-y-6">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2 mb-2 block">Task Title</label>
                <input 
                  className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-indigo-500 outline-none font-bold"
                  value={editForm.title}
                  onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2 mb-2 block">Description</label>
                <textarea 
                  className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-indigo-500 outline-none font-medium min-h-[120px] resize-none"
                  value={editForm.description}
                  onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                  required
                />
              </div>
              <div className="flex gap-4">
                <button type="button" onClick={() => setEditingTask(null)} className="flex-1 py-4 bg-slate-100 text-slate-500 font-black rounded-2xl hover:bg-slate-200 uppercase tracking-widest text-xs transition-all">Cancel</button>
                <button type="submit" className="flex-1 py-4 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 shadow-xl shadow-indigo-100 uppercase tracking-widest text-xs transition-all">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
        <div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter mb-2">Feed.</h1>
          <p className="text-slate-500 font-medium text-lg">Real-time help requests in your area.</p>
        </div>
        
        <div className="relative group">
          <input 
            type="text"
            placeholder="Search tasks..."
            className="w-full md:w-80 pl-12 pr-6 py-4 rounded-2xl bg-white border border-slate-100 focus:ring-4 focus:ring-indigo-50/50 focus:border-indigo-200 outline-none transition-all shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <span className="absolute left-5 top-1/2 -translate-y-1/2 grayscale opacity-50 group-focus-within:grayscale-0 group-focus-within:opacity-100 transition-all">🔍</span>
        </div>
      </div>

      {filteredTasks.length === 0 ? (
        <div className="bg-slate-50/50 py-32 rounded-[3rem] border-2 border-dashed border-slate-100 text-center">
          <p className="text-slate-400 font-black uppercase tracking-widest">No tasks found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTasks.map(task => (
            <TaskCard 
              key={task._id} 
              task={task} 
              currentUser={currentUser} 
              onAccept={handleAcceptTask} 
              onEdit={() => handleEditClick(task)}
              onDelete={handleDeleteTask}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TaskFeed;