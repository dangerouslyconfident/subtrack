import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { addSubscription, getUserSubscriptions, deleteSubscription } from '../services/firestore';
import { POPULAR_SERVICES, convertCurrency, formatCurrency } from '../lib/services';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent } from '../components/ui/Card';
import { Trash2, Plus, Zap, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Parent and child animation variants for staggering lists
const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};
const itemVariants = {
  hidden: { y: 30, opacity: 0, scale: 0.95 },
  show: { y: 0, opacity: 1, scale: 1, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

// SVG Orbital Progress Ring Component (Holographic Theme)
function OrbitalVisualizer({ total, limit, currency }) {
  // Prevent division by zero and cap at 100% for the visual arc
  const percentage = Math.min((total / (limit || 1)) * 100, 100);
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex flex-col items-center justify-center p-8 w-full h-full">
      {/* Dynamic Outer Glows */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
         <div className="w-56 h-56 rounded-full bg-fuchsia-500/20 blur-[60px] opacity-60 mix-blend-screen" />
         <div className="w-40 h-40 absolute rounded-full bg-cyan-500/20 blur-[40px] opacity-60 mix-blend-screen" />
      </div>
      
      <svg className="w-full h-full max-w-[200px] max-h-[200px] transform -rotate-90 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]" viewBox="0 0 160 160">
        {/* Background dark glass track */}
        <circle cx="80" cy="80" r={radius} className="stroke-white/5" strokeWidth="8" fill="transparent" />
        
        {/* Animated Progress Ring using custom linear gradient defined below */}
        <motion.circle 
          cx="80" cy="80" r={radius} 
          className="stroke-[url(#rainbow)]"
          strokeWidth="12" strokeLinecap="round" fill="transparent"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 2, ease: "easeOut", delay: 0.2 }}
          style={{ strokeDasharray: circumference }}
        />
        <defs>
          <linearGradient id="rainbow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ff3366" />
            <stop offset="50%" stopColor="#33ccff" />
            <stop offset="100%" stopColor="#9933ff" />
          </linearGradient>
        </defs>
      </svg>
      
      {/* Data Metrics centered perfectly */}
      <div className="absolute flex flex-col items-center justify-center text-center inset-0">
        <span className="text-xs font-bold text-white/50 uppercase tracking-[0.2em] mb-1 drop-shadow-md">Monthly Output</span>
        <span className="text-3xl font-extrabold text-white tracking-tighter drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
          {formatCurrency(total, currency)}
        </span>
      </div>
    </div>
  );
}

export function DashboardPage() {
  const { user } = useAuth();
  const { currency } = useSettings();
  
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Auto-fill Forms state
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [cycle, setCycle] = useState('monthly');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedService, setSelectedService] = useState(null);

  // Read from Database
  useEffect(() => {
    const fetchSubs = async () => {
      if (user) {
        try {
          const data = await getUserSubscriptions(user.uid);
          setSubscriptions(data);
        } catch (error) {
          console.error("Error", error);
        } finally { setLoading(false); }
      }
    };
    fetchSubs();
  }, [user]);

  // SMART AUTO-COMPLETE LOGIC
  useEffect(() => {
    if (!name) { setSuggestions([]); setSelectedService(null); return; }
    if (selectedService && selectedService.name === name) return;
    const matches = POPULAR_SERVICES.filter(s => s.name.toLowerCase().includes(name.toLowerCase()));
    setSuggestions(matches);
  }, [name, selectedService]);

  const handleSelectService = (service) => {
    setName(service.name);
    setSelectedService(service);
    setSuggestions([]);
    if (service.plans.length > 0) {
      setPrice(service.plans[0].price);
      setCycle(service.plans[0].cycle);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!name || (!price && price !== 0)) return;
    
    const newSub = {
      name, price: parseFloat(price), cycle,
      logoId: selectedService ? selectedService.logo : name.charAt(0).toUpperCase()
    };
    try {
      const docRef = await addSubscription(user.uid, newSub);
      setSubscriptions([...subscriptions, { id: docRef.id, ...newSub }]);
      setName(''); setPrice(''); setCycle('monthly'); setSelectedService(null);
    } catch (error) { console.error("Error", error); }
  };

  const handleDelete = async (id) => {
    try {
      await deleteSubscription(id);
      setSubscriptions(subscriptions.filter(s => s.id !== id));
    } catch (error) { console.error("Error", error); }
  };

  // Convert USD total metrics dynamically to the user's selected global currency
  const { monthlyTotal } = useMemo(() => {
    let monthlyUSD = 0;
    subscriptions.forEach(sub => {
      if (sub.cycle === 'monthly') monthlyUSD += sub.price;
      else monthlyUSD += (sub.price / 12);
    });
    return { monthlyTotal: convertCurrency(monthlyUSD, currency) };
  }, [subscriptions, currency]);

  if (loading) return (
    <div className="flex h-[80vh] items-center justify-center">
      <div className="text-white/30 text-sm font-bold tracking-[0.5em] uppercase animate-pulse">Initializing Interface...</div>
    </div>
  );

  // A generic budget limit scaled to currency.
  // In a real app this would be a user setting!
  const visualLimit = convertCurrency(100, currency) < 1000 ? convertCurrency(100, currency) : convertCurrency(100, currency) * 10;

  return (
    <motion.div 
      initial="hidden" animate="show" variants={containerVariants}
      className="mx-auto max-w-6xl p-4 pt-10 min-h-screen"
    >
      <motion.div variants={itemVariants} className="mb-12 text-center">
        <h1 className="text-5xl font-black tracking-tighter holo-text mb-3 pb-1">SubTrack Spatial</h1>
        <p className="text-white/40 font-bold tracking-[0.3em] text-xs uppercase">Bento Architecture Enabled</p>
      </motion.div>
      
      {/* Top Section: Orbital Visualizer + Form Bento */}
      <div className="grid gap-6 md:grid-cols-12 mb-10">
        
        {/* Orbital Display */}
        <motion.div variants={itemVariants} className="md:col-span-5 md:h-[420px] h-[350px]">
          <Card className="glass-panel h-full flex flex-col items-center justify-center p-0 overflow-hidden relative">
            <h3 className="absolute top-8 left-8 text-xs font-bold text-white/50 tracking-[0.2em] uppercase">Telemetry Ring</h3>
            <OrbitalVisualizer total={monthlyTotal} limit={visualLimit} currency={currency} />
            <p className="absolute bottom-8 text-[10px] text-white/30 tracking-[0.4em] uppercase">Orbital Tracking Alpha</p>
          </Card>
        </motion.div>

        {/* Smart Form */}
        <motion.div variants={itemVariants} className="md:col-span-7 md:h-[420px]">
          <Card className="glass-panel h-full flex flex-col p-8 relative overflow-visible">
            {/* Subtle background glow leaking from bottom right corner */}
            <div className="absolute -bottom-24 -right-24 bg-indigo-500/10 blur-[100px] w-64 h-64 rounded-full pointer-events-none" />
            
            <h3 className="text-xl font-extrabold flex items-center gap-3 text-white mb-8 tracking-wide">
              <Zap size={22} className="text-amber-400 fill-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.8)]"/> 
              Initialize New Protocol
            </h3>
            
            <form onSubmit={handleAdd} className="flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-2 relative z-20">
                <Input 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  onBlur={() => setTimeout(() => setSuggestions([]), 200)}
                  onKeyDown={e => e.key === 'Escape' && setSuggestions([])}
                  placeholder="Search Service (e.g., Netflix...)" 
                  className="bg-black/50 border-white/10 h-16 text-xl px-6 rounded-2xl shadow-inner font-medium focus:bg-black/70"
                  required 
                />
                <AnimatePresence>
                  {suggestions.length > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10, filter: 'blur(10px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} exit={{ opacity: 0, y: -10, filter: 'blur(10px)' }}
                      className="absolute w-full mt-2 bg-[#12121a]/95 backdrop-blur-3xl border border-white/10 rounded-2xl shadow-[0_30px_80px_-10px_rgba(0,0,0,1)] overflow-hidden z-50"
                    >
                      {suggestions.map(s => (
                        <div 
                          key={s.name} 
                          className="flex items-center gap-4 px-6 py-4 cursor-pointer hover:bg-white/10 transition-colors border-b border-white/5 last:border-0"
                          onClick={() => handleSelectService(s)}
                        >
                          <div className={`h-12 w-12 rounded-xl flex items-center justify-center font-bold text-xl drop-shadow-md border border-white/10 ${s.color}`}>
                            {s.logo}
                          </div>
                          <div className="font-extrabold text-lg text-white tracking-wide">{s.name}</div>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              <AnimatePresence mode="popLayout">
                {selectedService ? (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4 z-10 relative">
                    <div className="p-4 bg-cyan-500/10 backdrop-blur-md rounded-2xl flex items-center gap-3 border border-cyan-500/20 shadow-inner">
                      <Sparkles className="text-cyan-400 shrink-0" size={20} />
                      <div className="text-sm font-semibold text-cyan-100 tracking-wide">
                        Popular tiers for <strong className="text-white px-1">{selectedService.name}</strong> isolated.
                      </div>
                    </div>
                    <select 
                      className="w-full h-16 rounded-2xl border border-white/10 bg-black/50 px-6 text-lg font-bold text-white shadow-inner focus:outline-none appearance-none cursor-pointer"
                      onChange={e => {
                        const plan = selectedService.plans.find(p => p.name === e.target.value);
                        if(plan) { setPrice(plan.price); setCycle(plan.cycle); }
                      }}
                    >
                      {selectedService.plans.map((p, i) => (
                        <option key={i} value={p.name} className="bg-slate-900 text-base">
                          {p.name} — {formatCurrency(convertCurrency(p.price, currency), currency)}/{p.cycle === 'monthly' ? 'mo' : 'yr'}
                        </option>
                      ))}
                    </select>
                  </motion.div>
                ) : (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4 z-10 relative">
                    <Input 
                      type="number" step="0.01" min="0" 
                      value={price} onChange={e => setPrice(e.target.value)} 
                      placeholder="Custom Price" 
                      className="w-1/2 bg-black/50 border-white/10 h-16 text-lg font-bold px-6 rounded-2xl" required 
                    />
                    <select 
                      className="w-1/2 h-16 rounded-2xl border border-white/10 bg-black/50 px-6 text-lg font-bold text-white shadow-inner focus:outline-none"
                      value={cycle} onChange={e => setCycle(e.target.value)}
                    >
                      <option value="monthly" className="bg-slate-900">/ Monthly</option>
                      <option value="yearly" className="bg-slate-900">/ Yearly</option>
                    </select>
                  </motion.div>
                )}
              </AnimatePresence>

              <Button type="submit" className="w-full h-16 text-sm font-black tracking-[0.2em] uppercase bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40 holo-border mt-auto relative z-10 shadow-xl transition-all">
                Confirm Integration
              </Button>
            </form>
          </Card>
        </motion.div>
      </div>

      {/* Grid Roster: The Bento Widgets */}
      <motion.div variants={itemVariants} className="mt-16">
         <h2 className="text-sm font-black tracking-[0.2em] text-white/50 uppercase mb-6 px-2 drop-shadow-md">Active Grid Roster</h2>
         {subscriptions.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-32 glass-panel border border-white/5 bg-transparent shadow-none">
              <Plus size={48} className="mb-6 text-white/10" />
              <p className="font-bold text-white/30 tracking-[0.3em]">GRID EMPTY</p>
            </div>
         ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <AnimatePresence>
                {subscriptions.map(sub => {
                  const match = POPULAR_SERVICES.find(s => s.name === sub.name);
                  const colorClass = match ? match.color : "bg-indigo-500/20 text-indigo-300";
                  const auraColor = match ? colorClass.split(' ')[1] : 'bg-indigo-500/20';
                  
                  return (
                    <motion.div 
                      key={sub.id} 
                      layout
                      initial={{ opacity: 0, scale: 0.8, filter: 'blur(10px)' }}
                      animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                      exit={{ opacity: 0, scale: 0.8, filter: 'blur(10px)' }}
                      transition={{ layout: { type: "spring", stiffness: 300, damping: 30 } }}
                      className="glass-panel aspect-square flex flex-col p-6 lg:p-8 relative group overflow-hidden border border-white/5 bg-white/[0.02]"
                    >
                      {/* Widget Aura Glow */}
                      <div className={`absolute -top-10 -right-10 w-48 h-48 rounded-full blur-[50px] opacity-20 pointer-events-none transition-opacity group-hover:opacity-40 ${auraColor}`} />
                      
                      <div className="flex justify-between items-start mb-auto relative z-10">
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-black text-3xl shadow-inner border border-white/10 backdrop-blur-md ${colorClass}`}>
                          {sub.logoId}
                        </div>
                        <button 
                          className="flex items-center justify-center bg-black/40 hover:bg-red-500/80 hover:text-white text-white/40 opacity-0 group-hover:opacity-100 transition-all rounded-full h-12 w-12 border border-white/10 cursor-pointer shadow-lg active:scale-95"
                          onClick={() => handleDelete(sub.id)}
                          title="Terminate"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                      
                      <div className="relative z-10 w-full">
                        <div className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-1">{sub.cycle}</div>
                        <div className="text-2xl lg:text-3xl font-black text-white tracking-tighter break-words leading-none mb-3 drop-shadow-md">{sub.name}</div>
                        <div className="text-xl font-bold text-white/90 drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]">
                          {formatCurrency(convertCurrency(sub.price, currency), currency)}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
         )}
      </motion.div>
    </motion.div>
  );
}
