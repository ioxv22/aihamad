'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/chat/Sidebar';
import { motion, AnimatePresence } from 'framer-motion';
import { Image as ImageIcon, Wand2, Download, Share2, Sparkles, LayoutGrid, Type, Palette } from 'lucide-react';
import { AmbientBackground } from '@/components/ui/AmbientBackground';

export default function ImageGeneratorPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    
    try {
      const response = await fetch('/api/vision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();
      if (data.url) {
        setGeneratedImages([data.url, ...generatedImages]);
      } else {
        throw new Error(data.error || 'Failed to generate image');
      }
    } catch (error) {
      console.error('Vision Error:', error);
      alert('حدث خطأ أثناء توليد الصورة. يرجى التأكد من مفتاح API.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      <main className="flex-1 flex flex-col relative overflow-hidden">
        <AmbientBackground />
        
        <header className="h-20 glass border-b border-white/5 px-8 flex items-center justify-between z-20">
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 premium-gradient rounded-xl flex items-center justify-center">
                <ImageIcon className="text-white w-5 h-5" />
             </div>
             <div className="flex flex-col">
                <h1 className="font-black text-xl tracking-tight">Aura Vision</h1>
                <p className="text-[10px] font-black opacity-30 uppercase tracking-widest">Image Synthesis Engine</p>
             </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            {/* Control Panel */}
            <div className="lg:col-span-4 space-y-8">
              <div className="glass rounded-[2.5rem] p-8 border-white/10 shadow-2xl">
                <h3 className="text-xl font-black mb-6 flex items-center gap-2">
                   <Wand2 className="w-5 h-5 text-accent" />
                   إعدادات التوليد
                </h3>
                
                <div className="space-y-6">
                  <div className="space-y-3">
                     <label className="text-[10px] font-black opacity-40 uppercase tracking-widest px-2">الوصف (Prompt)</label>
                     <textarea 
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="صف الصورة التي تتخيلها بالتفصيل..."
                        className="w-full h-40 glass rounded-2xl p-5 border-white/5 focus:border-accent/40 transition-all resize-none font-bold text-sm"
                     />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2">
                        <label className="text-[9px] font-black opacity-40 uppercase">الأبعاد</label>
                        <select className="w-full p-3 glass rounded-xl border-white/5 text-xs font-bold">
                           <option>1:1 Square</option>
                           <option>16:9 Cinematic</option>
                           <option>9:16 Portrait</option>
                        </select>
                     </div>
                     <div className="space-y-2">
                        <label className="text-[9px] font-black opacity-40 uppercase">الجودة</label>
                        <select className="w-full p-3 glass rounded-xl border-white/5 text-xs font-bold">
                           <option>Standard</option>
                           <option>HD (Pro)</option>
                           <option>4K Ultra</option>
                        </select>
                     </div>
                  </div>

                  <button 
                    onClick={handleGenerate}
                    disabled={isGenerating || !prompt}
                    className="w-full py-5 premium-gradient text-white rounded-2xl font-black text-lg shadow-2xl shadow-accent/30 hover:translate-y-[-4px] transition-all disabled:opacity-30 flex items-center justify-center gap-3"
                  >
                    {isGenerating ? <Sparkles className="w-6 h-6 animate-spin" /> : <Sparkles className="w-6 h-6" />}
                    <span>توليد الآن</span>
                  </button>
                </div>
              </div>

              {/* Presets */}
              <div className="grid grid-cols-2 gap-4">
                 {[
                   { icon: <Palette />, label: 'Cyberpunk' },
                   { icon: <LayoutGrid />, label: 'Minimal' },
                   { icon: <Type />, label: 'Typography' },
                   { icon: <Sparkles />, label: 'Fantasy' },
                 ].map((preset, i) => (
                    <button key={i} className="p-4 glass rounded-2xl border-white/5 hover:bg-white/5 transition-all flex flex-col items-center gap-3 group">
                       <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                          {preset.icon}
                       </div>
                       <span className="text-[10px] font-black uppercase tracking-widest opacity-40 group-hover:opacity-100">{preset.label}</span>
                    </button>
                 ))}
              </div>
            </div>

            {/* Preview Area */}
            <div className="lg:col-span-8">
               <AnimatePresence mode="wait">
                  {isGenerating ? (
                    <motion.div 
                      key="loader"
                      initial={{ opacity: 0 }} 
                      animate={{ opacity: 1 }} 
                      exit={{ opacity: 0 }}
                      className="aspect-square lg:aspect-video glass rounded-[3rem] border-white/5 flex flex-col items-center justify-center gap-6"
                    >
                       <div className="w-20 h-20 premium-gradient rounded-full animate-ping opacity-20" />
                       <div className="absolute flex flex-col items-center">
                          <Sparkles className="w-12 h-12 text-accent animate-pulse" />
                          <p className="mt-4 font-black opacity-40 uppercase tracking-widest text-xs animate-bounce">Generating Masterpiece...</p>
                       </div>
                    </motion.div>
                  ) : generatedImages.length > 0 ? (
                    <motion.div 
                      key="results"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="grid grid-cols-1 gap-8"
                    >
                       {generatedImages.map((img, i) => (
                          <div key={i} className="group relative rounded-[3rem] overflow-hidden glass border-white/20 shadow-2xl">
                             <img src={img} className="w-full aspect-video object-cover group-hover:scale-105 transition-transform duration-700" alt="Generated" />
                             <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-10">
                                <div className="flex items-center justify-between">
                                   <div className="flex flex-col">
                                      <span className="text-white font-black text-xl mb-1">Aura Vision v2.0</span>
                                      <span className="text-white/40 text-xs font-bold">Generated in 3.2s</span>
                                   </div>
                                   <div className="flex gap-4">
                                      <button className="p-4 glass rounded-2xl hover:bg-white/20 text-white transition-all">
                                         <Download className="w-5 h-5" />
                                      </button>
                                      <button className="p-4 glass rounded-2xl hover:bg-white/20 text-white transition-all">
                                         <Share2 className="w-5 h-5" />
                                      </button>
                                   </div>
                                </div>
                             </div>
                          </div>
                       ))}
                    </motion.div>
                  ) : (
                    <div className="aspect-square lg:aspect-video glass rounded-[3rem] border-dashed border-white/10 flex flex-col items-center justify-center text-center opacity-20">
                       <ImageIcon className="w-24 h-24 mb-6" />
                       <h2 className="text-3xl font-black">جاهز للبدء؟</h2>
                       <p className="text-lg font-bold">أدخل وصفاً في اللوحة الجانبية لتوليد صورك الأولى</p>
                    </div>
                  )}
               </AnimatePresence>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
