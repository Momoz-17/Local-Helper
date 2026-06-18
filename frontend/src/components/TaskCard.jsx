import React, { useState } from 'react';
import axios from 'axios';

const TaskCard = ({ task, currentUser, onAccept, onEdit, onDelete }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [isRated, setIsRated] = useState(!!task.rating || (task.status === 'completed' && task.rating > 0));

  // Handle case where postedBy might be an object or a string
  const postedByName = typeof task.postedBy === 'object' ? task.postedBy.name : task.postedBy;
  const isOwner = currentUser?.name === postedByName;

  const handleAcceptClick = async () => {
    setIsUpdating(true);
    await onAccept(task._id);
    setIsUpdating(false);
  };

  const handleRatingSubmit = async () => {
    if (rating === 0) return alert("Please select a star rating first.");
    setIsUpdating(true);
    try {
      // Hardcoded direct live Render backend URL endpoint
      await axios.post(`https://finance-tracker-backend-bxcf.onrender.com/api/tasks/${task._id}/rate`, {
        rating,
        feedback
      }, { withCredentials: true });
      
      setIsRated(true);
      alert("Review submitted successfully!");
    } catch (err) {
      alert(err.response?.data?.message || "Could not submit rating.");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-slate-100 transition-all relative overflow-hidden">
      <div className="flex justify-between items-start mb-4">
        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
          isRated ? 'bg-blue-100 text-blue-700' :
          task.status === 'open' ? 'bg-emerald-100 text-emerald-700' : 
          'bg-amber-100 text-amber-700'
        }`}>
          {isRated ? 'Archived' : task.status}
        </span>
        <p className="text-slate-400 text-[10px] font-black uppercase tracking-tighter">
          By {postedByName || "Anonymous"}
        </p>
      </div>
      
      <h3 className="text-xl font-black text-slate-900 mb-2 leading-tight">{task.title}</h3>
      <p className="text-slate-500 text-sm mb-6 line-clamp-2 leading-relaxed">{task.description}</p>
      
      {isOwner && task.status === 'open' && (
        <div className="flex gap-4 mb-6 pb-4 border-b border-slate-50">
          <button onClick={() => onEdit(task)} className="text-indigo-600 text-xs font-black uppercase tracking-widest hover:text-indigo-800">
            Edit
          </button>
          <button onClick={() => onDelete(task._id)} className="text-red-500 text-xs font-black uppercase tracking-widest hover:text-red-700">
            Delete
          </button>
        </div>
      )}

      {task.status === 'open' && currentUser?.role === 'provider' && !isOwner && (
        <button 
          onClick={handleAcceptClick}
          disabled={isUpdating}
          className="w-full py-3 rounded-2xl font-black text-sm bg-slate-900 text-white hover:bg-slate-800 transition-all disabled:bg-slate-200"
        >
          {isUpdating ? 'Processing...' : 'Accept Task'}
        </button>
      )}

      {task.status === 'accepted' && !isRated && currentUser?.role === 'seeker' && isOwner && (
        <div className="mt-4 pt-4 border-t border-slate-100 space-y-4">
          <div className="flex justify-center space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className={`text-3xl transition-transform active:scale-90 ${
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
            className="w-full p-3 text-sm bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
            rows="2"
            placeholder="Feedback for the volunteer..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
          />
          <button 
            onClick={handleRatingSubmit}
            disabled={isUpdating}
            className="w-full py-3 rounded-xl font-black text-xs uppercase tracking-widest bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-100"
          >
            {isUpdating ? 'Saving...' : 'Complete & Rate'}
          </button>
        </div>
      )}

      {task.status === 'accepted' && !isRated && currentUser?.role === 'provider' && (
        <div className="text-center p-4 bg-amber-50 rounded-2xl border border-amber-100">
          <p className="text-[10px] font-black uppercase tracking-widest text-amber-700">
            Waiting for Seeker Confirmation
          </p>
        </div>
      )}

      {isRated && (
        <div className="mt-4 pt-4 border-t border-slate-50 text-center">
          <div className="flex justify-center text-amber-400 text-lg mb-1">
            {'★'.repeat(task.rating || rating)}{'☆'.repeat(5 - (task.rating || rating))}
          </div>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Feedback Recorded</p>
        </div>
      )}
    </div>
  );
};

export default TaskCard;