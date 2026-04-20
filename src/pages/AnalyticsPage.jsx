import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { getMonthlyReports, getUserSubscriptions } from '../services/firestore';
import { formatCurrency, convertCurrency } from '../lib/services';
import { Card } from '../components/ui/Card';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { motion } from 'framer-motion';

const CATEGORY_COLORS = {
  Entertainment: '#ec4899', // pink
  Productivity: '#3b82f6', // blue
  Utility: '#eab308', // yellow
  Gaming: '#22c55e', // green
  Cloud: '#06b6d4', // cyan
  Other: '#8b5cf6' // purple
};

export function AnalyticsPage() {
  const { user } = useAuth();
  const { currency } = useSettings();
  const [reports, setReports] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Entering the Astral Plane to retrieve data logs
  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        try {
          const [history, subs] = await Promise.all([
            getMonthlyReports(user.uid),
            getUserSubscriptions(user.uid)
          ]);
          setReports(history);
          setSubscriptions(subs);
        } catch (error) {
          console.error("The crystal ball cracked:", error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchData();
  }, [user]);

  // Slicing your financial soul into delicious pie based on active categories
  const categoryData = React.useMemo(() => {
    const sums = {};
    subscriptions.forEach(sub => {
      const cat = sub.category || 'Other';
      // Normalize to monthly equivalent for the pie chart
      const monthlyPrice = sub.cycle === 'yearly' ? sub.price / 12 : sub.price;
      sums[cat] = (sums[cat] || 0) + convertCurrency(monthlyPrice, currency);
    });
    return Object.entries(sums)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [subscriptions, currency]);

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

      <div className="grid gap-6 md:grid-cols-12 md:h-[500px]">
        {/* Category Intelligence Pie */}
        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.1 }} className="md:col-span-4 h-[400px] md:h-full">
           <Card className="glass-panel p-8 h-full flex flex-col justify-center border border-white/5 shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 blur-[80px] rounded-full pointer-events-none" />
             <h3 className="text-xs font-black tracking-widest text-white/30 uppercase mb-4 text-center z-10">Category Drain Assessment</h3>
             
             {categoryData.length === 0 ? (
               <div className="text-center text-white/40 font-bold tracking-[0.3em] text-sm uppercase z-10">
                 No sacrifices detected.
               </div>
             ) : (
               <div className="w-full h-full relative z-10">
                 <ResponsiveContainer width="100%" height="100%">
                   <PieChart>
                     <Pie
                       data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value"
                       stroke="none"
                     >
                       {categoryData.map((entry, index) => (
                         <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.name] || CATEGORY_COLORS.Other} />
                       ))}
                     </Pie>
                     <Tooltip 
                       contentStyle={{ backgroundColor: '#12121a', borderColor: '#ffffff20', borderRadius: '16px', fontWeight: 'bold' }}
                       itemStyle={{ color: '#fff' }}
                       formatter={(value) => [formatCurrency(value, currency), 'Monthly Cost']}
                     />
                   </PieChart>
                 </ResponsiveContainer>
               </div>
             )}
           </Card>
        </motion.div>

        {/* Historical Timeline */}
        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2 }} className="md:col-span-8 h-[400px] md:h-full">
           <Card className="glass-panel p-8 h-full flex flex-col justify-center border border-white/5 shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 w-96 h-96 bg-fuchsia-500/10 blur-[100px] rounded-full pointer-events-none" />
             
             {reports.length < 1 ? (
               <div className="text-center text-white/40 font-bold tracking-[0.3em] text-sm uppercase relative z-10">
                 Timelines insufficient for graphing protocol.
               </div>
             ) : (
               <div className="w-full h-full relative z-10">
                 <h3 className="text-xs font-black tracking-widest text-white/30 uppercase mb-8">Net Capital Drain Timeline</h3>
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
    </div>
  );
}
