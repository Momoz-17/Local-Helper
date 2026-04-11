import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TaskFilterMap from '../components/TaskFilterMap';

const NearbyTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [coords, setCoords] = useState({ lat: 19.0760, lng: 72.8777 }); // Default: Mumbai
  const [loading, setLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);

  const fetchTasks = async (searchCoords) => {
    setIsSearching(true);
    try {
      const res = await axios.get('https://local-helper-d3ih.onrender.com/api/tasks/nearby', {
        params: { 
          lat: searchCoords.lat, 
          lng: searchCoords.lng,
          distance: 10000 
        }
      });
      setTasks(res.data);
    } catch (err) {
      console.error("Error fetching nearby tasks:", err);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const newCoords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setCoords(newCoords);
          fetchTasks(newCoords);
          setLoading(false);
        },
        (error) => {
          console.warn("Location blocked, using default.", error);
          fetchTasks(coords); 
          setLoading(false);
        }
      );
    } else {
      fetchTasks(coords);
      setLoading(false);
    }
  }, []);

  // Helper to render address safely
  const renderAddress = (address) => {
    if (typeof address === 'string') return address;
    if (typeof address === 'object' && address !== null) {
      return address.name || address.formatted_address || "Location detail unavailable";
    }
    return "No address provided";
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-6"></div>
        <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Locating nearby requests...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <header className="mb-10">
        <h1 className="text-5xl font-black text-slate-900 tracking-tighter">Explore.</h1>
        <p className="text-slate-500 mt-2 font-medium">
          Showing help requests within <span className="text-indigo-600 font-bold">10km</span> of your marker.
        </p>
      </header>

      <section className="relative rounded-[2.5rem] overflow-hidden shadow-2xl shadow-slate-200 border border-white">
        <TaskFilterMap 
          center={coords} 
          onLocationSelect={(newCoords) => {
            setCoords(newCoords);
            fetchTasks(newCoords);
          }} 
        />
        {isSearching && (
          <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-xl border border-slate-100 text-[10px] font-black text-indigo-600 uppercase tracking-widest animate-pulse z-10">
            Refreshing Feed...
          </div>
        )}
      </section>

      <div className="mt-16">
        <div className="flex items-center justify-between mb-8 px-2">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Available Tasks</h2>
          <span className="bg-slate-100 text-slate-500 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
            {tasks.length} Results
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tasks.length > 0 ? (
            tasks.map(task => (
              <div 
                key={task._id} 
                className="p-8 bg-white border border-slate-50 rounded-[2rem] shadow-sm hover:shadow-xl hover:shadow-slate-100 transition-all group cursor-pointer"
              >
                <div className="flex justify-between items-start mb-4">
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black rounded-full uppercase tracking-widest">
                    {task.status}
                  </span>
                </div>
                <h3 className="font-black text-xl text-slate-800 group-hover:text-indigo-600 transition-colors leading-tight mb-2">
                  {task.title}
                </h3>
                <p className="text-slate-500 text-sm line-clamp-2 mb-6 font-medium leading-relaxed">
                  {task.description}
                </p>
                <div className="pt-4 border-t border-slate-50 flex items-center text-slate-400 text-[11px] font-bold uppercase tracking-tight">
                  <svg className="w-4 h-4 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="truncate">{renderAddress(task.address)}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-24 bg-slate-50/50 rounded-[3rem] border-2 border-dashed border-slate-200">
              <p className="text-slate-400 font-black uppercase tracking-widest text-xs">No tasks in this area</p>
              <p className="text-slate-400 text-sm mt-2 font-medium">Try moving the map marker to a new neighborhood.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NearbyTasks;