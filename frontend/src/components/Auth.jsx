import React, { useState } from 'react';
import axios from 'axios';

// Maintain cookie persistence across requests
axios.defaults.withCredentials = true;

const Auth = ({ onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState('seeker'); 
  const [step, setStep] = useState('form'); 
  const [loading, setLoading] = useState(false);
  
  // Direct live Render backend URL endpoint
  const API_URL = 'https://finance-tracker-backend-u3qd.onrender.com/api';

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
      const res = await axios.post(`${API_URL}/auth/verify-otp`, {
        email: formData.email,
        otp: formData.otp
      });
      alert("Account verified successfully!");
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
        alert(err.response?.data?.message || "Login failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-2xl border border-slate-100">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-slate-800 mb-2">
          {step === 'otp' ? 'Verify Email' : isLogin ? 'Welcome Back' : 'Create Account'}
        </h2>
        {step === 'otp' && (
          <p className="text-sm text-slate-500">
            Please enter the code sent to <strong>{formData.email}</strong>
          </p>
        )}
      </div>

      {step === 'form' ? (
        <form onSubmit={isLogin ? handleLogin : handleRegister} className="space-y-4">
          {!isLogin && (
            <>
              <input name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} required className="w-full p-3 rounded-xl border border-slate-200 focus:outline-indigo-500" />
              <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
                <button type="button" onClick={() => setRole('seeker')} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${role === 'seeker' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}>Need Help</button>
                <button type="button" onClick={() => setRole('provider')} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${role === 'provider' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}>Provider</button>
              </div>
              <input name="phone" type="tel" placeholder="Phone Number" value={formData.phone} onChange={handleChange} required className="w-full p-3 rounded-xl border border-slate-200 focus:outline-indigo-500" />
              <textarea name="address" placeholder="Full Address" value={formData.address} onChange={handleChange} required className="w-full p-3 rounded-xl border border-slate-200 h-20 resize-none focus:outline-indigo-500" />
            </>
          )}
          <input name="email" type="email" placeholder="Email" value={formData.email} onChange={handleChange} required className="w-full p-3 rounded-xl border border-slate-200 focus:outline-indigo-500" />
          <input name="password" type="password" placeholder="Password" value={formData.password} onChange={handleChange} required className="w-full p-3 rounded-xl border border-slate-200 focus:outline-indigo-500" />
          <button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold transition-colors disabled:bg-indigo-400">{loading ? 'Processing...' : (isLogin ? 'Login' : 'Register')}</button>
          <button type="button" onClick={() => { setIsLogin(!isLogin); setStep('form'); }} className="w-full text-sm text-indigo-600 mt-2 hover:underline"> {isLogin ? "New here? Register" : "Have an account? Login"}</button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOTP} className="space-y-4">
          <input name="otp" placeholder="6-digit OTP" value={formData.otp} onChange={handleChange} required className="w-full p-4 text-center text-3xl font-mono tracking-widest border border-slate-200 rounded-xl focus:outline-green-500" maxLength="6" />
          <button type="submit" disabled={loading} className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold transition-colors disabled:bg-green-400">{loading ? 'Verifying...' : 'Verify & Start'}</button>
          <button type="button" onClick={() => setStep('form')} className="w-full text-sm text-slate-500 text-center hover:underline mt-2">Back to Login</button>
        </form>
      )}
    </div>
  );
};

export default Auth;