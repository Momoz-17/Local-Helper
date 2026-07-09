import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

// Maintain state cookie persistence across local dev ports
axios.defaults.withCredentials = true;

const Auth = ({ onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState('seeker'); 
  const [step, setStep] = useState('form'); 
  const [loading, setLoading] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  
  // Base API configuration for the local development server context
  const API_URL = 'https://local-helper-backend.onrender.com/api';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',    
    address: '',  
    otp: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${API_URL}/auth/register`, { 
        ...formData,
        role: role 
      });
      setStep('otp');
      // Toast notifications would replace alerts in production. For simplicity, we use native alerts.
      alert("Verification matrix active. A 6-digit access code has been dispatched to your email endpoint.");
    } catch (err) {
      alert(err.response?.data?.message || "Registration claim denied.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/auth/verify-otp`, {
        email: formData.email,
        otp: formData.otp
      });
      alert("Account verification finalized.");
      onLoginSuccess(res.data.user); 
    } catch (err) {
      alert(err.response?.data?.message || "Invalid or expired access key.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/auth/login`, {
        email: formData.email,
        password: formData.password
      });
      onLoginSuccess(res.data.user);
    } catch (err) {
      if (err.response && err.response.status === 403 && err.response.data.isVerified === false) {
        alert(err.response.data.message);
        setStep('otp'); 
      } else {
        alert(err.response?.data?.message || "Login sequence failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Content for the rotating left-side carousel
  const testimonials = [
    { quote: "This platform streamlined my operations and doubled my client base. Truly a game-changer.", name: "Dr. Evelyn Reed", role: "Healthcare Provider" },
    { quote: "I found high-fidelity community connections that I couldn't find anywhere else. The verification is incredibly secure.", name: "Liam Chen", role: "Verification Seeker" },
    { quote: "Simple, fast, and remarkably intuitive. It provides exactly what it promises without the bloat.", name: "Samantha Wright", role: "Community Organizer" }
  ];

  // Rotate testimonials automatically every 7 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [testimonials.length]);

  // Framer Motion Animation Variants (Spring-based physics logic)
  const containerVariants = {
    hidden: { opacity: 0, scale: 0.96 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { type: 'spring', stiffness: 220, damping: 26, staggerChildren: 0.08 }
    }
  };

  const itemVariants = {
    hidden: { y: 15, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } }
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen p-4 md:p-8 bg-slate-50 flex items-center justify-center font-sans tracking-tight"
    >
      <div className="w-full max-w-7xl flex flex-col md:flex-row bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
        
        {/* LEFT COLUMN: Testimonial Carousel Overlay Section */}
        <div className="flex-1 p-8 md:p-12 relative flex flex-col justify-between overflow-hidden">
          {/* Animated Background Geometric Gradient for depth */}
          <div className="absolute inset-0 bg-gradient-to-tr from-indigo-50 via-white to-sky-50 opacity-80" />
          <motion.div 
            animate={{ scale: [1, 1.05, 1], rotate: [0, 2, 0] }}
            transition={{ repeat: Infinity, duration: 25, ease: 'linear' }}
            className="absolute -top-16 -right-16 w-64 h-64 bg-indigo-100/50 rounded-full blur-3xl"
          />
          <motion.div 
            animate={{ scale: [1, 1.05, 1], rotate: [0, -2, 0] }}
            transition={{ repeat: Infinity, duration: 30, ease: 'linear', delay: 1 }}
            className="absolute -bottom-16 -left-16 w-64 h-64 bg-sky-100/50 rounded-full blur-3xl"
          />
          
          <div className="relative z-10 flex flex-col justify-between h-full">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
                Community Hub
              </span>
              <h1 className="text-4xl md:text-5xl font-extrabold text-slate-950 mt-4 leading-tight tracking-tighter">
                Accelerate your connections.
              </h1>
              <p className="text-slate-600 mt-2 max-w-sm">
                Unlock specialized assistance or reach verified community specialists in seconds.
              </p>
            </div>
            
            {/* AnimatePresence handles the cross-fading testimonials */}
            <div className="mt-auto relative min-h-[140px] pt-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTestimonial}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                  className="absolute inset-0 top-8 flex flex-col justify-center"
                >
                  <p className="text-lg md:text-xl font-medium text-slate-800 italic leading-relaxed">
                    "{testimonials[activeTestimonial].quote}"
                  </p>
                  <div className="flex items-center gap-3 mt-4 pt-4 border-t border-slate-100">
                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-white text-sm font-bold shadow-sm">
                      {testimonials[activeTestimonial].name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 leading-none">{testimonials[activeTestimonial].name}</p>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">{testimonials[activeTestimonial].role}</p>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Interactive Form Interface */}
        <div className="flex-1 p-8 md:p-12 border-t md:border-t-0 md:border-l border-slate-100 bg-white relative z-20">
          <motion.div variants={itemVariants} className="mb-8 text-center md:text-left">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-950 tracking-tighter mb-1 leading-tight">
              {step === 'otp' ? 'Verify Identity' : isLogin ? 'Welcome Back' : 'Get Started'}
            </h2>
            <p className="text-slate-500 font-medium text-sm md:text-base">
              {step === 'otp' ? `Provide the 6-digit access key sent to ${formData.email}` : isLogin ? 'Securely access your personalized neighborhood dashboard' : 'Join a network of thousands of verified community helpers.'}
            </p>
          </motion.div>

          <AnimatePresence mode="wait">
            {step === 'form' ? (
              <motion.form 
                key="form"
                initial="hidden"
                animate="visible"
                exit="hidden"
                variants={containerVariants}
                onSubmit={isLogin ? handleLogin : handleRegister} 
                className="space-y-4"
              >
                {!isLogin && (
                  <>
                    <motion.div variants={itemVariants}>
                      <input name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} required className="w-full p-4 rounded-xl border border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all outline-none font-semibold text-slate-800" />
                    </motion.div>
                    
                    {/* Role Segmented Controller Slider */}
                    <motion.div variants={itemVariants} className="flex gap-1 p-1 bg-slate-100 rounded-xl relative select-none">
                      <button type="button" onClick={() => setRole('seeker')} className={`flex-1 py-2 text-xs font-bold rounded-lg relative z-10 transition-colors duration-200 ${role === 'seeker' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-800'}`}>
                        Need Help
                        {role === 'seeker' && (
                          <motion.div
                            layoutId="activeRole"
                            className="absolute inset-0 bg-white rounded-lg shadow-sm -z-10"
                            transition={{ type: "spring", stiffness: 350, damping: 28 }}
                          />
                        )}
                      </button>
                      <button type="button" onClick={() => setRole('provider')} className={`flex-1 py-2 text-xs font-bold rounded-lg relative z-10 transition-colors duration-200 ${role === 'provider' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-800'}`}>
                        Provide Help
                        {role === 'provider' && (
                          <motion.div
                            layoutId="activeRole"
                            className="absolute inset-0 bg-white rounded-lg shadow-sm -z-10"
                            transition={{ type: "spring", stiffness: 350, damping: 28 }}
                          />
                        )}
                      </button>
                    </motion.div>
                    
                    <motion.div variants={itemVariants}>
                      <input name="phone" type="tel" placeholder="Phone Number" value={formData.phone} onChange={handleChange} required className="w-full p-4 rounded-xl border border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all outline-none font-semibold text-slate-800" />
                    </motion.div>
                    <motion.div variants={itemVariants}>
                      <textarea name="address" placeholder="Verify HQ or Operational Base Location" value={formData.address} onChange={handleChange} required className="w-full p-4 rounded-xl border border-slate-200 h-20 resize-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all outline-none font-semibold text-slate-800" />
                    </motion.div>
                  </>
                )}
                <motion.div variants={itemVariants}>
                  <input name="email" type="email" placeholder="Email Address" value={formData.email} onChange={handleChange} required className="w-full p-4 rounded-xl border border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all outline-none font-semibold text-slate-800" />
                </motion.div>
                <motion.div variants={itemVariants}>
                  <input name="password" type="password" placeholder="Account Password" value={formData.password} onChange={handleChange} required className="w-full p-4 rounded-xl border border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all outline-none font-semibold text-slate-800" />
                </motion.div>
                
                <motion.div variants={itemVariants} className="pt-2">
                  <button type="submit" disabled={loading} className={`w-full py-4 rounded-xl font-black text-xs uppercase tracking-widest text-white transition-all active:scale-[0.99] cursor-pointer shadow-lg shadow-indigo-100 ${loading ? 'bg-slate-300 shadow-none cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
                    {loading ? 'Processing claim...' : (isLogin ? 'Access Dashboard' : 'Broadcast Registration')}
                  </button>
                </motion.div>
                
                <motion.div variants={itemVariants} className="text-center pt-3">
                  <button type="button" onClick={() => { setIsLogin(!isLogin); setStep('form'); }} className="text-sm font-bold text-indigo-600 hover:text-indigo-800 hover:underline transition-colors duration-200"> 
                    {isLogin ? "New Specialist Node? Deploy Access Claim" : "Active Node? Finalize Login Handshake"}
                  </button>
                </motion.div>
              </motion.form>
            ) : (
              <motion.form 
                key="otp"
                initial="hidden"
                animate="visible"
                exit="hidden"
                variants={containerVariants}
                onSubmit={handleVerifyOTP} 
                className="space-y-4"
              >
                <motion.div variants={itemVariants} className="flex justify-center pt-6">
                  <input name="otp" placeholder="6-digit OTP" value={formData.otp} onChange={handleChange} required className="w-full max-w-[280px] p-4 text-center text-3xl font-mono tracking-[0.6em] border border-slate-200 rounded-xl focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-50 transition-all outline-none shadow-sm" maxLength="6" />
                </motion.div>
                
                <motion.div variants={itemVariants} className="pt-4 flex flex-col sm:flex-row gap-3">
                  <button type="button" onClick={() => setStep('form')} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-colors cursor-pointer">
                    Back to Form
                  </button>
                  <button type="submit" disabled={loading} className="flex-1 py-4 bg-green-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-green-700 shadow-lg shadow-green-100 transition-all active:scale-[0.99] disabled:bg-slate-300 disabled:shadow-none disabled:cursor-not-allowed cursor-pointer">
                    {loading ? 'Finalizing handshake...' : 'Confirm Matrix Access'}
                  </button>
                </motion.div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default Auth;