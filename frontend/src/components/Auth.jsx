import React, { useState } from 'react';
import axios from 'axios';

// Set global axios defaults so you don't have to repeat it
axios.defaults.withCredentials = true;

const Auth = ({ onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState('seeker'); 
  const [step, setStep] = useState('form'); 
  const [loading, setLoading] = useState(false);
  
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
      await axios.post('https://local-helper-d3ih.onrender.com/api/auth/register', { 
        ...formData,
        role: role 
      });
      setStep('otp');
      alert("OTP sent to your email!");
    } catch (err) {
      alert(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('https://local-helper-d3ih.onrender.com/api/auth/verify-otp', {
        email: formData.email,
        otp: formData.otp
      });
      // Backend now returns { user: { id, name, role... } }
      onLoginSuccess(res.data.user); 
    } catch (err) {
      alert(err.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('https://local-helper-d3ih.onrender.com/api/auth/login', {
        email: formData.email,
        password: formData.password
      });
      onLoginSuccess(res.data.user);
    } catch (err) {
      alert(err.response?.data?.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  // ... (Keep the JSX return exactly as you had it, it's correct)
  return (
    <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-2xl border border-slate-100">
      {/* (Previous JSX logic remains the same) */}
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-slate-800 mb-2">
          {step === 'otp' ? 'Verify Email' : isLogin ? 'Welcome Back' : 'Create Account'}
        </h2>
      </div>

      {step === 'form' ? (
        <form onSubmit={isLogin ? handleLogin : handleRegister} className="space-y-4">
          {!isLogin && (
            <>
              <input name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} required className="w-full p-3 rounded-xl border border-slate-200" />
              <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
                <button type="button" onClick={() => setRole('seeker')} className={`flex-1 py-2 rounded-lg text-sm font-bold ${role === 'seeker' ? 'bg-white text-indigo-600' : 'text-slate-500'}`}>Need Help</button>
                <button type="button" onClick={() => setRole('provider')} className={`flex-1 py-2 rounded-lg text-sm font-bold ${role === 'provider' ? 'bg-white text-indigo-600' : 'text-slate-500'}`}>Provider</button>
              </div>
              <input name="phone" type="tel" placeholder="Phone Number" value={formData.phone} onChange={handleChange} required className="w-full p-3 rounded-xl border border-slate-200" />
              <textarea name="address" placeholder="Full Address" value={formData.address} onChange={handleChange} required className="w-full p-3 rounded-xl border border-slate-200 h-20 resize-none" />
            </>
          )}
          <input name="email" type="email" placeholder="Email" value={formData.email} onChange={handleChange} required className="w-full p-3 rounded-xl border border-slate-200" />
          <input name="password" type="password" placeholder="Password" value={formData.password} onChange={handleChange} required className="w-full p-3 rounded-xl border border-slate-200" />
          <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold">{loading ? 'Processing...' : (isLogin ? 'Login' : 'Register')}</button>
          <button type="button" onClick={() => { setIsLogin(!isLogin); setStep('form'); }} className="w-full text-sm text-indigo-600"> {isLogin ? "New here? Register" : "Have an account? Login"}</button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOTP} className="space-y-4">
          <input name="otp" placeholder="6-digit OTP" value={formData.otp} onChange={handleChange} required className="w-full p-4 text-center text-2xl font-mono border border-slate-200" maxLength="6" />
          <button type="submit" disabled={loading} className="w-full bg-green-600 text-white py-3 rounded-xl font-bold">Verify & Start</button>
        </form>
      )}
    </div>
  );
};

export default Auth;