'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/chat/Sidebar';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, User, CreditCard, Bell, Shield, Globe, Monitor, Zap, Check } from 'lucide-react';
import { AmbientBackground } from '@/components/ui/AmbientBackground';

export default function SettingsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', label: 'الملف الشخصي', icon: <User className="w-4 h-4" /> },
    { id: 'billing', label: 'الاشتراكات والدفع', icon: <CreditCard className="w-4 h-4" /> },
    { id: 'security', label: 'الأمان والخصوصية', icon: <Shield className="w-4 h-4" /> },
    { id: 'appearance', label: 'المظهر', icon: <Monitor className="w-4 h-4" /> },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
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

                       <button className="px-10 py-4 premium-gradient text-white rounded-2xl font-black text-sm shadow-2xl shadow-accent/20">
                          حفظ التغييرات
                       </button>
                    </div>
                  )}

                  {activeTab === 'billing' && (
                    <div className="space-y-10">
                       <div className="p-8 glass bg-accent/5 rounded-[2.5rem] border-accent/20 flex flex-col md:flex-row justify-between items-center gap-8 relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-32 h-32 bg-accent/20 blur-3xl" />
                          <div className="z-10 text-center md:text-right">
                             <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent text-white text-[9px] font-black uppercase mb-4 tracking-widest">Active Plan</div>
                             <h3 className="text-4xl font-black mb-2 flex items-center justify-center md:justify-start gap-3">
                                Aura Pro 
                                <Zap className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                             </h3>
                             <p className="opacity-50 font-bold">يتم التجديد تلقائياً في 15 يونيو 2026</p>
                          </div>
                          <div className="z-10">
                             <div className="text-4xl font-black mb-1">$49.00<span className="text-lg opacity-30">/mo</span></div>
                             <p className="opacity-40 text-xs font-bold">شامل جميع المميزات المتقدمة</p>
                          </div>
                       </div>

                       <div className="space-y-6">
                          <h4 className="text-xl font-black px-4">طرق الدفع</h4>
                          <div className="p-6 glass rounded-2xl border-white/5 flex items-center justify-between group cursor-pointer hover:border-white/10 transition-all">
                             <div className="flex items-center gap-4">
                                <div className="w-12 h-8 glass rounded-lg flex items-center justify-center font-bold text-xs">VISA</div>
                                <div className="flex flex-col">
                                   <span className="text-sm font-black">•••• •••• •••• 4242</span>
                                   <span className="text-[10px] font-bold opacity-30">تاريخ الانتهاء: 12/28</span>
                                </div>
                             </div>
                             <Check className="w-5 h-5 text-green-500" />
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
