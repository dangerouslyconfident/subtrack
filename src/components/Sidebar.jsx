import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { Activity, LayoutDashboard, LineChart, LogOut, Globe } from 'lucide-react';
import { motion } from 'framer-motion';

export function Sidebar() {
  const { user, logout } = useAuth();
  const { currency, setCurrency } = useSettings();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      // Nuking the auth state from orbit because it's the only way to be sure
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to escape the matrix', error);
    }
  };

  // If you aren't authenticated, you do not exist. Return nothingness.
  if (!user) return null;

  return (
    <motion.aside 
      initial={{ x: -50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="hidden md:flex flex-col w-64 h-screen sticky top-0 border-r border-white/5 bg-[#0a0a0f]/80 backdrop-blur-3xl shadow-2xl z-50 p-6"
    >
      {/* Brand ID */}
      <Link to="/" className="flex items-center gap-3 mb-12 group">
        <div className="bg-indigo-500/20 p-2 rounded-xl border border-indigo-500/30 group-hover:bg-indigo-500/30 transition-all shadow-[0_0_15px_rgba(99,102,241,0.2)]">
          <Activity size={24} className="text-indigo-400" />
        </div>
        <span className="text-2xl font-black text-white tracking-tighter drop-shadow-md">SubTrack</span>
      </Link>

      {/* Nav Links */}
      <nav className="flex-1 space-y-2">
        <Link 
          to="/" 
          className={`flex items-center gap-3 px-4 py-4 rounded-2xl font-bold transition-all ${
            location.pathname === '/' 
              ? 'bg-white/10 text-white shadow-inner border border-white/10' 
              : 'text-white/40 hover:text-white/80 hover:bg-white/5'
          }`}
        >
          <LayoutDashboard size={20} className={location.pathname === '/' ? 'text-cyan-400' : ''} />
          Matrix Grid
        </Link>
        <Link 
          to="/analytics" 
          className={`flex items-center gap-3 px-4 py-4 rounded-2xl font-bold transition-all ${
            location.pathname === '/analytics' 
              ? 'bg-white/10 text-white shadow-inner border border-white/10' 
              : 'text-white/40 hover:text-white/80 hover:bg-white/5'
          }`}
        >
          <LineChart size={20} className={location.pathname === '/analytics' ? 'text-fuchsia-400' : ''} />
          Analytics
        </Link>
      </nav>

      {/* Utilities */}
      <div className="space-y-4 pt-8 border-t border-white/5">
        <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-black/40 border border-white/5">
          <Globe size={18} className="text-slate-400 shrink-0" />
          <select 
            className="bg-transparent text-sm text-slate-300 font-bold w-full focus:outline-none cursor-pointer appearance-none"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
          >
            <option className="bg-slate-900" value="USD">USD ($)</option>
            <option className="bg-slate-900" value="EUR">EUR (€)</option>
            <option className="bg-slate-900" value="GBP">GBP (£)</option>
            <option className="bg-slate-900" value="INR">INR (₹)</option>
          </select>
        </div>

        <div className="px-2">
           <p className="text-[10px] uppercase tracking-widest text-white/30 font-bold mb-3 truncate">{user.email}</p>
           <button 
             onClick={handleLogout}
             className="flex items-center gap-3 w-full text-left text-sm font-bold text-red-400 hover:text-red-300 transition-colors"
           >
             <LogOut size={16} />
             Deactivate Feed
           </button>
        </div>
      </div>
    </motion.aside>
  );
}
