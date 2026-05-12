'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Plus, MessageSquare, Trash2, Settings, LogOut, ChevronLeft, Bot, Sparkles, FolderOpen, History, Star } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useChatStore } from '@/store/useChatStore';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const pathname = usePathname();
  const [chats, setChats] = useState<any[]>([]);
  const { currentChatId, setCurrentChatId, clearMessages } = useChatStore();

  useEffect(() => {
    fetch('/api/chats')
      .then(res => res.json())
      .then(data => setChats(Array.isArray(data) ? data : []));
  }, []);

  const createNewChat = async () => {
    const res = await fetch('/api/chats', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'محادثة جديدة' })
    });
    const data = await res.json();
    if (data.id) {
      setChats([data, ...chats]);
      setCurrentChatId(data.id);
      clearMessages();
    }
  };

  return (
    <motion.aside
      initial={false}
      animate={{ 
        width: isOpen ? 340 : 0, 
        opacity: isOpen ? 1 : 0,
        x: isOpen ? 0 : -20 
      }}
      className="h-screen glass border-r border-white/5 flex flex-col relative overflow-hidden z-30"
    >
      {/* Brand Header */}
      <div className="p-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 premium-gradient rounded-xl flex items-center justify-center shadow-2xl shadow-accent/40">
            <Bot className="text-white w-6 h-6" />
          </div>
          <div className="flex flex-col -space-y-1">
            <span className="text-xl font-black tracking-tighter text-gradient">AURA PRO</span>
            <span className="text-[9px] font-black opacity-30 tracking-[0.2em] uppercase">Intelligence</span>
          </div>
        </div>
        <button 
          onClick={() => setIsOpen(false)} 
          className="p-2 glass rounded-lg hover:bg-white/5 transition-all lg:hidden"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Action Button */}
      <div className="px-6 mb-8">
        <button 
          onClick={createNewChat}
          className="group relative w-full py-4 glass hover:bg-accent/10 rounded-2xl flex items-center justify-center gap-3 font-black transition-all border-dashed overflow-hidden"
        >
          <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
          <span>محادثة جديدة</span>
          <div className="absolute inset-0 bg-accent/5 opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-4 space-y-8 custom-scrollbar">
        <div>
          <p className="text-[10px] font-black opacity-20 uppercase tracking-[0.2em] px-4 mb-4 flex items-center gap-2">
            <History className="w-3 h-3" />
            سجل المحادثات
          </p>
          <div className="space-y-1">
            {chats.map((chat) => (
              <div 
                key={chat.id} 
                onClick={() => setCurrentChatId(chat.id)}
                className={cn(
                  "group flex items-center gap-3 p-4 rounded-2xl cursor-pointer transition-all border border-transparent",
                  chat.id === currentChatId ? "glass bg-white/5 border-white/5" : "hover:bg-white/5"
                )}
              >
                <MessageSquare className={cn("w-4 h-4", chat.id === currentChatId ? "text-accent" : "opacity-30")} />
                <span className={cn("flex-1 text-sm font-bold truncate", chat.id === currentChatId ? "opacity-100" : "opacity-50 group-hover:opacity-100")}>
                  {chat.title}
                </span>
                <Trash2 className="w-4 h-4 text-red-500/50 opacity-0 group-hover:opacity-100 transition-all hover:text-red-500" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-6 border-t border-white/5 space-y-4">
        <div className="glass rounded-2xl p-4 flex items-center gap-4 border-white/5 mb-4 group hover:border-accent/20 transition-all cursor-pointer">
           <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
              <Star className="w-5 h-5 text-accent" />
           </div>
           <div className="flex flex-col">
              <span className="text-xs font-black">Aura Unlimited</span>
              <span className="text-[9px] font-bold opacity-40">ترقية إلى الاشتراك المميز</span>
           </div>
        </div>

        <Link href="/settings" className="flex items-center gap-3 px-4 py-2 opacity-50 hover:opacity-100 transition-all font-black text-sm group">
          <Settings className="w-5 h-5 group-hover:rotate-90 transition-transform duration-500" />
          <span>الإعدادات</span>
        </Link>
        <button className="flex items-center gap-3 px-4 py-2 text-red-500 opacity-50 hover:opacity-100 transition-all font-black text-sm">
          <LogOut className="w-5 h-5" />
          <span>تسجيل الخروج</span>
        </button>
        
        <div className="pt-6 text-[9px] text-center opacity-20 font-black tracking-widest uppercase">
           Handcrafted by Hamad Al Abdali © 2026
        </div>
      </div>
    </motion.aside>
  );
}

