import React, { useState } from 'react';
import axios from 'axios';

const TaskRating = ({ taskId, onComplete }) => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) return alert("Select a rating star");
    
    setSubmitting(true);
    try {
      // Swapped out localhost for the live production Render backend address
      await axios.post(`https://finance-tracker-backend-u3qd.onrender.com/api/tasks/${taskId}/rate`, { 
        rating, 
        feedback 
      }, { withCredentials: true });
      onComplete();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-lg shadow-slate-100/50">
      <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 text-center">Share Your Experience</h4>
      
      <div className="flex justify-center gap-1 mb-6">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            className={`text-3xl transition-transform active:scale-75 ${
              (hover || rating) >= star ? 'text-amber-400' : 'text-slate-100'
            }`}
          >
            ★
          </button>
        ))}
      </div>

      <textarea
        className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-medium mb-4 resize-none"
        placeholder="Write a quick note..."
        rows="2"
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
      />

      <button
        disabled={submitting}
        className="w-full bg-slate-900 text-white py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-black disabled:bg-slate-200 transition-all"
      >
        {submitting ? "Sending..." : "Submit Review"}
      </button>
    </form>
  );
};

export default TaskRating;