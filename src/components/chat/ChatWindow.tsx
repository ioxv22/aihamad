'use client';

import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { User, Bot, Copy, Check, Sparkles, Terminal, RotateCcw, FolderOpen } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  attachments?: any[];
  imageUrl?: string; // For AI generated images
}

interface ChatWindowProps {
  messages: Message[];
  streamingMessage?: string;
  isLoading?: boolean;
}

export function ChatWindow({ messages, streamingMessage, isLoading }: ChatWindowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, streamingMessage]);

  return (
    <div ref={scrollRef} className="h-full overflow-y-auto px-6 py-10 scroll-smooth custom-scrollbar">
      <div className="max-w-4xl mx-auto space-y-10">
        {messages.length === 0 && !streamingMessage && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="h-[60vh] flex flex-col items-center justify-center text-center"
          >
            <div className="w-24 h-24 premium-gradient rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-accent/40 mb-8 animate-pulse">
              <Bot className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-5xl font-black tracking-tighter mb-4">AURA AI</h2>
            <p className="text-xl opacity-40 max-w-sm font-bold leading-relaxed">
              مرحباً بك في مستقبل الذكاء الاصطناعي. كيف يمكنني مساعدتك اليوم؟
            </p>
            
            <div className="grid grid-cols-2 gap-4 mt-12">
               {['اكتب كود بايثون', 'لخص هذا النص', 'خطط لرحلتي القادمة', 'توليد صورة فنية'].map((suggestion, i) => (
                  <button key={i} className="px-6 py-3 glass rounded-2xl text-sm font-bold hover:bg-white/5 transition-all border-white/5">
                    {suggestion}
                  </button>
               ))}
            </div>
          </motion.div>
        )}

        <AnimatePresence mode="popLayout">
          {messages.map((msg) => (
            <MessageItem key={msg.id} msg={msg} />
          ))}
          
          {streamingMessage && (
            <MessageItem 
              msg={{ 
                id: 'streaming', 
                role: 'assistant', 
                content: streamingMessage 
              }} 
              isStreaming 
            />
          )}
        </AnimatePresence>

        {isLoading && !streamingMessage && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            className="flex items-center gap-3 opacity-40 px-6"
          >
            <Sparkles className="w-4 h-4 animate-spin" />
            <span className="text-xs font-black uppercase tracking-widest">Aura is thinking...</span>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function MessageItem({ msg, isStreaming }: { msg: Message; isStreaming?: boolean }) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(msg.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      layout
      className={cn(
        "flex gap-6 group",
        msg.role === 'user' ? "flex-row-reverse" : "flex-row"
      )}
    >
      <div className={cn(
        "w-12 h-12 rounded-2xl flex-shrink-0 flex items-center justify-center shadow-2xl transition-transform group-hover:scale-110",
        msg.role === 'assistant' ? "premium-gradient text-white" : "glass text-foreground border-white/10"
      )}>
        {msg.role === 'assistant' ? <Bot className="w-6 h-6" /> : <User className="w-6 h-6" />}
      </div>

      <div className={cn(
        "relative flex-1 max-w-[85%] rounded-[2rem] p-7 transition-all duration-300",
        msg.role === 'assistant' 
          ? "glass border-white/5 shadow-xl hover:shadow-accent/5" 
          : "bg-accent/10 border border-accent/20 text-foreground"
      )}>
        {/* Role Label */}
        <div className="text-[10px] font-black uppercase tracking-widest opacity-30 mb-3 flex items-center justify-between">
           <span>{msg.role === 'assistant' ? 'Aura AI Intelligence' : 'User Session'}</span>
           <div className="flex items-center gap-2">
              {msg.role === 'assistant' && <Terminal className="w-3 h-3" />}
              <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
           </div>
        </div>

        {/* Attachments Display */}
        {msg.attachments && msg.attachments.length > 0 && (
           <div className="flex flex-wrap gap-3 mb-6">
              {msg.attachments.map((att: any, i: number) => (
                 att.type.startsWith('image/') ? (
                    <img 
                      key={i} 
                      src={att.data} 
                      alt="Attachment" 
                      className="max-w-[240px] max-h-[240px] rounded-[1.5rem] border border-white/10 shadow-2xl object-cover hover:scale-[1.02] transition-transform cursor-pointer" 
                    />
                 ) : (
                    <div key={i} className="flex items-center gap-4 p-4 glass rounded-2xl border-white/10 group/file cursor-pointer hover:bg-white/5 transition-all min-w-[200px]">
                       <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center text-accent group-hover/file:scale-110 transition-transform">
                          <FolderOpen className="w-5 h-5" />
                       </div>
                       <div className="flex flex-col overflow-hidden">
                          <span className="text-xs font-black truncate max-w-[150px]">{att.name}</span>
                          <span className="text-[9px] font-bold opacity-30 uppercase">Document File</span>
                       </div>
                    </div>
                 )
              ))}
           </div>
        )}

        {/* AI Generated Image */}
        {msg.imageUrl && (
           <div className="mb-6 rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
              <img src={msg.imageUrl} alt="Generated" className="w-full h-auto" />
              <div className="p-4 glass text-[10px] font-black uppercase tracking-widest opacity-40 text-center">
                 Generated by Aura Vision Engine
              </div>
           </div>
        )}

        <div className="prose prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-black/40 prose-pre:rounded-2xl prose-pre:border prose-pre:border-white/5 prose-code:text-accent font-medium text-lg lg:text-xl">
          <ReactMarkdown>{msg.content}</ReactMarkdown>
          {isStreaming && (
            <motion.span 
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 0.8, repeat: Infinity }}
              className="inline-block w-2 h-5 bg-accent ml-1 translate-y-1"
            />
          )}
        </div>

        {/* Action Buttons */}
        <div className="absolute top-4 left-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={copyToClipboard}
            className="p-2 rounded-xl glass hover:bg-white/10 transition-all border-white/10"
            title="Copy Message"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          {msg.role === 'assistant' && (
             <button className="p-2 rounded-xl glass hover:bg-white/10 transition-all border-white/10" title="Regenerate">
                <RotateCcw className="w-3.5 h-3.5" />
             </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

