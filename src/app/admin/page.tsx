'use client';

import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/chat/Sidebar';
import { motion } from 'framer-motion';
import { LayoutDashboard, Users, MessageSquare, Image as ImageIcon, TrendingUp, Activity, ShieldAlert, Cpu } from 'lucide-react';
import { AmbientBackground } from '@/components/ui/AmbientBackground';

export default function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, logsRes] = await Promise.all([
          fetch('/api/admin/stats'),
          fetch('/api/admin/logs')
        ]);
        
        const stats = await statsRes.json();
        const logsData = await logsRes.json();
        
        setStatsData(stats);
        setLogs(logsData);
      } catch (err) {
        console.error('Failed to fetch admin data', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // Poll for updates every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const stats = [
    { label: 'إجمالي المستخدمين', val: statsData?.users || '...', icon: <Users />, trend: '+12%' },
    { label: 'المحادثات الكلية', val: statsData?.chats || '...', icon: <MessageSquare />, trend: '+5.4%' },
    { label: 'الرسائل المعالجة', val: statsData?.messages || '...', icon: <Activity />, trend: '+21%' },
    { label: 'إجمالي الأرباح', val: `$${statsData?.revenue?.toLocaleString() || '...'}`, icon: <TrendingUp />, trend: '+15%' },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      <main className="flex-1 flex flex-col relative overflow-hidden">
        <AmbientBackground />
        
        <header className="h-20 glass border-b border-white/5 px-8 flex items-center justify-between z-20">
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 premium-gradient rounded-xl flex items-center justify-center">
                <LayoutDashboard className="text-white w-5 h-5" />
             </div>
             <h1 className="font-black text-xl tracking-tight">Admin Terminal</h1>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="px-4 py-2 glass rounded-full border-green-500/20 text-green-500 text-[10px] font-black uppercase flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                Systems Operational
             </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
          <div className="max-w-7xl mx-auto space-y-10">
            
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
               {stats.map((stat, i) => (
                  <motion.div 
                    key={i}
                    whileHover={{ y: -5 }}
                    className="p-8 glass rounded-[2.5rem] border-white/5 shadow-2xl relative overflow-hidden group"
                  >
                     <div className="absolute top-0 right-0 w-24 h-24 bg-accent/5 blur-3xl -z-10 group-hover:bg-accent/10 transition-all" />
                     <div className="flex justify-between items-start mb-6">
                        <div className="w-12 h-12 rounded-2xl glass flex items-center justify-center border-white/10 opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all">
                           {stat.icon}
                        </div>
                        <span className={`text-[10px] font-black px-2.5 py-1 rounded-full ${stat.trend.startsWith('+') ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                           {stat.trend}
                        </span>
                     </div>
                     <div className="text-3xl font-black mb-1">{stat.val}</div>
                     <div className="text-[10px] font-black opacity-30 uppercase tracking-[0.2em]">{stat.label}</div>
                  </motion.div>
               ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
               {/* Real-time Activity */}
               <div className="lg:col-span-8 glass rounded-[3rem] p-10 border-white/10">
                  <div className="flex items-center justify-between mb-10">
                     <h3 className="text-2xl font-black flex items-center gap-3">
                        <Activity className="w-6 h-6 text-accent" />
                        النشاط الحي
                     </h3>
                     <TrendingUp className="opacity-20 w-6 h-6" />
                  </div>
                  
                  <div className="space-y-6">
                     {logs.length > 0 ? logs.map((log: any, i: number) => (
                        <div key={log.id || i} className="flex items-center justify-between p-4 rounded-2xl hover:bg-white/5 transition-all group">
                           <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl glass flex items-center justify-center font-bold text-xs">
                                {log.user ? log.user.substring(0, 2).toUpperCase() : 'AI'}
                              </div>
                              <div className="flex flex-col">
                                 <span className="text-sm font-black">{log.details}</span>
                                 <span className="text-[10px] font-bold opacity-30 uppercase">
                                   {log.location || 'Unknown'} • {log.timestamp ? new Date(log.timestamp.seconds * 1000).toLocaleString() : 'Just now'}
                                 </span>
                              </div>
                           </div>
                           <span className="text-[10px] font-black opacity-20">{log.plan || 'FREE'}</span>
                        </div>
                     )) : (
                        <div className="text-center py-10 opacity-30 font-black uppercase text-xs tracking-widest">
                           لا يوجد نشاط مسجل حالياً
                        </div>
                     )}
                  </div>
               </div>

               {/* System Health */}
               <div className="lg:col-span-4 space-y-6">
                  <div className="glass rounded-[3rem] p-8 border-white/10">
                     <h3 className="text-xl font-black mb-6 flex items-center gap-3">
                        <ShieldAlert className="w-5 h-5 text-yellow-500" />
                        حالة الخوادم
                     </h3>
                     <div className="space-y-6">
                        {['Main API', 'Vision Engine', 'Database', 'Cache'].map((service, i) => (
                           <div key={i} className="flex flex-col gap-2">
                              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest px-2">
                                 <span className="opacity-40">{service}</span>
                                 <span className="text-green-500">99.9%</span>
                              </div>
                              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                 <div className="h-full bg-green-500 w-[99.9%]" />
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>

                  <div className="p-8 premium-gradient rounded-[3rem] text-white shadow-2xl shadow-accent/20">
                     <h4 className="text-xl font-black mb-2">تنبيه أمان</h4>
                     <p className="text-sm font-medium opacity-80 mb-6 leading-relaxed">تم رصد محاولة وصول غير مصرح بها من عنوان IP مجهول. تم حظر العنوان تلقائياً.</p>
                     <button className="w-full py-4 bg-white/10 hover:bg-white/20 rounded-2xl font-black text-xs uppercase tracking-widest transition-all">
                        عرض التفاصيل
                     </button>
                  </div>
               </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
