import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';

const Navbar = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const location = useLocation();

  useEffect(() => {
    const checkNotifications = async () => {
      if (user?.role === 'seeker') {
        try {
          const res = await axios.get('https://local-helper-d3ih.onrender.com/api/tasks/my-requests', { withCredentials: true });
          const acceptedTasks = res.data.filter(t => t.status === 'accepted');
          setNotifications(acceptedTasks);
        } catch (err) {
          console.error("Notification fetch failed", err);
        }
      }
    };

    checkNotifications();
    const interval = setInterval(checkNotifications, 60000);
    return () => clearInterval(interval);
  }, [user]);

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white border-b border-slate-200 py-4 px-6 mb-8 sticky top-0 z-50 shadow-sm">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        
        <div className="flex items-center gap-8">
          <Link to="/" className="text-xl font-extrabold text-indigo-600 tracking-tight">
            Local <span className="text-slate-800">Helper</span>
          </Link>
          
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className={`font-medium transition-colors ${isActive('/') ? 'text-indigo-600' : 'text-slate-600 hover:text-indigo-600'}`}>
              {user?.role === 'provider' ? 'Browse Help' : 'Dashboard'}
            </Link>
            
            {user?.role === 'seeker' && (
              <>
                <Link to="/post" className="bg-indigo-600 text-white px-5 py-2 rounded-lg font-bold hover:bg-indigo-700 transition-all shadow-md active:scale-95">
                  Request Help
                </Link>
                <Link to="/seeker-profile" className={`font-medium transition-colors ${isActive('/seeker-profile') ? 'text-indigo-600' : 'text-slate-600 hover:text-indigo-600'}`}>
                  My Requests
                </Link>
              </>
            )}

            {user?.role === 'provider' && (
              <Link to="/provider-profile" className={`font-bold transition-colors ${isActive('/provider-profile') ? 'text-indigo-600 underline' : 'text-slate-600 hover:text-indigo-600'}`}>
                My Stats
              </Link>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          {user?.role === 'seeker' && (
            <div className="relative">
              <button 
                onClick={() => setShowNotifs(!showNotifs)}
                className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-full transition-all relative"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {notifications.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border-2 border-white"></span>
                  </span>
                )}
              </button>

              {showNotifs && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowNotifs(false)}></div>
                  <div className="absolute right-0 mt-3 w-72 bg-white border border-slate-100 rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-2 border-b border-slate-50 flex justify-between items-center">
                      <span className="text-xs font-black uppercase text-slate-400 tracking-widest">Notifications</span>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <p className="p-6 text-center text-sm text-slate-400 italic">No new updates.</p>
                      ) : (
                        notifications.map(task => (
                          <Link 
                            key={task._id} 
                            to="/seeker-profile" 
                            onClick={() => setShowNotifs(false)}
                            className="block px-4 py-3 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0"
                          >
                            <p className="text-sm text-slate-800 font-bold">Task Accepted!</p>
                            <p className="text-xs text-slate-500 line-clamp-1">A provider is ready for "{task.title}"</p>
                          </Link>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          <div className="relative">
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center gap-3 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-full hover:bg-slate-100 transition-all active:scale-95"
            >
              <div className="hidden sm:block text-right">
                <p className="text-sm font-bold text-slate-800 leading-none">{user?.name || 'User'}</p>
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">{user?.role}</p>
              </div>
              <div className="w-9 h-9 bg-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-sm">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
            </button>

            {isOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
                <div className="absolute right-0 mt-3 w-52 bg-white border border-slate-100 rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in duration-150">
                  <div className="px-4 py-2 border-b border-slate-50 mb-1">
                    <p className="text-xs text-slate-400 uppercase font-black tracking-widest">Logged in as</p>
                    <p className="text-sm text-slate-600 truncate font-medium">{user?.email}</p>
                  </div>
                  
                  <div className="md:hidden border-b border-slate-50 mb-1">
                    <Link to="/" onClick={() => setIsOpen(false)} className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Home</Link>
                    {user?.role === 'seeker' && <Link to="/post" onClick={() => setIsOpen(false)} className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 font-bold">Request Help</Link>}
                  </div>

                  <button 
                    onClick={() => { setIsOpen(false); onLogout(); }}
                    className="w-full text-left px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 transition-colors flex items-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Logout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;