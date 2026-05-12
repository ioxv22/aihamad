'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Mic, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export function MessageInput({ onSend, disabled }: { onSend: (text: string, files?: File[]) => void, disabled?: boolean }) {
  const [input, setInput] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if (input.trim() || files.length > 0) {
      onSend(input, files);
      setInput('');
      setFiles([]);
      setPreviews([]);
    }
  };

  const [isListening, setIsListening] = useState(false);

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('المتصفح لا يدعم التعرف على الصوت.');
      return;
    }
    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.lang = 'ar-SA';
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(prev => prev + ' ' + transcript);
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    setFiles(prev => [...prev, ...selectedFiles]);
    
    selectedFiles.forEach(file => {
      const isImage = file.type.startsWith('image/');
      const isText = file.type.startsWith('text/') || ['application/json', 'application/javascript', 'text/plain', 'text/markdown'].includes(file.type) || file.name.endsWith('.py') || file.name.endsWith('.js') || file.name.endsWith('.ts') || file.name.endsWith('.txt');

      if (isImage) {
        const reader = new FileReader();
        reader.onload = (e) => setPreviews(prev => [...prev, e.target?.result as string]);
        reader.readAsDataURL(file);
      } else if (isText) {
        const reader = new FileReader();
        reader.onload = (e) => {
           setPreviews(prev => [...prev, 'doc']);
           // We'll store the text content in the data for the API
        };
        reader.readAsText(file);
      } else {
        setPreviews(prev => [...prev, 'doc']);
      }
    });
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  return (
    <div className="max-w-4xl mx-auto w-full px-6 pb-8 pt-4">
      {/* File Previews */}
      {previews.length > 0 && (
        <div className="flex gap-3 mb-4 px-4">
          {previews.map((preview, i) => (
            <div key={i} className="relative group">
               {preview === 'doc' ? (
                 <div className="w-16 h-16 glass rounded-xl flex items-center justify-center border-white/10">
                    <Paperclip className="w-6 h-6 opacity-40" />
                 </div>
               ) : (
                 <img src={preview} className="w-16 h-16 object-cover rounded-xl border border-white/10 shadow-xl" alt="Preview" />
               )}
               <button 
                 onClick={() => removeFile(i)}
                 className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity"
               >
                 ×
               </button>
            </div>
          ))}
        </div>
      )}

      <div className="relative glass rounded-[32px] p-2 shadow-2xl border-white/10 group focus-within:border-accent/40 transition-all">
        <div className="flex items-end gap-2 px-4 py-2">
          <input 
            type="file" 
            multiple 
            ref={fileInputRef} 
            className="hidden" 
            onChange={handleFileChange}
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="p-3 hover:bg-foreground/5 rounded-full transition-colors opacity-50 hover:opacity-100"
          >
            <Paperclip className="w-5 h-5" />
          </button>
          
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="اسأل DarkIT عن أي شيء..."
            className="flex-1 bg-transparent border-none focus:ring-0 resize-none py-3 px-2 text-lg max-h-60"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />

          <div className="flex items-center gap-2 mb-1">
            <button 
              onClick={startListening}
              className={cn(
                "p-3 rounded-full transition-colors",
                isListening ? "bg-red-500/20 text-red-500 animate-pulse" : "hover:bg-foreground/5 opacity-50 hover:opacity-100"
              )}
            >
              <Mic className="w-5 h-5" />
            </button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSend}
              disabled={!input.trim()}
              className="w-12 h-12 premium-gradient rounded-2xl flex items-center justify-center text-white shadow-lg shadow-accent/20 disabled:opacity-30 disabled:grayscale transition-all"
            >
              <Send className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
        
        {/* Decorative sparkle */}
        <div className="absolute -top-3 -right-3 w-8 h-8 premium-gradient rounded-full flex items-center justify-center text-white scale-0 group-focus-within:scale-100 transition-transform duration-500 shadow-lg">
           <Sparkles className="w-4 h-4" />
        </div>
      </div>
      <p className="text-[10px] text-center mt-4 opacity-40 font-bold tracking-wider">
        قد يخطئ الذكاء الاصطناعي، يرجى التحقق من المعلومات الهامة.
      </p>
    </div>
  );
}
