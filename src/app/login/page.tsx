'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Bot, User, Mail, ArrowRight, Sparkles, ShieldCheck, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { AmbientBackground } from '@/components/ui/AmbientBackground';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, Suspense } from 'react';
import { auth } from '@/lib/firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

function LoginContent() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam) {
      if (errorParam === 'CredentialsSignin') setError('خطأ في البريد أو كلمة المرور.');
      else setError(`حدث تنبيه: ${errorParam}`);
    }
  }, [searchParams]);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      if (user.email) {
        // Now "bridge" to NextAuth session
        await signIn('credentials', {
          email: user.email,
          password: 'google_authenticated_via_firebase',
          callbackUrl: '/chat',
        });
      }
    } catch (err: any) {
      console.error("Firebase Login Error:", err);
      if (err.code === 'auth/popup-closed-by-user') {
        setError('تم إغلاق نافذة الدخول قبل الإكمال.');
      } else {
        setError('فشل الدخول عبر جوجل: تأكد من تفعيل Google في لوحة تحكم Firebase.');
      }
      setLoading(false);
    }
  };

  const handleCredentialsLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const target = e.target as any;
      const email = target.email.value;
      const password = target.password.value;

      await signIn('credentials', {
        email,
        password,
        callbackUrl: '/chat',
      });
    } catch (err) {
      setError('حدث خطأ غير متوقع أثناء الدخول');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      <AmbientBackground />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md z-10"
      >
        <div className="glass rounded-[3rem] p-10 border-white/10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 blur-3xl -z-10" />
          
          <div className="flex flex-col items-center text-center mb-10">
            <div className="w-16 h-16 premium-gradient rounded-2xl flex items-center justify-center shadow-2xl shadow-accent/40 mb-6">
              <Bot className="text-white w-8 h-8" />
            </div>
            <h1 className="text-4xl font-black tracking-tighter mb-2">
              {isLogin ? 'مرحباً بعودتك' : 'انضم إلينا'}
            </h1>
            <p className="opacity-40 font-bold text-sm">
              {isLogin ? 'سجل دخولك لمتابعة إبداعك' : 'ابدأ رحلتك مع مستقبل الذكاء الاصطناعي'}
            </p>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 p-5 bg-red-500/20 border-2 border-red-500/50 rounded-2xl text-red-500 text-sm font-black text-center shadow-2xl shadow-red-500/20"
            >
              ⚠️ {error}
            </motion.div>
          )}

          <div className="space-y-4">
            <button 
              disabled={loading}
              onClick={handleGoogleLogin}
              className="w-full py-4 glass hover:bg-white/5 rounded-2xl flex items-center justify-center gap-3 font-black transition-all border-white/5 group disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
                  <span>متابعة باستخدام جوجل</span>
                </>
              )}
            </button>
          </div>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-4 opacity-30 font-black tracking-widest">أو</span></div>
          </div>

          <form className="space-y-5" onSubmit={handleCredentialsLogin}>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-4 text-right block">البريد الإلكتروني</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 opacity-30 group-focus-within:opacity-100 transition-opacity" />
                <input 
                  type="email" 
                  name="email"
                  required
                  placeholder="name@example.com"
                  className="w-full pl-12 pr-6 py-4 glass rounded-2xl border-white/5 focus:border-accent/40 focus:ring-0 transition-all font-bold text-right"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-4 text-right block">كلمة المرور</label>
              <div className="relative group">
                <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 opacity-30 group-focus-within:opacity-100 transition-opacity" />
                <input 
                  type="password" 
                  name="password"
                  required
                  placeholder="••••••••"
                  className="w-full pl-12 pr-6 py-4 glass rounded-2xl border-white/5 focus:border-accent/40 focus:ring-0 transition-all font-bold text-right"
                />
              </div>
            </div>

            <button 
              disabled={loading}
              type="submit" 
              className="w-full py-5 premium-gradient text-white rounded-2xl font-black text-lg shadow-2xl shadow-accent/30 hover:translate-y-[-4px] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  <span>{isLogin ? 'تسجيل الدخول' : 'إنشاء حساب'}</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
             <button 
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm font-bold opacity-40 hover:opacity-100 transition-opacity"
              >
                {isLogin ? 'ليس لديك حساب؟ انضم الآن' : 'لديك حساب بالفعل؟ سجل دخولك'}
             </button>
          </div>
        </div>

        <Link href="/" className="flex items-center justify-center gap-2 mt-8 opacity-40 hover:opacity-100 transition-opacity font-black text-sm">
           <Bot className="w-4 h-4" />
           <span>العودة للرئيسية</span>
        </Link>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="w-10 h-10 animate-spin text-accent" /></div>}>
      <LoginContent />
    </Suspense>
  );
}
