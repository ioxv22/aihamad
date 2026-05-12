'use client';

import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/chat/Sidebar';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Users, MessageSquare, Image as ImageIcon, TrendingUp, Activity, ShieldAlert, Cpu, Settings as SettingsIcon } from 'lucide-react';
import { AmbientBackground } from '@/components/ui/AmbientBackground';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [statsData, setStatsData] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'logs' | 'config'>('overview');

  useEffect(() => {
    if (status === 'unauthenticated' || (status === 'authenticated' && !(session?.user as any)?.isAdmin)) {
      router.push('/chat');
    }
  }, [status, session, router]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, logsRes, usersRes] = await Promise.all([
          fetch('/api/admin/stats'),
          fetch('/api/admin/logs'),
          fetch('/api/admin/users')
        ]);
        
        const stats = await statsRes.json();
        const logsData = await logsRes.json();
        const usersData = await usersRes.json();
        
        setStatsData(stats);
        setLogs(logsData);
        setUsers(usersData);
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
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} isAdmin={(session?.user as any)?.isAdmin} />
      
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
             <div className="flex glass rounded-2xl p-1 border-white/5">
                {(['overview', 'users', 'logs', 'config'] as const).map((tab) => (
                   <button
                     key={tab}
                     onClick={() => setActiveTab(tab)}
                     className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                       activeTab === tab ? 'premium-gradient text-white shadow-lg' : 'opacity-40 hover:opacity-100'
                     }`}
                   >
                     {tab === 'overview' ? 'نظرة عامة' : tab === 'users' ? 'المستخدمين' : tab === 'logs' ? 'السجلات' : 'الإعدادات'}
                   </button>
                ))}
             </div>
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

            <AnimatePresence mode="wait">
              {activeTab === 'overview' && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="grid grid-cols-1 lg:grid-cols-12 gap-10"
                >
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
                </motion.div>
              )}

              {activeTab === 'users' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="glass rounded-[3rem] p-10 border-white/10"
                >
                  <div className="flex items-center justify-between mb-10">
                    <h3 className="text-2xl font-black flex items-center gap-3">
                      <Users className="w-6 h-6 text-accent" />
                      إدارة المستخدمين
                    </h3>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="text-left text-[10px] font-black uppercase tracking-[0.2em] opacity-30 border-b border-white/5">
                          <th className="pb-6 px-4">المستخدم</th>
                          <th className="pb-6 px-4">البريد الإلكتروني</th>
                          <th className="pb-6 px-4">الخطة</th>
                          <th className="pb-6 px-4">الاستخدام</th>
                          <th className="pb-6 px-4">تاريخ الانضمام</th>
                          <th className="pb-6 px-4">الإجراءات</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {users.map((user) => (
                          <tr key={user.id} className="group hover:bg-white/5 transition-all">
                            <td className="py-6 px-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl glass flex items-center justify-center font-bold">
                                  {user.name?.substring(0, 2).toUpperCase() || 'U'}
                                </div>
                                <span className="font-black text-sm">{user.name || 'Anonymous'}</span>
                              </div>
                            </td>
                            <td className="py-6 px-4 text-xs font-medium opacity-60">{user.email}</td>
                            <td className="py-6 px-4">
                              <span className={`text-[10px] font-black px-3 py-1 rounded-full ${
                                user.subscription?.plan === 'pro' ? 'premium-gradient text-white' : 'glass border-white/10 opacity-60'
                              }`}>
                                {user.subscription?.plan?.toUpperCase() || 'FREE'}
                              </span>
                            </td>
                            <td className="py-6 px-4">
                              <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-black opacity-40 uppercase tracking-tighter">
                                  {user.usage?.totalTokens?.toLocaleString() || 0} Tokens
                                </span>
                                <div className="h-1 w-20 bg-white/5 rounded-full overflow-hidden">
                                  <div className="h-full bg-accent w-1/3" />
                                </div>
                              </div>
                            </td>
                            <td className="py-6 px-4 text-[10px] font-bold opacity-30 uppercase">
                              {new Date(user.createdAt).toLocaleDateString()}
                            </td>
                            <td className="py-6 px-4">
                              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button className="p-2 glass rounded-lg hover:bg-accent/20 hover:text-accent transition-all">
                                  <Activity className="w-4 h-4" />
                                </button>
                                <button className="p-2 glass rounded-lg hover:bg-red-500/20 hover:text-red-500 transition-all">
                                  <ShieldAlert className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}

              {activeTab === 'logs' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="glass rounded-[3rem] p-10 border-white/10"
                >
                  <div className="flex items-center justify-between mb-10">
                    <h3 className="text-2xl font-black flex items-center gap-3">
                      <Cpu className="w-6 h-6 text-accent" />
                      سجلات النظام الكاملة
                    </h3>
                  </div>
                  <div className="space-y-4">
                    {logs.map((log: any, i: number) => (
                      <div key={log.id || i} className="p-6 glass rounded-2xl border-white/5 flex items-start justify-between">
                        <div className="flex gap-6">
                           <div className="text-[10px] font-black opacity-20 w-32 shrink-0">
                             {log.timestamp ? new Date(log.timestamp.seconds * 1000).toLocaleString() : 'Just now'}
                           </div>
                           <div className="flex flex-col gap-1">
                             <div className="flex items-center gap-3">
                                <span className={`text-[9px] font-black px-2 py-0.5 rounded-md ${
                                  log.action === 'SIGNUP' ? 'bg-green-500/20 text-green-500' :
                                  log.action === 'ERROR' ? 'bg-red-500/20 text-red-500' : 'bg-blue-500/20 text-blue-500'
                                }`}>
                                  {log.action}
                                </span>
                                <span className="text-sm font-black text-white/80">{log.user}</span>
                             </div>
                             <p className="text-xs font-medium opacity-50">{log.details}</p>
                           </div>
                        </div>
                        <div className="text-[10px] font-black opacity-20 uppercase tracking-widest">
                          {log.location}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'config' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-8"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="glass rounded-[3rem] p-10 border-white/10">
                        <h3 className="text-xl font-black mb-8 flex items-center gap-3">
                           <SettingsIcon className="w-5 h-5 text-accent" />
                           إعدادات النظام العامة
                        </h3>
                        <div className="space-y-6">
                           <div className="flex items-center justify-between p-4 glass rounded-2xl border-white/5">
                              <div className="flex flex-col gap-1">
                                 <span className="font-black text-sm">وضع الصيانة</span>
                                 <span className="text-[10px] font-bold opacity-30">إيقاف الموقع مؤقتاً للجميع باستثناء المشرفين</span>
                              </div>
                              <div className="w-12 h-6 glass rounded-full relative p-1 cursor-pointer">
                                 <div className="w-4 h-4 bg-white/20 rounded-full" />
                              </div>
                           </div>
                           <div className="flex items-center justify-between p-4 glass rounded-2xl border-white/5">
                              <div className="flex flex-col gap-1">
                                 <span className="font-black text-sm">التسجيل المفتوح</span>
                                 <span className="text-[10px] font-bold opacity-30">السماح للمستخدمين الجدد بإنشاء حسابات</span>
                              </div>
                              <div className="w-12 h-6 glass rounded-full relative p-1 cursor-pointer">
                                 <div className="w-4 h-4 bg-green-500 rounded-full translate-x-6" />
                              </div>
                           </div>
                           <div className="flex items-center justify-between p-4 glass rounded-2xl border-white/5">
                              <div className="flex flex-col gap-1">
                                 <span className="font-black text-sm">تتبع الأداء</span>
                                 <span className="text-[10px] font-bold opacity-30">تسجيل بيانات الاستخدام المفصلة</span>
                              </div>
                              <div className="w-12 h-6 glass rounded-full relative p-1 cursor-pointer">
                                 <div className="w-4 h-4 bg-green-500 rounded-full translate-x-6" />
                              </div>
                           </div>
                        </div>
                     </div>

                     <div className="glass rounded-[3rem] p-10 border-white/10">
                        <h3 className="text-xl font-black mb-8 flex items-center gap-3">
                           <ShieldAlert className="w-5 h-5 text-accent" />
                           مفاتيح الـ API المفعلة
                        </h3>
                        <div className="space-y-4">
                           {['Google Gemini', 'OpenAI (GPT)', 'Anthropic (Claude)', 'Firebase Server'].map((api) => (
                              <div key={api} className="flex items-center justify-between p-4 glass rounded-2xl border-white/5">
                                 <span className="font-black text-xs">{api}</span>
                                 <div className="flex items-center gap-2">
                                    <span className="text-[9px] font-black opacity-30 tracking-tighter">sk-••••••••••••••••</span>
                                    <div className="w-2 h-2 rounded-full bg-green-500" />
                                 </div>
                              </div>
                           ))}
                        </div>
                        <button className="w-full mt-6 py-4 glass border-accent/20 text-accent rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-accent/5 transition-all">
                           تحديث المفاتيح
                        </button>
                     </div>
                  </div>

                  <div className="glass rounded-[3rem] p-10 border-white/10">
                     <h3 className="text-xl font-black mb-8">إدارة نماذج الذكاء الاصطناعي</h3>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                          { name: 'RedFox Fusion', status: 'Active', load: '5%' },
                          { name: 'GPT-5 Nano', status: 'Active', load: '18%' },
                          { name: 'Gemini 1.5 Pro', status: 'Active', load: '12%' },
                          { name: 'GPT-4o', status: 'Active', load: '45%' },
                          { name: 'Claude 3.5', status: 'Active', load: '8%' },
                          { name: 'Aura Flux Pro', status: 'Active', load: '22%' },
                        ].map((m) => (
                           <div key={m.name} className="p-6 glass rounded-2xl border-white/5">
                              <div className="flex justify-between items-start mb-4">
                                 <span className="font-black text-sm">{m.name}</span>
                                 <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${m.status === 'Active' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                    {m.status}
                                 </span>
                              </div>
                              <div className="flex flex-col gap-2">
                                 <div className="flex justify-between text-[9px] font-black opacity-30 uppercase tracking-widest">
                                    <span>Current Load</span>
                                    <span>{m.load}</span>
                                 </div>
                                 <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                    <div className={`h-full bg-accent transition-all duration-1000`} style={{ width: m.load }} />
                                 </div>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </div>
      </main>
    </div>
  );
}
