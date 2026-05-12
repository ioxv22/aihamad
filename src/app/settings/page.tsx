'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Sidebar } from '@/components/chat/Sidebar';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, User, Shield, Monitor, Check } from 'lucide-react';
import { AmbientBackground } from '@/components/ui/AmbientBackground';
import { useSession } from 'next-auth/react';

export const dynamic = 'force-dynamic';

export default function SettingsPage() {
  const { data: session } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const tabs = [
    { id: 'profile', label: 'الملف الشخصي', icon: <User className="w-4 h-4" /> },
    { id: 'security', label: 'الأمان والخصوصية', icon: <Shield className="w-4 h-4" /> },
    { id: 'appearance', label: 'المظهر', icon: <Monitor className="w-4 h-4" /> },
  ];

  const handleSave = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      <Sidebar 
        isOpen={sidebarOpen} 
        setIsOpen={setSidebarOpen} 
        isAdmin={(session?.user as any)?.isAdmin} 
      />
      
      <main className="flex-1 flex flex-col relative overflow-hidden">
        <AmbientBackground />
        
        <header className="h-20 glass border-b border-white/5 px-8 flex items-center justify-between z-20">
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 glass rounded-xl flex items-center justify-center border-white/10">
                <SettingsIcon className="w-5 h-5 opacity-40" />
             </div>
             <h1 className="font-black text-xl tracking-tight">الإعدادات</h1>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-12">
            
            {/* Tabs Sidebar */}
            <div className="md:w-64 space-y-2">
               {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl font-black text-sm transition-all ${
                      activeTab === tab.id ? 'glass bg-white/5 border-white/5 opacity-100' : 'opacity-40 hover:opacity-100'
                    }`}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                  </button>
               ))}
            </div>

            {/* Tab Content */}
            <div className="flex-1">
               <motion.div
                 key={activeTab}
                 initial={{ opacity: 0, x: 20 }}
                 animate={{ opacity: 1, x: 0 }}
                 className="glass rounded-[3rem] p-10 border-white/10"
               >
                  {activeTab === 'profile' && (
                    <div className="space-y-8">
                       <div className="flex items-center gap-6">
                          <div className="w-24 h-24 rounded-3xl premium-gradient flex items-center justify-center shadow-2xl">
                             <User className="text-white w-10 h-10" />
                          </div>
                          <div>
                             <h3 className="text-2xl font-black">حمد العبدولي</h3>
                             <p className="opacity-40 font-bold">hamad@example.com</p>
                          </div>
                       </div>
                       
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                             <label className="text-[10px] font-black uppercase tracking-widest opacity-40 px-4">الاسم بالكامل</label>
                             <input type="text" defaultValue="حمد العبدولي" className="w-full p-4 glass rounded-2xl border-white/5 font-bold" />
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-black uppercase tracking-widest opacity-40 px-4">المسمى الوظيفي</label>
                             <input type="text" defaultValue="Senior Fullstack Developer" className="w-full p-4 glass rounded-2xl border-white/5 font-bold" />
                          </div>
                       </div>

                       <button 
                         onClick={handleSave}
                         className="px-10 py-4 premium-gradient text-white rounded-2xl font-black text-sm shadow-2xl shadow-accent/20 flex items-center gap-2"
                       >
                          {saveSuccess ? <><Check className="w-4 h-4" /> تم الحفظ</> : 'حفظ التغييرات'}
                       </button>
                    </div>
                  )}

                  {activeTab === 'security' && (
                    <div className="space-y-10">
                       <h3 className="text-2xl font-black px-4">إعدادات الأمان</h3>
                       <div className="grid grid-cols-1 gap-4">
                          <div className="p-6 glass rounded-2xl border-white/5 flex items-center justify-between">
                             <div className="flex flex-col gap-1">
                                <span className="font-black">المصادقة الثنائية (2FA)</span>
                                <span className="text-[10px] font-bold opacity-30">تأمين حسابك بطبقة حماية إضافية</span>
                             </div>
                             <div className="w-12 h-6 glass rounded-full relative p-1 cursor-pointer">
                                <div className="w-4 h-4 bg-green-500 rounded-full translate-x-6" />
                             </div>
                          </div>
                          <div className="p-6 glass rounded-2xl border-white/5 flex items-center justify-between">
                             <div className="flex flex-col gap-1">
                                <span className="font-black">سجل الدخول</span>
                                <span className="text-[10px] font-bold opacity-30">عرض جميع الأجهزة التي سجلت الدخول بحسابك</span>
                             </div>
                             <button className="px-4 py-2 glass hover:bg-white/5 rounded-xl text-xs font-black transition-all">عرض الكل</button>
                          </div>
                       </div>
                    </div>
                  )}

                  {activeTab === 'appearance' && (
                    <div className="space-y-10">
                       <h3 className="text-2xl font-black px-4">تخصيص المظهر</h3>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div 
                            onClick={() => setTheme('dark')}
                            className={`p-6 glass rounded-2xl flex items-center justify-between group cursor-pointer transition-all ${mounted && theme === 'dark' ? 'border-accent/40 bg-accent/5' : 'border-white/5 opacity-50 hover:opacity-100'}`}
                          >
                             <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center border border-white/10">
                                   <Monitor className="w-5 h-5" />
                                </div>
                                <span className="font-black">الوضع الليلي (Dark)</span>
                             </div>
                             {mounted && theme === 'dark' && <Check className="w-5 h-5 text-accent" />}
                          </div>
                          <div 
                            onClick={() => setTheme('light')}
                            className={`p-6 glass rounded-2xl flex items-center justify-between group cursor-pointer transition-all ${mounted && theme === 'light' ? 'border-accent/40 bg-accent/5' : 'border-white/5 opacity-50 hover:opacity-100'}`}
                          >
                             <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center border border-black/10">
                                   <Monitor className="w-5 h-5 text-black" />
                                </div>
                                <span className="font-black">الوضع النهاري (Light)</span>
                             </div>
                             {mounted && theme === 'light' && <Check className="w-5 h-5 text-accent" />}
                          </div>
                       </div>
                    </div>
                  )}
               </motion.div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
