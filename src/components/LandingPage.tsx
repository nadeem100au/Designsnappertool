import { Button } from './ui/button';
import { Card } from './ui/card';
import { Upload, Zap, Target, CheckCircle, ArrowRight, ShieldCheck, Cpu, LayoutPanelTop, BarChart3, Star, Sparkles, Pin, Settings, FileText, AlertCircle, LogOut, Crown, Rocket } from 'lucide-react';
import { motion } from 'motion/react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { supabase } from '../utils/supabase/client';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { useEffect, useState, useCallback } from 'react';

import saasMockup from 'figma:asset/59f7c40d3db6dd1bd00dec669d25e2bff24a123c.png';

interface LandingPageProps {
  onNavigate: (screen: 'landing' | 'upload' | 'dashboard' | 'report' | 'auth' | 'pricing', data?: any) => void;
  user?: any;
}

const SAMPLE_REPORT_DATA = {
  screenshot: saasMockup,
  designType: 'UX',
  analysisMode: 'demo',
  annotations: [
    {
      id: 1,
      x: 20,
      y: 24,
      type: 'contrast',
      severity: 'critical',
      title: 'Low Contrast on Navigation Links',
      description: 'The navigation text fails WCAG AA standards with a 2.4:1 ratio against the white background.',
      fix: 'Increase font weight to 600 or use a darker slate-900 color for the text.'
    },
    {
      id: 2,
      x: 68,
      y: 38,
      type: 'usability',
      severity: 'critical',
      title: 'Small Touch Target for Search',
      description: 'The search icon hit area is only 32px, which is below the recommended 44px minimum for mobile usability.',
      fix: 'Increase padding around the icon to expand the interactive touch area to at least 44x44px.'
    }
  ]
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100, damping: 15 } },
};

export function LandingPage({ onNavigate, user: initialUser }: LandingPageProps) {
  const [user, setUser] = useState<any>(initialUser);
  const [tier, setTier] = useState<string>('starter');

  const fetchTier = useCallback(async (token: string) => {
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-cdc57b20/tier`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setTier(data.tier || 'starter');
      }
    } catch (err) {
      console.error("Failed to fetch tier:", err);
    }
  }, []);

  useEffect(() => {
    if (initialUser) {
      setUser(initialUser);
      supabase.auth.getSession().then(({ data }) => {
        if (data.session) fetchTier(data.session.access_token);
      });
    } else {
      supabase.auth.getSession().then(({ data }) => {
        setUser(data.session?.user || null);
        if (data.session) fetchTier(data.session.access_token);
      });
    }
  }, [initialUser, fetchTier]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setTier('starter');
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-slate-900 selection:bg-[#0066ff]/10 font-['Helvetica_Neue',_Helvetica,_Arial,_sans-serif] overflow-x-hidden">
      {/* Background Elements */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 opacity-[0.4]" style={{ backgroundImage: 'radial-gradient(#e2e8f0 0.5px, transparent 0.5px), radial-gradient(#e2e8f0 0.5px, #FDFDFD 0.5px)', backgroundSize: '32px 32px', backgroundPosition: '0 0, 16px 16px' }} />
        <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.4, 0.3] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#0066ff]/10 rounded-full blur-[120px]" />
      </div>

      {/* Navigation */}
      <motion.nav initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="relative z-50 border-b border-slate-100/50 bg-white/70 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-900 rounded-[14px] flex items-center justify-center shadow-xl rotate-[-2deg]">
              <Target className="w-6 h-6 text-white" />
            </div>
            <span className="font-black text-2xl tracking-tighter text-slate-900 uppercase italic">Snapper.</span>
          </div>
          <div className="hidden md:flex items-center gap-10 text-xs font-black uppercase tracking-widest text-slate-400">
            <button onClick={() => onNavigate('upload')} className="hover:text-slate-900 transition-colors uppercase cursor-pointer">Audit Engine</button>
            <button onClick={() => onNavigate('pricing')} className="hover:text-slate-900 transition-colors uppercase cursor-pointer">Pricing</button>
            {user && (
              <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 border border-slate-100 rounded-full">
                {tier === 'pro' ? <Rocket className="w-3 h-3 text-[#0066ff]" /> : tier === 'elite' ? <Crown className="w-3 h-3 text-[#ffaa00]" /> : <Zap className="w-3 h-3 text-slate-400" />}
                <span className="text-[10px] font-black text-slate-900">{tier.toUpperCase()} PLAN</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                <Button variant="ghost" onClick={handleSignOut} className="text-slate-900 font-black text-xs uppercase tracking-widest flex items-center gap-2">
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <Button variant="ghost" onClick={() => onNavigate('auth')} className="text-slate-900 font-black text-xs uppercase tracking-widest">Sign In</Button>
            )}
            <Button 
              onClick={() => onNavigate('upload')}
              className="bg-slate-900 text-white hover:bg-slate-800 font-black px-8 py-6 shadow-2xl rounded-[18px] transition-all active:scale-95 text-xs uppercase tracking-widest"
            >
              Get Started
            </Button>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-28 pb-32">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="text-center">
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#0066ff]/10 border border-[#0066ff]/20 text-[#0066ff] rounded-full text-xs font-black tracking-widest mb-10 shadow-sm">
            <span className="uppercase flex items-center gap-2"><Sparkles className="w-4 h-4" />Vision AI Audit Engine v4.0</span>
          </motion.div>
          <motion.h1 variants={itemVariants} className="text-7xl md:text-9xl font-black mb-10 leading-[0.95] tracking-tighter text-slate-900">
            Design Snapper.<br /><span className="text-slate-300">Better Audits.</span>
          </motion.h1>
          <motion.p variants={itemVariants} className="text-2xl text-slate-500 mb-14 max-w-3xl mx-auto leading-relaxed font-medium">
            Stop manual UI reviews. Upload any screenshot and get 18-point contrast & UX feedback in seconds.
          </motion.p>
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-5 justify-center items-center">
            <Button size="lg" onClick={() => onNavigate('upload')} className="h-16 px-12 text-xl bg-slate-900 hover:bg-slate-800 text-white rounded-[24px] font-black shadow-2xl transition-all hover:scale-[1.02] active:scale-95 group">
              Get Started <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              onClick={() => onNavigate('dashboard', SAMPLE_REPORT_DATA)}
              className="h-16 px-12 text-xl border-slate-200 hover:bg-slate-50 text-slate-900 rounded-[24px] font-black"
            >
              View Live Demo
            </Button>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Summary */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 py-20 border-t border-slate-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {[
            { icon: <Zap className="w-6 h-6 text-[#0066ff]" />, title: 'Real-time Analysis', desc: 'Get instant feedback on contrast ratios and UX flows.' },
            { icon: <ShieldCheck className="w-6 h-6 text-green-500" />, title: 'WCAG Compliant', desc: 'Audit against WCAG 2.1 AA standards automatically.' },
            { icon: <Cpu className="w-6 h-6 text-purple-500" />, title: 'Vision AI Powered', desc: 'Advanced neural networks understand your UI components.' }
          ].map((f, i) => (
            <div key={i} className="flex flex-col gap-4">
              <div className="w-12 h-12 bg-white shadow-sm border border-slate-100 rounded-xl flex items-center justify-center">
                {f.icon}
              </div>
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">{f.title}</h3>
              <p className="text-slate-500 font-medium leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
