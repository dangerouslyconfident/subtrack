import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { getMonthlyReports } from '../services/firestore';
import { formatCurrency } from '../lib/services';
import { Card } from '../components/ui/Card';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

export function AnalyticsPage() {
  const { user } = useAuth();
  const { currency } = useSettings();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      if (user) {
        try {
          const history = await getMonthlyReports(user.uid);
          setReports(history);
        } catch (error) {
          console.error("Error", error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchHistory();
  }, [user]);

  if (loading) return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-white/30 text-sm font-bold tracking-[0.5em] uppercase animate-pulse">Initializing Analytics Engine...</div>
    </div>
  );

  return (
    <div className="mx-auto max-w-6xl p-4 pt-10 min-h-screen">
      <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mb-12">
        <h1 className="text-5xl font-black tracking-tighter text-white mb-3 pb-1">Analytics Protocol</h1>
        <p className="text-white/40 font-bold tracking-[0.3em] text-xs uppercase">Historical Expenditure Tracking</p>
      </motion.div>

      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.1 }}>
         <Card className="glass-panel p-8 h-[500px] flex flex-col justify-center border border-white/5 shadow-2xl relative overflow-hidden">
           {/* Decorative Glow */}
           <div className="absolute top-0 right-0 w-96 h-96 bg-fuchsia-500/10 blur-[100px] rounded-full pointer-events-none" />
           
           {reports.length < 1 ? (
             <div className="text-center text-white/40 font-bold tracking-[0.3em] text-sm uppercase relative z-10">
               Data arrays insufficient for graphing protocol.
             </div>
           ) : (
             <div className="w-full h-full relative z-10">
               <h3 className="text-xs font-black tracking-widest text-white/30 uppercase mb-8">Net Capital Drain Over Time</h3>
               <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={reports} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                   <defs>
                     <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                       <stop offset="5%" stopColor="#d946ef" stopOpacity={0.8}/>
                       <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                     </linearGradient>
                   </defs>
                   <XAxis dataKey="month" stroke="#ffffff30" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                   <YAxis stroke="#ffffff30" fontSize={12} tickLine={false} axisLine={false} dx={-10} tickFormatter={(val) => `${currency === 'USD' ? '$' : ''}${val}`} />
                   <Tooltip 
                     contentStyle={{ backgroundColor: '#12121a', borderColor: '#ffffff20', borderRadius: '16px', fontWeight: 'bold' }}
                     itemStyle={{ color: '#d946ef' }}
                     formatter={(value) => [formatCurrency(value, currency), 'Output']}
                   />
                   <Area type="monotone" dataKey="total" stroke="#d946ef" strokeWidth={4} fillOpacity={1} fill="url(#colorTotal)" />
                 </AreaChart>
               </ResponsiveContainer>
             </div>
           )}
         </Card>
      </motion.div>
    </div>
  );
}
