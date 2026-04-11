import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TaskRating from '../components/TaskRating'; // The component that uses StarRating

const SeekerProfile = ({ user }) => {
  const [myRequests, setMyRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMyRequests = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/tasks/my-requests', { 
        withCredentials: true 
      });
      setMyRequests(res.data);
    } catch (err) {
      console.error("Error fetching requests:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyRequests();
  }, []);

  const handleConfirmCompletion = async (taskId) => {
    if (!window.confirm("Confirm that you have received the help requested?")) return;
    
    try {
      await axios.patch(`http://localhost:5000/api/tasks/${taskId}/complete`, {}, { 
        withCredentials: true 
      });
      fetchMyRequests();
      alert("Task marked as completed! Please take a moment to review your provider.");
    } catch (err) {
      alert("Error confirming completion");
    }
  };

  if (loading) return <div className="p-20 text-center text-slate-400 animate-pulse font-bold uppercase tracking-widest">Loading Dashboard...</div>;

  const inProgress = myRequests.filter(t => t.status === 'accepted');
  const pending = myRequests.filter(t => t.status === 'open');
  const history = myRequests.filter(t => t.status === 'completed');

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-12">
        <h2 className="text-4xl font-black text-slate-900 tracking-tight">
          Hi, {user?.name || 'Seeker'}!
        </h2>
        <p className="text-slate-500 text-lg">Manage your help requests and community connections.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-12">
          
          {/* 1. IN PROGRESS SECTION */}
          <section>
            <h3 className="text-sm font-black uppercase tracking-widest mb-6 text-emerald-600 flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span>
              Active Helpers ({inProgress.length})
            </h3>
            {inProgress.length === 0 ? (
              <div className="bg-slate-50 border-2 border-dashed border-slate-200 p-10 rounded-3xl text-center">
                <p className="text-slate-400 font-medium">No one has accepted your requests yet.</p>
              </div>
            ) : (
              inProgress.map(task => (
                <div key={task._id} className="bg-white border border-slate-200 p-8 rounded-[2rem] shadow-xl shadow-slate-100/50 mb-6 transition-all hover:border-emerald-200">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h4 className="font-black text-slate-900 text-2xl mb-1">{task.title}</h4>
                      <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        In Progress
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-indigo-100">
                        {task.acceptedBy?.name?.charAt(0) || 'P'}
                      </div>
                      <div>
                        <p className="text-slate-900 font-black text-lg leading-none">{task.acceptedBy?.name || "Volunteer"}</p>
                        <p className="text-slate-500 text-xs font-bold mt-1">Verified Community Provider</p>
                      </div>
                    </div>
                    
                    <div className="grid sm:grid-cols-2 gap-4">
                      <a href={`tel:${task.acceptedBy?.phone}`} className="flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 py-3 rounded-xl font-black text-sm hover:bg-slate-100 transition-all">
                        📞 {task.acceptedBy?.phone || "No Phone"}
                      </a>
                      <button 
                        onClick={() => handleConfirmCompletion(task._id)}
                        className="bg-emerald-600 text-white py-3 rounded-xl font-black text-sm hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200"
                      >
                        Confirm Help Received
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </section>

          {/* 2. PENDING SECTION */}
          <section>
            <h3 className="text-sm font-black uppercase tracking-widest mb-6 text-slate-400">
              Waiting for Response ({pending.length})
            </h3>
            <div className="grid sm:grid-cols-2 gap-6">
              {pending.map(task => (
                <div key={task._id} className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                  <h4 className="font-bold text-slate-800 text-lg">{task.title}</h4>
                  <p className="text-sm text-slate-500 mt-2 line-clamp-2 leading-relaxed">{task.description}</p>
                  <div className="mt-4 flex items-center text-[10px] font-black uppercase tracking-tighter text-slate-400 bg-slate-50 w-fit px-2 py-1 rounded">
                    📍 {task.address || "Local Area"}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* 3. HISTORY SIDEBAR */}
        <aside className="lg:border-l lg:pl-10 border-slate-100">
          <h3 className="text-sm font-black uppercase tracking-widest mb-6 text-slate-800">History</h3>
          <div className="space-y-6">
            {history.length === 0 ? (
              <p className="text-sm text-slate-400 italic">No completed requests yet.</p>
            ) : (
              history.map(task => (
                <div key={task._id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm transition-all hover:shadow-md">
                  <div className="flex justify-between items-center mb-3">
                    <p className="font-black text-slate-800 leading-tight">{task.title}</p>
                    <span className="text-[10px] bg-slate-100 px-2 py-1 rounded-md text-slate-500 font-black uppercase">Done</span>
                  </div>
                  
                  <p className="text-[10px] text-slate-400 font-bold">
                    Finished {new Date(task.updatedAt).toLocaleDateString()}
                  </p>

                  <div className="mt-4 pt-4 border-t border-slate-50">
                    {!task.rating ? (
                      <TaskRating taskId={task._id} onComplete={fetchMyRequests} />
                    ) : (
                      <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100">
                        <div className="flex text-amber-400 text-sm mb-1">
                          {'★'.repeat(task.rating)}{'☆'.repeat(5 - task.rating)}
                        </div>
                        {task.feedback && (
                          <p className="text-xs text-slate-600 italic leading-relaxed">
                            "{task.feedback}"
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};

export default SeekerProfile;