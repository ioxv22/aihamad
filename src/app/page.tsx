'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Bot, Sparkles, Zap, Shield, Globe, Cpu, ArrowRight, Star, CheckCircle2 } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { AmbientBackground } from '@/components/ui/AmbientBackground';

export default function LandingPage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen selection:bg-accent selection:text-white overflow-x-hidden">
      <AmbientBackground />
      
      {/* Header */}
      <header className="fixed top-0 w-full z-50 glass border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div 
              whileHover={{ rotate: 10, scale: 1.1 }}
              className="w-11 h-11 premium-gradient rounded-2xl flex items-center justify-center shadow-2xl shadow-accent/40"
            >
              <Bot className="text-white w-6 h-6" />
            </motion.div>
            <div className="flex flex-col -space-y-1">
              <span className="text-2xl font-black tracking-tighter text-gradient">AURA AI</span>
              <span className="text-[10px] font-bold opacity-40 tracking-widest uppercase">Next Gen Intelligence</span>
            </div>
          </div>
          
          <nav className="hidden lg:flex items-center gap-10 text-sm font-bold tracking-wide">
            <Link href="#features" className="hover:text-accent transition-all opacity-70 hover:opacity-100">المميزات</Link>
            <Link href="#demo" className="hover:text-accent transition-all opacity-70 hover:opacity-100">عرض حي</Link>
            <Link href="#pricing" className="hover:text-accent transition-all opacity-70 hover:opacity-100">الأسعار</Link>
            <Link href="/about" className="hover:text-accent transition-all opacity-70 hover:opacity-100">المطور</Link>
          </nav>

          <div className="flex items-center gap-5">
            <button 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="w-10 h-10 rounded-xl glass flex items-center justify-center hover:scale-110 transition-all border-white/10"
            >
              {theme === 'dark' ? <Sparkles className="w-5 h-5 text-yellow-400" /> : <Bot className="w-5 h-5 text-accent" />}
            </button>
            <Link 
              href="/login" 
              className="px-8 py-3 premium-gradient text-white rounded-2xl font-black text-sm hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-accent/30 hidden sm:block"
            >
              دخول المنصة
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-52 pb-32 flex flex-col items-center">
        <div className="max-w-7xl mx-auto px-6 text-center z-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-white/5 border border-white/10 text-accent text-xs font-black mb-10 backdrop-blur-xl animate-bounce">
              <Star className="w-4 h-4 fill-accent" />
              <span className="tracking-widest uppercase">الإصدار التجريبي 2.0 متاح الآن</span>
            </div>
            
            <h1 className="text-7xl md:text-9xl font-black leading-[0.9] mb-10 tracking-tighter">
              المستقبل <br />
              <span className="text-gradient">بين يديك</span>
            </h1>
            
            <p className="max-w-3xl mx-auto text-xl md:text-2xl opacity-60 mb-14 leading-relaxed font-medium">
              Aura AI ليس مجرد روبوت محادثة. إنه نظام بيئي متكامل للذكاء الاصطناعي يجمع بين توليد الصور، تحليل الملفات، والبرمجة المتقدمة في واجهة سينمائية واحدة.
            </p>
            
            <div className="flex flex-col md:flex-row items-center justify-center gap-8">
              <Link href="/chat" className="group relative w-full md:w-auto px-12 py-6 premium-gradient text-white rounded-[2rem] font-black text-2xl shadow-[0_20px_50px_rgba(157,80,187,0.4)] hover:translate-y-[-6px] transition-all overflow-hidden">
                <div className="relative z-10 flex items-center gap-3">
                  ابدأ الآن مجاناً
                  <ArrowRight className="group-hover:translate-x-2 transition-transform" />
                </div>
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
              </Link>
              <Link href="#demo" className="w-full md:w-auto px-12 py-6 glass rounded-[2rem] font-black text-2xl hover:bg-white/10 transition-all border-white/10">
                مشاهدة العرض
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Mockup Preview */}
        <motion.div 
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="mt-32 w-full max-w-6xl px-6"
        >
          <div className="relative p-2 rounded-[2.5rem] glass border-white/20 shadow-2xl overflow-hidden aspect-video">
            <div className="absolute inset-0 bg-gradient-to-tr from-accent/20 to-transparent pointer-events-none" />
            <img 
              src="https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=2000&auto=format&fit=crop" 
              alt="Aura AI Interface" 
              className="w-full h-full object-cover rounded-[2rem] opacity-90"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-24 h-24 rounded-full glass flex items-center justify-center cursor-pointer hover:scale-110 transition-all">
                <Zap className="w-10 h-10 text-white fill-white" />
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-40 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              { icon: <Cpu />, title: 'معالجة لغوية فائقة', desc: 'نستخدم أحدث نماذج GPT-4 و Claude 3 لتقديم إجابات دقيقة ومنطقية.' },
              { icon: <Sparkles />, title: 'توليد صور فني', desc: 'حوّل خيالك إلى حقيقة مع محرك Aura Image Gen المدمج.' },
              { icon: <Globe />, title: 'تحليل الملفات الذكي', desc: 'ارفع ملفات PDF أو أكواد برمجية واطلب من Aura تحليلها في ثوانٍ.' },
            ].map((f, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -15, scale: 1.02 }}
                className="p-12 rounded-[3rem] glass hover:border-accent/40 transition-all group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 blur-3xl -z-10" />
                <div className="w-16 h-16 rounded-2xl premium-gradient flex items-center justify-center text-white mb-8 group-hover:rotate-6 transition-transform">
                  {f.icon}
                </div>
                <h3 className="text-3xl font-black mb-6">{f.title}</h3>
                <p className="opacity-50 leading-relaxed text-xl font-medium">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof / Stats */}
      <section className="py-20 border-y border-white/5 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
          {[
            { label: 'مستخدم نشط', val: '+50K' },
            { label: 'رسالة يومياً', val: '+1M' },
            { label: 'دقة الاستجابة', val: '99.9%' },
            { label: 'وقت التشغيل', val: '100%' },
          ].map((s, i) => (
            <div key={i}>
              <div className="text-4xl md:text-5xl font-black text-gradient mb-2">{s.val}</div>
              <div className="opacity-40 font-bold uppercase tracking-widest text-xs">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials / Comments */}
      <section id="testimonials" className="py-40 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-black mb-6 tracking-tighter">ماذا يقول المبدعون؟</h2>
            <p className="opacity-40 text-xl font-bold">آراء مستخدمينا الذين اختاروا Aura لبناء مستقبلهم.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeedbackList />
          </div>

          {/* Submission Form */}
          <div className="mt-32 max-w-3xl mx-auto glass rounded-[3rem] p-12 border-white/10 shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 left-0 w-32 h-32 bg-accent/10 blur-3xl" />
             <h3 className="text-3xl font-black mb-8">اترك تعليقك</h3>
             <FeedbackForm />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-32 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-20">
          <div className="col-span-1 md:col-span-2">
             <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 premium-gradient rounded-xl flex items-center justify-center">
                <Bot className="text-white w-5 h-5" />
              </div>
              <span className="text-3xl font-black tracking-tighter text-gradient">AURA AI</span>
            </div>
            <p className="text-xl opacity-40 max-w-md leading-relaxed font-medium">
              بناء مستقبل الذكاء الاصطناعي بأيدي عربية. تم التطوير ليكون المنافس الأول عالمياً في مجال أدوات الإنتاجية الذكية.
            </p>
          </div>
          
          <div className="flex flex-col gap-6">
            <h4 className="font-black text-xl">روابط سريعة</h4>
            <Link href="#" className="opacity-50 hover:opacity-100 transition-all font-bold">الرئيسية</Link>
            <Link href="#" className="opacity-50 hover:opacity-100 transition-all font-bold">الأسعار</Link>
            <Link href="#" className="opacity-50 hover:opacity-100 transition-all font-bold">المميزات</Link>
          </div>

          <div className="flex flex-col gap-6">
            <h4 className="font-black text-xl">تواصل معنا</h4>
            <Link href="#" className="opacity-50 hover:opacity-100 transition-all font-bold">تويتر</Link>
            <Link href="#" className="opacity-50 hover:opacity-100 transition-all font-bold">تليجرام</Link>
            <Link href="#" className="opacity-50 hover:opacity-100 transition-all font-bold">البريد الإلكتروني</Link>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 mt-32 pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
          <p className="opacity-30 text-sm font-bold">© 2026 Aura AI Platform. جميع الحقوق محفوظة للمطور حمد العبدولي.</p>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full glass border-white/5">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] font-black opacity-60 uppercase">الخوادم تعمل بكفاءة</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeedbackList() {
  const [feedbacks, setFeedbacks] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/feedback')
      .then(res => res.json())
      .then(data => setFeedbacks(Array.isArray(data) ? data : []));
  }, []);

  if (feedbacks.length === 0) {
    return [1, 2, 3].map(i => (
      <div key={i} className="p-10 rounded-[2.5rem] glass opacity-20 animate-pulse border-white/5 h-64" />
    ));
  }

  return feedbacks.map((f, i) => (
    <motion.div 
      key={i}
      whileHover={{ y: -10 }}
      className="p-10 rounded-[2.5rem] glass border-white/5 hover:border-accent/40 transition-all group"
    >
      <div className="flex items-center gap-4 mb-6">
         <div className="w-12 h-12 rounded-xl premium-gradient flex items-center justify-center text-white font-black">
            {f.name[0]}
         </div>
         <div className="flex flex-col">
            <span className="font-black text-lg">{f.name}</span>
            <div className="flex gap-0.5 text-yellow-500">
               {[...Array(f.rating)].map((_, i) => <Star key={i} className="w-3 h-3 fill-yellow-500" />)}
            </div>
         </div>
      </div>
      <p className="opacity-50 leading-relaxed font-medium italic">"{f.message}"</p>
    </motion.div>
  ));
}

function FeedbackForm() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        alert('شكراً لتعليقك! سيتم ظهوره قريباً.');
        setFormData({ name: '', email: '', message: '' });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
           <label className="text-[10px] font-black uppercase tracking-widest opacity-40 px-4">الاسم</label>
           <input 
             required
             value={formData.name}
             onChange={e => setFormData({...formData, name: e.target.value})}
             type="text" 
             className="w-full p-4 glass rounded-2xl border-white/5 font-bold" 
           />
        </div>
        <div className="space-y-2">
           <label className="text-[10px] font-black uppercase tracking-widest opacity-40 px-4">البريد الإلكتروني</label>
           <input 
             required
             value={formData.email}
             onChange={e => setFormData({...formData, email: e.target.value})}
             type="email" 
             className="w-full p-4 glass rounded-2xl border-white/5 font-bold" 
           />
        </div>
      </div>
      <div className="space-y-2">
         <label className="text-[10px] font-black uppercase tracking-widest opacity-40 px-4">رسالتك</label>
         <textarea 
           required
           value={formData.message}
           onChange={e => setFormData({...formData, message: e.target.value})}
           className="w-full h-32 p-4 glass rounded-2xl border-white/5 font-bold resize-none" 
         />
      </div>
      <button 
        disabled={isSubmitting}
        className="w-full py-5 premium-gradient text-white rounded-2xl font-black text-lg shadow-2xl shadow-accent/20 flex items-center justify-center gap-3"
      >
        {isSubmitting ? 'جاري الإرسال...' : 'إرسال التعليق'}
        <ArrowRight className="w-5 h-5" />
      </button>
    </form>
  );
}

