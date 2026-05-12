'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Plus, MessageSquare, Trash2, Settings, LogOut, ChevronLeft, Bot, Sparkles, FolderOpen, History, Star, LayoutDashboard } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useChatStore } from '@/store/useChatStore';
import { signOut } from 'next-auth/react';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  isAdmin?: boolean;
}

export function Sidebar({ isOpen, setIsOpen, isAdmin }: SidebarProps) {
  const pathname = usePathname();
  const [chats, setChats] = useState<any[]>([]);
  const deleteChat = async (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation();
    if (!window.confirm("هل أنت متأكد من حذف هذه المحادثة؟")) return;

    try {
      const res = await fetch(`/api/chats/${chatId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setChats(prev => prev.filter(c => c.id !== chatId));
        if (currentChatId === chatId) {
          setCurrentChatId(null);
          clearMessages();
        }
      } else {
        const error = await res.json();
        alert(error.error || "فشل حذف المحادثة");
      }
    } catch (err) {
      console.error("Delete Chat Error:", err);
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

      {/* Action Button - Premium Redesign */}
      <div className="px-6 mb-8">
        <button 
          onClick={createNewChat}
          className="group relative w-full py-4 premium-gradient rounded-2xl flex items-center justify-center gap-3 font-black text-white shadow-xl shadow-accent/20 hover:shadow-accent/40 transition-all duration-300 overflow-hidden active:scale-95"
        >
          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-500" />
          <span className="relative z-10">محادثة جديدة</span>
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
                <Trash2 
                  onClick={(e) => deleteChat(e, chat.id)}
                  className="w-4 h-4 text-red-500/50 opacity-0 group-hover:opacity-100 transition-all hover:text-red-500" 
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="p-6 border-t border-white/5 space-y-4">
        {isAdmin && (
          <Link href="/admin" className={cn(
            "flex items-center gap-3 px-4 py-2 opacity-50 hover:opacity-100 transition-all font-black text-sm group",
            pathname === '/admin' && "opacity-100 text-accent"
          )}>
            <LayoutDashboard className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span>لوحة التحكم</span>
          </Link>
        )}

        <Link href="/settings" className={cn(
          "flex items-center gap-3 px-4 py-2 opacity-50 hover:opacity-100 transition-all font-black text-sm group",
          pathname === '/settings' && "opacity-100 text-accent"
        )}>
          <Settings className="w-5 h-5 group-hover:rotate-90 transition-transform duration-500" />
          <span>الإعدادات</span>
        </Link>
        
        <button 
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="flex items-center gap-3 px-4 py-2 text-red-500 opacity-50 hover:opacity-100 transition-all font-black text-sm group w-full"
        >
          <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span>تسجيل الخروج</span>
        </button>
        
        <div className="pt-6 text-[9px] text-center opacity-20 font-black tracking-widest uppercase">
           Handcrafted by Hamad Al Abdali © 2026
        </div>
      </div>
    </motion.aside>
  );
}

