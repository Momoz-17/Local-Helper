import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import TaskRating from '../components/TaskRating';

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
      console.error("Error fetching operations index:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyRequests();
  }, []);

  const handleConfirmCompletion = async (taskId) => {
    if (!window.confirm("Confirm that you have safely received the help requested?")) return;
    
    try {
      await axios.patch(`http://localhost:5000/api/tasks/${taskId}/complete`, {}, { 
        withCredentials: true 
      });
      fetchMyRequests();
    } catch (err) {
      alert("Operational closure confirmation failed.");
    }
  };

  // Layout Animation Presets
  const listContainerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.06 } }
  };

  const itemCardVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 260, damping: 24 } }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-slate-50/40">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-14 h-14 border-4 border-indigo-100 border-t-indigo-600 rounded-full"
        />
        <p className="mt-4 text-xs font-bold text-slate-400 tracking-widest uppercase animate-pulse">
          Assembling Client Dashboard...
        </p>
      </div>
    );
  }

  const inProgress = myRequests.filter(t => t.status === 'accepted');
  const pending = myRequests.filter(t => t.status === 'open');
  const history = myRequests.filter(t => t.status === 'completed');

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-7xl mx-auto p-4 md:p-8 min-h-screen"
    >
      {/* Welcome Banner */}
      <div className="mb-12 border-b border-slate-100 pb-8">
        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
          Client Operations Control
        </span>
        <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter mt-3 mb-1">
          Hi, {user?.name || 'Seeker'}!
        </h2>
        <p className="text-slate-500 font-medium text-sm md:text-base">
          Track outstanding tickets, establish secure communication channels, and review completed service pipelines.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* OPERATIONAL MANAGEMENT MATRIX BOARDS */}
        <div className="lg:col-span-2 space-y-10">
          
          {/* SECTION A: IN PROGRESS FLOWS */}
          <section>
            <h3 className="text-xs font-black uppercase tracking-widest mb-4 text-emerald-600 flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Active Helpers Matrix ({inProgress.length})
            </h3>
            
            <AnimatePresence mode="popLayout">
              {inProgress.length === 0 ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-slate-50/50 border-2 border-dashed border-slate-200 p-10 rounded-[2rem] text-center">
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">No active deployment connections found</p>
                </motion.div>
              ) : (
                <motion.div variants={listContainerVariants} initial="hidden" animate="visible" className="space-y-4">
                  {inProgress.map(task => (
                    <motion.div 
                      layout
                      variants={itemCardVariants}
                      key={task._id} 
                      className="bg-white border border-slate-100 p-5 md:p-6 rounded-[2rem] shadow-sm hover:shadow-md transition-all duration-300"
                    >
                      <div className="flex justify-between items-start gap-4 mb-4">
                        <div>
                          <h4 className="font-extrabold text-slate-900 text-xl tracking-tight leading-tight">{task.title}</h4>
                          <span className="mt-1.5 inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                            Volunteer Dispatched
                          </span>
                        </div>
                      </div>
                      
                      <div className="bg-slate-50/70 rounded-2xl p-4 border border-slate-100/80">
                        <div className="flex items-center gap-3.5 mb-4">
                          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center text-white text-base font-black shadow-sm uppercase">
                            {task.acceptedBy?.name ? task.acceptedBy.name.substring(0, 2) : 'VP'}
                          </div>
                          <div>
                            <p className="text-slate-900 font-bold text-sm leading-tight">{task.acceptedBy?.name || "Assigned Volunteer"}</p>
                            <p className="text-slate-400 text-[10px] font-semibold tracking-wide mt-0.5">Verified Local Specialist Node</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {task.acceptedBy?.phone?.trim() ? (
                            <a href={`tel:${task.acceptedBy.phone.trim()}`} className="flex items-center justify-center gap-1.5 bg-white border border-slate-200 text-slate-600 py-2.5 rounded-xl text-xs font-bold hover:bg-slate-100 transition-all select-none">
                              📞 Contact Provider
                            </a>
                          ) : (
                            <button type="button" disabled className="flex items-center justify-center gap-1.5 bg-slate-100 border border-slate-200 text-slate-400 py-2.5 rounded-xl text-xs font-bold cursor-not-allowed select-none">
                              📞 Contact Provider
                            </button>
                          )}
                          <button 
                            onClick={() => handleConfirmCompletion(task._id)}
                            className="bg-emerald-600 text-white py-2.5 rounded-xl text-xs font-bold hover:bg-emerald-700 shadow-md shadow-emerald-100 transition-all cursor-pointer"
                          >
                            Confirm Help Received
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </section>

          {/* SECTION B: PENDING POOLS */}
          <section>
            <h3 className="text-xs font-black uppercase tracking-widest mb-4 text-slate-400 tracking-wider">
              Waiting for Grid Responses ({pending.length})
            </h3>
            <AnimatePresence mode="popLayout">
              {pending.length === 0 ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-slate-50/50 border-2 border-dashed border-slate-200 p-8 rounded-2xl text-center">
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">All tickets successfully resolved or accepted</p>
                </motion.div>
              ) : (
                <motion.div layout variants={listContainerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {pending.map(task => (
                    <motion.div 
                      layout
                      variants={itemCardVariants}
                      key={task._id} 
                      className="bg-white border border-slate-100 p-5 rounded-xl shadow-sm hover:border-slate-200 transition-all flex flex-col justify-between"
                    >
                      <div>
                        <h4 className="font-extrabold text-slate-800 text-base tracking-tight line-clamp-1">{task.title}</h4>
                        <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed font-medium">{task.description}</p>
                      </div>
                      <div className="mt-4 flex items-center text-[9px] font-bold uppercase tracking-wide text-slate-400 bg-slate-50 border border-slate-100 w-fit px-2 py-0.5 rounded-md truncate max-w-full">
                        <span className="mr-1">📍</span> <span className="truncate">{task.address || "Local Domain"}</span>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        </div>

        {/* SIDEBAR ARCHIVE HISTORY FEED */}
        <aside className="lg:border-l lg:pl-6 border-slate-100 sticky top-6">
          <h3 className="text-xs font-black uppercase tracking-widest mb-4 text-slate-800 tracking-wider">
            Operational Archive History
          </h3>
          
          <AnimatePresence mode="popLayout">
            {history.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-slate-400 text-xs font-medium italic p-4 bg-slate-50/60 rounded-xl border border-slate-100">
                No past completed operational entries recorded.
              </motion.div>
            ) : (
              <motion.div variants={listContainerVariants} initial="hidden" animate="visible" className="space-y-4">
                {history.map(task => (
                  <motion.div 
                    layout
                    variants={itemCardVariants}
                    key={task._id} 
                    className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm transition-all hover:shadow-md"
                  >
                    <div className="flex justify-between items-center gap-4 mb-2">
                      <p className="font-extrabold text-slate-800 text-sm leading-tight truncate">{task.title}</p>
                      <span className="text-[9px] bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 text-slate-500 font-black uppercase tracking-wider shrink-0">
                        Done
                      </span>
                    </div>
                    
                    <p className="text-[10px] text-slate-400 font-bold">
                      Archived: {new Date(task.updatedAt).toLocaleDateString(undefined, {month: 'short', day: 'numeric', year: 'numeric'})}
                    </p>

                    <div className="mt-3 pt-3 border-t border-slate-50">
                      {!task.rating ? (
                        <TaskRating taskId={task._id} onComplete={fetchMyRequests} />
                      ) : (
                        <div className="p-3 bg-indigo-50/40 rounded-xl border border-indigo-100/50">
                          <div className="flex text-amber-400 text-xs tracking-tight mb-1">
                            {'★'.repeat(task.rating)}{'☆'.repeat(5 - task.rating)}
                          </div>
                          {task.feedback && (
                            <p className="text-[11px] text-slate-600 font-medium italic leading-relaxed">
                              "{task.feedback}"
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </aside>
      </div>
    </motion.div>
  );
};

export default SeekerProfile;