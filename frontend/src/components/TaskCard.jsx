import React, { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';

const TaskCard = ({ task, currentUser, onAccept, onEdit, onDelete }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [isRated, setIsRated] = useState(!!task.rating || (task.status === 'completed' && task.rating > 0));

  const postedByName = typeof task.postedBy === 'object' ? task.postedBy.name : task.postedBy;
  const isOwner = currentUser?.name === postedByName;
  const acceptedProviderId = typeof task.acceptedBy === 'object' ? task.acceptedBy?._id : task.acceptedBy;
  const isAcceptedProvider = acceptedProviderId && currentUser?._id?.toString() === acceptedProviderId.toString();

  const handleAcceptClick = async () => {
    setIsUpdating(true);
    await onAccept(task._id);
    setIsUpdating(false);
  };

  const handleRatingSubmit = async () => {
    if (rating === 0) return alert("Please select a star rating node metric.");
    setIsUpdating(true);
    try {
      await axios.post(`http://localhost:5000/api/tasks/${task._id}/rate`, {
        rating,
        feedback
      }, { withCredentials: true });
      
      setIsRated(true);
      alert("Review logging successfully committed!");
    } catch (err) {
      alert(err.response?.data?.message || "Rating processing failure occurred.");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <motion.div 
      whileHover={{ y: -3 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="bg-white p-5 md:p-6 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-slate-100/70 transition-shadow duration-300 relative overflow-hidden flex flex-col justify-between h-full"
    >
      <div>
        <div className="flex justify-between items-center gap-4 mb-4">
          <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${
            isRated ? 'bg-indigo-50 text-indigo-700 border-indigo-100' :
            task.status === 'open' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
            'bg-amber-50 text-amber-700 border-amber-100'
          }`}>
            {isRated ? 'Archived' : task.status === 'accepted' ? 'Active' : task.status}
          </span>
          <p className="text-slate-400 text-[10px] font-bold truncate max-w-[60%]">
            By <span className="font-extrabold text-slate-500">{postedByName || "Anonymous"}</span>
          </p>
        </div>
        
        <h3 className="text-lg font-black text-slate-900 mb-2 leading-tight tracking-tight">{task.title}</h3>
        <p className="text-slate-500 font-medium text-xs line-clamp-3 leading-relaxed mb-6">{task.description}</p>
      </div>
      
      <div className="mt-auto space-y-4">
        {/* Owner Modification Console Controls */}
        {isOwner && task.status === 'open' && (
          <div className="flex gap-4 pt-3 border-t border-slate-100">
            <button onClick={() => onEdit(task)} className="text-indigo-600 text-[10px] font-black uppercase tracking-widest hover:text-indigo-800 transition-colors cursor-pointer">
              Edit Ticket
            </button>
            <button onClick={() => onDelete(task._id)} className="text-red-500 text-[10px] font-black uppercase tracking-widest hover:text-red-700 transition-colors cursor-pointer">
              Delete Forever
            </button>
          </div>
        )}

        {/* Global Dispatch Controls for Field Providers */}
        {task.status === 'open' && currentUser?.role === 'provider' && !isOwner && (
          <button 
            onClick={handleAcceptClick}
            disabled={isUpdating}
            className="w-full py-3 rounded-xl font-black text-xs uppercase tracking-widest bg-slate-900 text-white hover:bg-slate-800 transition-all disabled:bg-slate-100 disabled:text-slate-400 cursor-pointer"
          >
            {isUpdating ? 'Assigning node...' : 'Accept Assignment'}
          </button>
        )}

        {/* Closing Evaluation Block Interface for Client Seekers */}
        {task.status === 'accepted' && !isRated && currentUser?.role === 'seeker' && isOwner && (
          <div className="mt-4 pt-4 border-t border-slate-100 space-y-3.5">
            <div className="flex justify-center gap-1 select-none">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className={`text-2xl transition-transform duration-100 active:scale-75 cursor-pointer ${
                    (hover || rating) >= star ? 'text-amber-400' : 'text-slate-200'
                  }`}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHover(star)}
                  onMouseLeave={() => setHover(0)}
                >
                  ★
                </button>
              ))}
            </div>
            <textarea
              className="w-full p-3 text-xs bg-slate-50 font-medium border border-transparent focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-50 outline-none rounded-xl resize-none transition-all placeholder:text-slate-300 leading-normal"
              rows="2"
              placeholder="Record operational field notes or provider feedback details..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
            />
            <button 
              onClick={handleRatingSubmit}
              disabled={isUpdating}
              className="w-full py-3 rounded-xl font-black text-[10px] uppercase tracking-widest bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-100 transition-all cursor-pointer"
            >
              {isUpdating ? 'Closing Ticket...' : 'Complete & Rate Workflow'}
            </button>
          </div>
        )}

        {/* Status Tracker: Verification States */}
        {task.status === 'accepted' && !isRated && currentUser?.role === 'provider' && isAcceptedProvider && (
          <div className="text-center p-3 bg-amber-50/50 rounded-xl border border-amber-100/70 select-none">
            <p className="text-[9px] font-black uppercase tracking-wider text-amber-700">
              Awaiting Client Verification Signature
            </p>
          </div>
        )}

        {/* Closed Evaluation Summary Cards */}
        {isRated && (
          <div className="mt-4 pt-4 border-t border-slate-100 text-center select-none">
            <div className="flex justify-center text-amber-400 text-base mb-1 tracking-tighter">
              {'★'.repeat(task.rating || rating)}{'☆'.repeat(5 - (task.rating || rating))}
            </div>
            <p className="text-[9px] text-slate-400 font-black uppercase tracking-wider">Metrics Logged</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default TaskCard;