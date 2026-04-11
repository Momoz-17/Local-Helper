import React, { useState } from 'react';

const EditTaskModal = ({ task, onClose, onUpdate }) => {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [address, setAddress] = useState(task.address || ""); // Added address

  const handleSubmit = (e) => {
    e.preventDefault();
    // Pass the specific ID and new fields
    onUpdate(task._id, { title, description, address });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden">
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-slate-900">Edit Help Request</h2>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl">&times;</button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Title</label>
              <input 
                type="text" 
                className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Details</label>
              <textarea 
                className="w-full px-4 py-3 rounded-xl border border-slate-200 min-h-[100px] outline-none"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Location/Address</label>
              <input 
                type="text" 
                className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
            </div>

            <div className="flex gap-3">
              <button type="button" onClick={onClose} className="flex-1 py-3 bg-slate-100 rounded-xl font-bold">Cancel</button>
              <button type="submit" className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold">Save Changes</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditTaskModal;