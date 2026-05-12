'use client';

import { useState, useEffect, useRef } from 'react';
import { Sidebar } from '@/components/chat/Sidebar';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { MessageInput } from '@/components/chat/MessageInput';
import { Menu, Sparkles, Bot, Settings as SettingsIcon } from 'lucide-react';
import { useChatStore } from '@/store/useChatStore';
import { motion, AnimatePresence } from 'framer-motion';

export default function ChatPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { messages, addMessage, setMessages, isLoading, setLoading, activeModel, currentChatId, setCurrentChatId } = useChatStore();
  const [currentResponse, setCurrentResponse] = useState('');

  // Load history when chat changes
  useEffect(() => {
    if (currentChatId) {
      fetch(`/api/chats/${currentChatId}/messages`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setMessages(data.map((m: any) => ({
              id: m.id,
              role: m.role,
              content: m.content,
              createdAt: new Date(m.createdAt)
            })));
          }
        });
    }
  }, [currentChatId]);

  const handleSend = async (text: string, files?: File[]) => {
    if (!text.trim() && (!files || files.length === 0)) return;

    let chatId = currentChatId;
    
    // Create chat if none exists
    if (!chatId) {
      const res = await fetch('/api/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: text.slice(0, 30) + '...' })
      });
      const data = await res.json();
      chatId = data.id;
      setCurrentChatId(chatId);
    }

    const attachments = await Promise.all((files || []).map(async (file) => {
      const isImage = file.type.startsWith('image/');
      const isText = file.type.startsWith('text/') || ['application/json', 'application/javascript'].includes(file.type) || file.name.endsWith('.py') || file.name.endsWith('.js') || file.name.endsWith('.ts') || file.name.endsWith('.txt');

      let data = "";
      if (isImage) {
        data = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
              const canvas = document.createElement('canvas');
              let width = img.width;
              let height = img.height;
              const max = 512; 
              if (width > height) { if (width > max) { height *= max / width; width = max; } } 
              else { if (height > max) { width *= max / height; height = max; } }
              canvas.width = width;
              canvas.height = height;
              const ctx = canvas.getContext('2d');
              ctx?.drawImage(img, 0, 0, width, height);
              resolve(canvas.toDataURL('image/jpeg', 0.5));
            };
            img.src = e.target?.result as string;
          };
          reader.readAsDataURL(file);
        });
      } else if (isText) {
        data = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.readAsText(file);
        });
      } else {
        data = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.readAsDataURL(file);
        });
      }
      return {
        name: file.name,
        type: file.type,
        data: data,
        isText: isText
      };
    }));

    const userMessage = {
      id: Date.now().toString(),
      role: 'user' as const,
      content: text,
      attachments,
      createdAt: new Date(),
    };

    addMessage(userMessage);
    setLoading(true);
    setCurrentResponse('');

    try {
      // Create a clean history without large previous attachments
      const cleanHistory = messages.map(m => ({
        role: m.role,
        content: m.content,
        // We omit attachments for previous messages to keep the payload small
      }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...cleanHistory, {
            role: userMessage.role,
            content: userMessage.content,
            attachments: userMessage.attachments
          }],
          model: activeModel,
          chatId: chatId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch response');
      }

      // Check if response is JSON (Image Gen) or Stream (Standard Chat)
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        addMessage({
          id: Date.now().toString(),
          role: 'assistant',
          content: data.content,
          imageUrl: data.imageUrl,
          createdAt: new Date(),
        });
        setLoading(false);
        return;
      }

      const reader = response.body?.getReader();
      const decoder = new TextEncoder();
      let fullText = '';

      if (reader) {
        const aiMessageId = (Date.now() + 1).toString();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = new TextDecoder().decode(value);
          fullText += chunk;
          setCurrentResponse(fullText);
        }

        addMessage({
          id: aiMessageId,
          role: 'assistant',
          content: fullText,
          model: activeModel,
          createdAt: new Date(),
        });
        setCurrentResponse('');
      }
    } catch (error) {
      console.error('Chat Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground selection:bg-accent/30">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Top Header Bar */}
        <header className="h-20 glass border-b border-white/5 px-8 flex items-center justify-between z-20">
          <div className="flex items-center gap-4">
            {!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2.5 glass rounded-xl hover:bg-white/5 transition-all"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}
            <div className="flex flex-col">
              <h1 className="font-black text-xl tracking-tight flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-accent" />
                Aura AI <span className="opacity-30 font-bold text-xs uppercase tracking-widest ml-2">v2.0</span>
              </h1>
              <select 
                value={activeModel}
                onChange={(e) => useChatStore.getState().setActiveModel(e.target.value)}
                className="bg-white/5 text-[11px] font-black uppercase tracking-tighter border border-white/10 rounded-lg px-2 py-1 focus:ring-accent focus:border-accent cursor-pointer hover:bg-white/10 transition-all outline-none"
              >
                <optgroup label="Google Intelligence" className="bg-[#0f0f0f]">
                  <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                  <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
                </optgroup>
                <optgroup label="OpenAI Systems" className="bg-[#0f0f0f]">
                  <option value="gpt-4o">GPT-4o (Omni)</option>
                  <option value="gpt-4-turbo">GPT-4 Turbo</option>
                </optgroup>
                <optgroup label="Anthropic Models" className="bg-[#0f0f0f]">
                  <option value="claude-3-5-sonnet-20240620">Claude 3.5 Sonnet</option>
                </optgroup>
                <optgroup label="Experimental Systems" className="bg-[#0f0f0f]">
                  <option value="gpt-5">GPT-5 (Ultra)</option>
                  <option value="deepseek">DeepSeek R1</option>
                  <option value="grok">Grok-1 (xAI)</option>
                </optgroup>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-1.5 glass rounded-full border-white/5 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
              <span className="text-[10px] font-black opacity-60 uppercase">Connected</span>
            </div>
            <button className="w-10 h-10 glass rounded-xl flex items-center justify-center hover:bg-white/5 transition-all">
              <SettingsIcon className="w-5 h-5 opacity-40" />
            </button>
          </div>
        </header>

        {/* Chat Area */}
        <div className="flex-1 overflow-hidden relative">
          <ChatWindow
            messages={messages}
            streamingMessage={currentResponse}
            isLoading={isLoading}
          />
        </div>

        {/* Input Area */}
        <div className="relative z-10 bg-gradient-to-t from-background via-background to-transparent pt-10">
          <MessageInput onSend={handleSend} disabled={isLoading} />
        </div>

        {/* Background Decorations */}
        <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-accent/5 blur-[120px] pointer-events-none -z-10" />
        <div className="absolute bottom-0 left-0 w-[40%] h-[40%] bg-accent-secondary/5 blur-[120px] pointer-events-none -z-10" />
      </main>
    </div>
  );
}

