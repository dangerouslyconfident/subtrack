import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { Button } from './ui/Button';
import { Activity, Globe } from 'lucide-react';
import { motion } from 'framer-motion';

export function Navbar() {
  const { user, logout } = useAuth();
  const { currency, setCurrency } = useSettings();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  return (
    <motion.nav 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="sticky top-0 z-50 border-b border-white/10 glass-panel px-4 py-3 shadow-lg"
    >
      <div className="mx-auto flex max-w-5xl items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 transition-colors drop-shadow-md">
          <Activity size={24} />
          <span className="text-xl font-bold text-white tracking-tight">SubTrack</span>
        </Link>
        
        {user && (
           <div className="flex items-center gap-4">
             <div className="flex items-center gap-2 border-r border-white/10 pr-4">
               <Globe size={16} className="text-slate-400" />
               <select 
                 className="bg-transparent text-sm text-slate-300 font-medium focus:outline-none cursor-pointer"
                 value={currency}
                 onChange={(e) => setCurrency(e.target.value)}
                 title="Select Currency"
               >
                 <option className="bg-slate-900" value="USD">USD ($)</option>
                 <option className="bg-slate-900" value="EUR">EUR (€)</option>
                 <option className="bg-slate-900" value="GBP">GBP (£)</option>
                 <option className="bg-slate-900" value="INR">INR (₹)</option>
               </select>
             </div>
             <span className="text-sm font-medium text-slate-400 hidden sm:inline-block">{user.email}</span>
             <Button variant="secondary" size="sm" onClick={handleLogout} className="bg-white/5 hover:bg-white/10 border-white/10 transition-all font-medium">
               Log Out
             </Button>
           </div>
        )}
      </div>
    </motion.nav>
  );
}
