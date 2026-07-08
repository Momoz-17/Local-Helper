import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

const Home = ({ user }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('seeker');
  const shouldReduceMotion = useReducedMotion();

  const systemFeatures = {
    seeker: [
      { title: "Describe Your Request", desc: "Type out what you need help with—plumbing, moving, tutoring, or cleaning.", icon: "✍️" },
      { title: "Set Your Flexible Budget", desc: "Decide what compensation makes sense for your dynamic local market rates.", icon: "💰" },
      { title: "Accept Verified Matches", desc: "Browse nearby neighborhood providers with email validated background nodes.", icon: "🛡️" }
    ],
    provider: [
      { title: "Browse Active Feeds", desc: "Check out a real-time local task feed targeted exactly to your neighborhood.", icon: "🔍" },
      { title: "Claim Tasks Instantly", desc: "Accept assignments with a single click and trigger notification handshakes.", icon: "⚡" },
      { title: "Build Your Reputation", desc: "Accumulate completed task counts and level up your status metrics.", icon: "📈" }
    ]
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased relative overflow-hidden pb-24">
      {/* Decorative Top Mesh Network Gradients */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-200/20 rounded-full blur-3xl -z-10" />
      <div className="absolute top-40 left-[-200px] w-[500px] h-[500px] bg-sky-200/20 rounded-full blur-3xl -z-10" />

      <div className="max-w-7xl mx-auto px-6 pt-12">
        {/* HERO HERO CONTAINER WITH SPLIT SIDE PREVIEW */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center min-h-[70vh]">
          
          {/* LEFT SIDE: Copy and Core CTAs */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left flex flex-col items-center lg:items-start">
            <div className="inline-flex items-center gap-2 bg-white border border-slate-200/80 px-3.5 py-1.5 rounded-full shadow-xs">
              <span className="flex h-2 w-2 relative">
                <span className={shouldReduceMotion ? "absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" : "animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"}></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600"></span>
              </span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">Local Area Network Active</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-950 leading-[1.1]">
              Connecting those who <span className="bg-gradient-to-r from-indigo-600 to-indigo-500 bg-clip-text text-transparent">need help</span> with those who provide it.
            </h1>

            <p className="text-base sm:text-lg text-slate-500 font-medium max-w-xl leading-relaxed">
              A high-fidelity coordination portal for neighborhood management. Post household items, check completion statuses, and network securely.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row gap-3 w-full max-w-md lg:max-w-none">
              {user ? (
                <button
                  onClick={() => navigate(user.role === 'provider' ? '/feed' : '/seeker-profile')}
                  className="w-full sm:w-auto px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-lg cursor-pointer"
                >
                  Enter Dashboard Workspace
                </button>
              ) : (
                <>
                  <button
                    onClick={() => navigate('/login')}
                    className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-xl shadow-indigo-100 cursor-pointer"
                  >
                    Get Started Now
                  </button>
                  <button
                    onClick={() => navigate('/nearby-tasks')}
                    className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/80 text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-xs cursor-pointer"
                  >
                    View Active Tasks
                  </button>
                </>
              )}
            </div>

            {/* Quick Micro Platform Metrics */}
            <div className="pt-8 grid grid-cols-3 gap-6 border-t border-slate-200/60 w-full">
              <div>
                <p className="text-2xl font-black text-slate-950">2,400+</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Completed Tasks</p>
              </div>
              <div>
                <p className="text-2xl font-black text-slate-950">100%</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Verified Nodes</p>
              </div>
              <div>
                <p className="text-2xl font-black text-slate-950">&lt; 15m</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Average Response</p>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: Interactive UI Card Workspace Mockup */}
          <div className="lg:col-span-6 relative flex items-center justify-center min-h-[400px]">
            {/* Ambient Background Glow Layer */}
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/5 to-sky-500/5 rounded-3xl blur-2xl" />

            {/* Simulated Live Interface Card Layer 1 */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="w-full max-w-md bg-white border border-slate-200/80 rounded-2xl shadow-2xl p-6 relative z-10 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <p className="text-xs font-black text-slate-900 uppercase tracking-wider">Recent Local Post</p>
                </div>
                <span className="text-[10px] font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-500">2 mins ago</span>
              </div>
              
              <div>
                <h4 className="font-bold text-slate-900 text-base">Repair broken deck stairs alignment</h4>
                <p className="text-xs text-slate-400 font-medium mt-0.5">Location baseline: Sector 4 Outer Ring road</p>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-indigo-100 text-indigo-600 font-bold rounded-full text-[10px] flex items-center justify-center">M</div>
                  <p className="text-xs font-bold text-slate-600">Mohit G. (Seeker)</p>
                </div>
                <span className="text-xs font-black text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-lg">₹1,500</span>
              </div>
            </motion.div>

            {/* Simulated Float Badge Layer 2 */}
            <motion.div 
              animate={shouldReduceMotion ? false : { y: [0, -8, 0] }}
              transition={shouldReduceMotion ? { duration: 0 } : { repeat: Infinity, duration: 6, ease: "easeInOut" }}
              className="absolute top-4 right-4 sm:right-12 bg-slate-950 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 z-20 border border-slate-800"
            >
              <div className="p-1 bg-emerald-500 rounded-lg text-white">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none">Task Completed</p>
                <p className="text-xs font-bold text-white mt-1">Provider premium payload payout sent</p>
              </div>
            </motion.div>

            {/* Simulated Float Badge Layer 3 */}
            <motion.div 
              animate={shouldReduceMotion ? false : { y: [0, 8, 0] }}
              transition={shouldReduceMotion ? { duration: 0 } : { repeat: Infinity, duration: 5, ease: "easeInOut", delay: 0.5 }}
              className="absolute bottom-4 left-4 sm:left-8 bg-white border border-slate-200/80 px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 z-20"
            >
              <span className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold">🛡️ Verified</span>
              <p className="text-xs font-black text-slate-800">Email Verification Finalized</p>
            </motion.div>
          </div>
        </div>

        {/* INTERACTIVE WORKSPACE FEATURES SWITCHER */}
        <section className="mt-32 border-t border-slate-200/60 pt-16">
          <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-black text-slate-950 tracking-tight">Tailored workspace modules</h2>
              <p className="text-sm text-slate-400 font-medium mt-1">Select your account profile configuration parameters below.</p>
            </div>
            
            {/* Segmented Controller Tab Toggles */}
            <div className="bg-slate-200/60 p-1 rounded-xl flex gap-1 relative select-none w-full max-w-xs border border-slate-200">
              <button 
                onClick={() => setActiveTab('seeker')}
                className={`flex-1 py-2 text-xs font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer ${activeTab === 'seeker' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500 hover:text-slate-900'}`}
              >
                For Seekers
              </button>
              <button 
                onClick={() => setActiveTab('provider')}
                className={`flex-1 py-2 text-xs font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer ${activeTab === 'provider' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500 hover:text-slate-900'}`}
              >
                For Providers
              </button>
            </div>
          </div>

          {/* Animated Features Grid Content Panel */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <AnimatePresence mode="wait">
              {systemFeatures[activeTab].map((feature, idx) => (
                <motion.div
                  key={`${activeTab}-${idx}`}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.25, delay: idx * 0.05 }}
                  className="bg-white border border-slate-200/70 rounded-2xl p-6 shadow-sm/50 hover:border-slate-300 transition-colors"
                >
                  <div className="w-10 h-10 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center text-lg mb-4 shadow-inner">
                    {feature.icon}
                  </div>
                  <h3 className="text-base font-bold text-slate-950 mb-1.5">{feature.title}</h3>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">{feature.desc}</p>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;