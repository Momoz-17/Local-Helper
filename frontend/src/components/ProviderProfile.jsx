import React, { useState, useEffect } from 'react';
import axios from 'axios';

const RatingDisplay = ({ rating, totalReviews }) => (
  <div className="flex items-center gap-3 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
    <div className="flex text-yellow-400 text-xl">
      {[1, 2, 3, 4, 5].map((s) => <span key={s}>{rating >= s ? '★' : '☆'}</span>)}
    </div>
    <div>
      <span className="font-bold text-slate-900">{Number(rating).toFixed(1)}</span>
      <span className="text-slate-400 text-xs ml-1">({totalReviews} reviews)</span>
    </div>
  </div>
);

const ProviderProfile = ({ user }) => {
  const [myTasks, setMyTasks] = useState([]);
  const [stats, setStats] = useState({ averageRating: 0, totalReviews: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?._id) return;
      try {
        const [tasksRes, statsRes] = await Promise.all([
          axios.get('https://local-helper-d3ih.onrender.com/api/tasks/my-tasks', { withCredentials: true }),
          axios.get(`https://local-helper-d3ih.onrender.com/api/users/${user._id}/stats`)
        ]);
        setMyTasks(tasksRes.data);
        setStats(statsRes.data);
      } catch (err) {
        console.error("Fetch error", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user?._id]);

  const handleComplete = async (taskId) => {
    if (!window.confirm("Mark this task as finished?")) return;
    try {
      await axios.patch(`https://local-helper-d3ih.onrender.com/api/tasks/${taskId}/complete`, {}, { withCredentials: true });
      setMyTasks(prev => prev.map(t => t._id === taskId ? { ...t, status: 'completed', updatedAt: new Date() } : t));
    } catch (err) {
      alert("Error updating task status.");
    }
  };

  const accepted = myTasks.filter(t => t.status === 'accepted');
  const completed = myTasks.filter(t => t.status === 'completed');

  if (loading) return <div className="p-20 text-center text-slate-400 animate-pulse">Loading dashboard...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900">Hi, {user?.name}! 👋</h2>
          <p className="text-slate-500 mt-1">Here is your community impact summary.</p>
        </div>
        <RatingDisplay rating={stats.averageRating} totalReviews={stats.totalReviews} />
      </div>
      
      <div className="grid lg:grid-cols-3 gap-10">
        <section className="lg:col-span-2">
          <h3 className="text-xl font-bold mb-6 text-indigo-600 flex items-center gap-2">
            Tasks in Progress <span className="bg-indigo-100 px-3 py-0.5 rounded-full text-sm">{accepted.length}</span>
          </h3>
          
          {accepted.length === 0 ? (
            <div className="bg-white border-2 border-dashed border-slate-200 p-12 rounded-3xl text-center">
              <p className="text-slate-500 font-medium">No active tasks. Check the feed to help out!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {accepted.map(task => (
                <div key={task._id} className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
                  <h4 className="font-bold text-slate-900 text-xl mb-2">{task.title}</h4>
                  <p className="text-slate-600 mb-6">{task.description}</p>
                  
                  <div className="bg-slate-50 rounded-2xl p-5 mb-6 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                        {task.postedBy?.name?.charAt(0) || 'U'}
                      </div>
                      <p className="font-bold text-slate-800">{task.postedBy?.name || "User"}</p>
                    </div>
                    <p className="text-sm text-slate-600">📍 <span className="font-bold">Address:</span> {task.address}</p>
                    <p className="text-sm text-slate-600">📞 <span className="font-bold">Phone:</span> {task.postedBy?.phone || "N/A"}</p>
                  </div>

                  <div className="flex gap-3">
                    <a href={`tel:${task.postedBy?.phone}`} className="flex-1 bg-white border border-slate-200 text-slate-700 py-3 rounded-2xl font-bold hover:bg-slate-50 text-center">Call Seeker</a>
                    <button onClick={() => handleComplete(task._id)} className="flex-[2] bg-indigo-600 text-white py-3 rounded-2xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100">Mark Finished</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <h3 className="text-xl font-bold mb-6 text-slate-800">History</h3>
          <div className="bg-slate-50 rounded-3xl p-4 border border-slate-100 space-y-4">
            {completed.length === 0 ? (
              <p className="text-sm text-slate-400 italic text-center py-4">No completed tasks yet.</p>
            ) : (
              completed.map(task => (
                <div key={task._id} className="bg-white p-4 rounded-2xl border border-slate-100">
                  <p className="font-bold text-slate-800 leading-tight">{task.title}</p>
                  <p className="text-[10px] text-slate-400 uppercase font-black mt-1">
                    {new Date(task.updatedAt).toLocaleDateString()}
                  </p>
                  {task.rating && (
                    <div className="text-xs font-bold text-yellow-500 mt-2">
                      Rating: {'★'.repeat(task.rating)}{'☆'.repeat(5 - task.rating)}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default ProviderProfile;