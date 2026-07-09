import React, { useState } from 'react';
import axios from 'axios';

const AcceptTaskButton = ({ taskId, currentUser, onTaskAccepted }) => {
  const [loading, setLoading] = useState(false);

  if (currentUser?.role !== 'provider') {
    return null; 
  }

  const handleAccept = async () => {
    if (!window.confirm("Are you sure you want to accept this task?")) return;
    
    setLoading(true);
    try {
      // Changed the URL from Render to localhost for local development
      const response = await axios.patch(
        `https://local-helper-backend.onrender.com/api/tasks/${taskId}/accept`, 
        {}, 
        { withCredentials: true }
      );
      
      if (onTaskAccepted) {
        onTaskAccepted(response.data.task); // Pass the updated task back to the parent
      }
      alert("Task successfully accepted!");
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Could not accept task.";
      alert(`Error: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleAccept}
      disabled={loading}
      className={`px-6 py-2 rounded-xl font-bold transition-all shadow-md 
        ${loading 
          ? 'bg-slate-300 cursor-not-allowed' 
          : 'bg-green-600 text-white hover:bg-green-700 active:scale-95'
        }`}
    >
      {loading ? 'Processing...' : 'Accept Task'}
    </button>
  );
};

export default AcceptTaskButton;