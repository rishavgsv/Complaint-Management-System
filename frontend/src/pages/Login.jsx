import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/api';
import { Lock, Mail, ArrowRight, ShieldAlert } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data } = await login(formData);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));
      
      if (data.role === 'Admin') {
        navigate('/admin');
      } else if (data.role === 'Worker') {
        navigate('/worker');
      } else {
        navigate('/authority');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-brand-600 rounded-2xl mx-auto flex items-center justify-center mb-6 shadow-xl shadow-brand-200">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Staff Portal</h1>
          <p className="text-gray-500 mt-2">Sign in to manage complaints.</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-8">
          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium flex gap-3 items-center">
              <ShieldAlert className="w-5 h-5" /> {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                <input 
                  type="email" 
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:bg-white focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all" 
                  placeholder="admin@university.edu" 
                  required 
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                <input 
                  type="password" 
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:bg-white focus:ring-2 focus:ring-brand-500 outline-none transition-all" 
                  placeholder="••••••••" 
                  required 
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-brand-600 hover:bg-brand-700 text-white rounded-xl py-3.5 font-bold transition-colors flex items-center justify-center gap-2 group shadow-xl shadow-brand-200 disabled:opacity-70"
            >
               {loading ? (
                   <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
               ) : (
                  <>
                     Sign In <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
               )}
            </button>
          </form>
        </div>

        {/* Demo Credentials Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6 bg-white rounded-2xl shadow-lg shadow-gray-200/50 p-5 border border-gray-100"
        >
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 text-center">
            🔑 Demo Credentials — Click to Auto-Fill
          </p>
          <div className="grid grid-cols-1 gap-3">
            {[
              { role: 'Admin', email: 'admin@university.edu', color: 'bg-blue-50 border-blue-200 hover:border-blue-400 hover:bg-blue-100', badge: 'bg-blue-100 text-blue-700' },
              { role: 'Worker (Electrician)', email: 'electrician@university.edu', color: 'bg-yellow-50 border-yellow-200 hover:border-yellow-400 hover:bg-yellow-100', badge: 'bg-yellow-100 text-yellow-700' },
              { role: 'Worker (AC Tech)', email: 'ac@university.edu', color: 'bg-cyan-50 border-cyan-200 hover:border-cyan-400 hover:bg-cyan-100', badge: 'bg-cyan-100 text-cyan-700' },
            ].map(({ role, email, color, badge }) => (
              <button
                key={email}
                type="button"
                onClick={() => setFormData({ email, password: 'password123' })}
                className={`w-full text-left px-4 py-3 rounded-xl border transition-all duration-200 group ${color}`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${badge}`}>{role}</span>
                    <p className="text-sm font-mono text-gray-700 mt-1">{email}</p>
                    <p className="text-xs text-gray-400">password: <span className="font-semibold text-gray-600">password123</span></p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors shrink-0" />
                </div>
              </button>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Login;
