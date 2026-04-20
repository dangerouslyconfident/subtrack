import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { addSubscription, getUserSubscriptions, deleteSubscription, syncMonthlyReport } from '../services/firestore';
import { POPULAR_SERVICES, convertCurrency, formatCurrency } from '../lib/services';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { Trash2, Plus, Zap, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Mystical parent/child animation choreographies meant to bamboozle the user's retina
const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};
const itemVariants = {
  hidden: { y: 30, opacity: 0, scale: 0.95 },
  show: { y: 0, opacity: 1, scale: 1, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

const CATEGORIES = ['Entertainment', 'Productivity', 'Utility', 'Gaming', 'Cloud', 'Other'];

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
  const [displayMode, setDisplayMode] = useState('monthly');
  
  // The dark ritual ingredients for building a new subscription
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [cycle, setCycle] = useState('monthly');
  const [category, setCategory] = useState('Entertainment');
  const [nextBillingDate, setNextBillingDate] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedService, setSelectedService] = useState(null);

  // Extracting your financial sins from the Firebase underworld
  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        try {
          const data = await getUserSubscriptions(user.uid);
          setSubscriptions(data);
        } catch (error) {
          console.error("Error", error);
        } finally { setLoading(false); }
      }
    };
    fetchData();
  }, [user]);

  // AWAKENING THE SMART AUTO-COMPLETE SPIRITS
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
    
    // Assembling the financial horcrux
    const newSub = {
      name, price: parseFloat(price), cycle, category, nextBillingDate,
      logoId: selectedService ? selectedService.logo : name.charAt(0).toUpperCase()
    };
    try {
      const docRef = await addSubscription(user.uid, newSub);
      setSubscriptions([...subscriptions, { id: docRef.id, ...newSub }]);
      // Purge the ritual inputs so they may be used again
      setName(''); setPrice(''); setCycle('monthly'); setCategory('Entertainment'); setNextBillingDate(''); setSelectedService(null);
    } catch (error) { console.error("Error", error); }
  };

  const handleDelete = async (id) => {
    try {
      await deleteSubscription(id);
      setSubscriptions(subscriptions.filter(s => s.id !== id));
    } catch (error) { console.error("Error", error); }
  };

  // Transmuting raw USD digits into whatever magical currency your kingdom uses
  const { displayTotal, rawMonthlyUSD } = useMemo(() => {
    let monthlyUSD = 0;
    subscriptions.forEach(sub => {
      if (sub.cycle === 'monthly') monthlyUSD += sub.price;
      else monthlyUSD += (sub.price / 12);
    });
    
    // Scale tracking based on UI selection 
    const finalAmount = displayMode === 'yearly' ? (monthlyUSD * 12) : monthlyUSD;
    return { displayTotal: convertCurrency(finalAmount, currency), rawMonthlyUSD: monthlyUSD };
  }, [subscriptions, currency, displayMode]);

  // Sync Monthly Report automatically
  useEffect(() => {
    if (!loading && user && subscriptions.length > 0) {
      // We always sync the MONTHLY cost for the reports, regardless of what the user is currently displaying
      const syncVal = convertCurrency(rawMonthlyUSD, currency);
      syncMonthlyReport(user.uid, syncVal, subscriptions.length);
    }
  }, [rawMonthlyUSD, loading, user, subscriptions.length, currency]);

  // Conjuring the upcoming charges radar
  const upcomingCharges = useMemo(() => {
    if (!subscriptions) return [];
    const today = new Date();
    today.setHours(0,0,0,0);
    const in14Days = new Date(today);
    in14Days.setDate(today.getDate() + 14);

    return subscriptions
      .filter(sub => {
        if (!sub.nextBillingDate) return false;
        const bDate = new Date(sub.nextBillingDate);
        // Correct timezones aren't real, they can't hurt us here
        return bDate >= today && bDate <= in14Days;
      })
      .sort((a, b) => new Date(a.nextBillingDate) - new Date(b.nextBillingDate));
  }, [subscriptions]);

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
        <motion.div variants={itemVariants} className="md:col-span-5 h-[350px]">
          <Card className="glass-panel h-full flex flex-col items-center justify-center p-0 overflow-hidden relative">
            <h3 className="absolute top-8 left-8 text-xs font-bold text-white/50 tracking-[0.2em] uppercase">Telemetry Ring</h3>
            <OrbitalVisualizer total={displayTotal} limit={convertCurrency(displayMode === 'yearly' ? 1200 : 100, currency)} currency={currency} />
            
            <div className="absolute bottom-6 flex gap-2 p-1 bg-black/40 border border-white/10 rounded-full backdrop-blur-md">
               <button 
                 onClick={() => setDisplayMode('monthly')}
                 className={`px-4 py-1.5 text-xs font-bold tracking-widest uppercase rounded-full transition-all ${displayMode === 'monthly' ? 'bg-indigo-500 text-white shadow-lg' : 'text-white/40 hover:text-white/80'}`}
               >Monthly</button>
               <button 
                 onClick={() => setDisplayMode('yearly')}
                 className={`px-4 py-1.5 text-xs font-bold tracking-widest uppercase rounded-full transition-all ${displayMode === 'yearly' ? 'bg-indigo-500 text-white shadow-lg' : 'text-white/40 hover:text-white/80'}`}
               >Yearly</button>
            </div>
          </Card>
        </motion.div>

        {/* Smart Form */}
        <motion.div variants={itemVariants} className="md:col-span-7 h-auto">
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

              {/* Advanced Tracking Metrics for Category and Dates */}
              <div className="flex gap-4 z-10 relative mt-2">
                 <select 
                   className="w-1/2 h-14 rounded-2xl border border-white/10 bg-black/50 px-6 text-sm font-bold text-white shadow-inner focus:outline-none"
                   value={category} onChange={e => setCategory(e.target.value)}
                 >
                   {CATEGORIES.map(c => <option key={c} value={c} className="bg-slate-900">{c}</option>)}
                 </select>
                 <div className="w-1/2 relative">
                   <Input 
                     type="date"
                     value={nextBillingDate} onChange={e => setNextBillingDate(e.target.value)}
                     className="w-full bg-black/50 border-white/10 h-14 text-xs font-bold px-4 rounded-2xl text-white/50 focus:text-white" 
                     title="Next Billing Date (Optional but highly recommended to prevent bankruptcy)"
                   />
                 </div>
              </div>

              <Button type="submit" className="w-full h-16 text-sm font-black tracking-[0.2em] uppercase bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40 holo-border mt-auto relative z-10 shadow-xl transition-all">
                Confirm Integration
              </Button>
            </form>
          </Card>
        </motion.div>
      </div>

      {/* The Imminent Drain Radar */}
      {upcomingCharges.length > 0 && (
         <motion.div variants={itemVariants} className="mt-8 mb-16">
            <h2 className="text-sm font-black tracking-[0.2em] text-red-500 uppercase mb-6 px-2 drop-shadow-md flex items-center gap-2 animate-pulse">
              <Zap size={16} className="fill-red-500" /> Imminent Drain Radar (Next 14 Days)
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {upcomingCharges.map(sub => {
                // Time math because javascript dates make developers cry
                const daysLeft = Math.ceil((new Date(sub.nextBillingDate) - new Date()) / (1000 * 60 * 60 * 24));
                return (
                  <div key={sub.id} className="p-4 rounded-2xl border border-red-500/20 bg-red-500/5 backdrop-blur-md flex items-center justify-between">
                     <div className="font-bold text-white">{sub.name}</div>
                     <div className="text-xs font-black bg-red-500/20 text-red-400 px-3 py-1 rounded-full uppercase tracking-wider border border-red-500/20">
                        {daysLeft === 0 ? 'TODAY' : `In ${daysLeft} Days`}
                     </div>
                  </div>
                );
              })}
            </div>
         </motion.div>
      )}

      {/* Grid Roster: The Bento Widgets */}
      <motion.div variants={itemVariants} className="mt-8">
         <h2 className="text-sm font-black tracking-[0.2em] text-white/50 uppercase mb-6 px-2 drop-shadow-md">Active Subscription Matrix</h2>
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
