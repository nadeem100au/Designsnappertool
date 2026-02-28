import { Button } from './ui/button';
import { Target, CheckCircle, ArrowRight, ShieldCheck, LayoutPanelTop, BarChart3, Sparkles, Pin, Settings, FileText, AlertCircle, Zap } from 'lucide-react';

import { motion } from 'motion/react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import type { Session } from '@supabase/supabase-js';
import { UserProfileMenu } from './UserProfileMenu';
import { Logo } from './Logo';
import { SEO } from './SEO';

import saasMockup from 'figma:asset/59f7c40d3db6dd1bd00dec669d25e2bff24a123c.png';

interface LandingPageProps {
  onNavigate: (screen: 'landing' | 'upload' | 'dashboard' | 'report' | 'auth' | 'pricing' | 'contact', data?: any) => void;
  session?: Session | null;
  onSignOut?: () => void;
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
      type: 'accessibility',
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
    },
    {
      id: 3,
      x: 35,
      y: 60,
      type: 'consistency',
      severity: 'minor',
      title: 'Inconsistent Icon Stroke Weight',
      description: 'The dashboard icons use a 2px stroke while the settings icons use a 1.5px stroke.',
      fix: 'Standardize all system icons to a consistent 2px stroke weight for brand harmony.'
    },
    {
      id: 4,
      x: 55,
      y: 82,
      type: 'accessibility',
      severity: 'critical',
      title: 'Missing ARIA State on Sidebar',
      description: 'The collapsible sidebar menu items do not communicate their expanded/collapsed state to screen readers.',
      fix: 'Add aria-expanded="true/false" to the menu trigger elements.'
    },
    {
      id: 5,
      x: 15,
      y: 85,
      type: 'visual',
      severity: 'minor',
      title: 'Subtle Alignment Drift',
      description: 'The footer logo is offset by 4px from the main left margin grid.',
      fix: 'Align the logo to the 24px left padding used throughout the layout.'
    }
  ]
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants: any = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 15,
    },
  },
};

function MeetingTranscriptUI() {
  return (
    <div className="w-full h-full bg-[#F8FAFC] p-12 flex items-center justify-center">
      <div className="bg-white rounded-[32px] w-full max-w-lg shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] p-12 flex flex-col gap-8 transform hover:scale-[1.01] transition-transform">
        {/* Header Metadata */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="px-2.5 py-1 bg-primary/10 rounded-full border border-primary/20">
              <span className="text-[10px] font-black text-primary uppercase tracking-widest">Contrast Audit</span>
            </div>
            <span className="text-slate-400 text-xs font-medium italic">v3.2 Engine</span>
          </div>
          <div className="flex -space-x-2">
            {[1, 2].map((i) => (
              <div key={i} className="w-8 h-8 rounded-full border-2 border-white overflow-hidden bg-slate-100">
                <ImageWithFallback src={`https://images.unsplash.com/photo-${1500000000000 + i}?q=80&w=100&auto=format&fit=crop`} alt="User" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h4 className="text-3xl font-black text-slate-900 leading-tight tracking-tight">
            Checkout Flow Contrast Analysis
          </h4>
          <p className="text-sm font-medium text-slate-500">18-point WCAG Framework Compliance Report</p>
        </div>

        {/* Audit Log */}
        <div className="space-y-5">
          {[
            { tag: 'Critical', text: 'Color contrast on primary CTA is 2.4:1. (Fails WCAG AA)', isError: true },
            { tag: 'Warning', text: 'Touch target size for "Remove Item" is 32px.', isWarning: true },
            { tag: 'Success', text: 'Focus order is logical and sequential.', isSuccess: true },
          ].map((item, i) => (
            <div key={i} className="flex flex-col gap-1.5 p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <span className={`text-[10px] font-black uppercase tracking-widest ${item.isError ? 'text-red-500' : item.isWarning ? 'text-orange-500' : 'text-green-500'}`}>
                {item.tag}
              </span>
              <p className="text-sm font-bold text-slate-700">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ReportCardUI() {
  return (
    <div className="w-full h-full bg-[#F1F5F9] p-8 flex items-center justify-center">
      <div className="bg-white rounded-2xl w-full h-full shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] p-6 flex flex-col gap-5 overflow-hidden border border-white">
        {/* Audit Metadata */}
        <div className="flex items-center justify-between border-b border-slate-50 pb-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-primary" />
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-black text-slate-900 leading-none">Contrast Health</span>
              <span className="text-[9px] font-bold text-slate-400">Scan Complete • 2m ago</span>
            </div>
          </div>
          <div className="px-2 py-1 bg-green-50 rounded-lg border border-green-100 flex items-center gap-1">
            <CheckCircle className="w-2.5 h-2.5 text-green-600" />
            <span className="text-[9px] font-black text-green-600 uppercase tracking-tight">Verified</span>
          </div>
        </div>

        {/* Compliance Visualization */}
        <div className="flex-1 bg-slate-50/50 rounded-xl border border-slate-100 p-4 flex flex-col gap-4">
          <div className="flex justify-between items-end">
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Compliance</span>
              <span className="text-2xl font-black text-slate-900">82%</span>
            </div>
            <div className="flex items-end gap-1 h-12">
              {[40, 70, 45, 90, 65, 80, 50].map((h, i) => (
                <div key={i} className="w-2 bg-slate-200 rounded-full relative group overflow-hidden h-full">
                  <motion.div
                    initial={{ height: 0 }}
                    whileInView={{ height: `${h}%` }}
                    transition={{ delay: i * 0.1, duration: 1 }}
                    className={`absolute bottom-0 left-0 right-0 ${i === 3 ? 'bg-primary' : 'bg-slate-300'}`}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            {[
              { label: 'Color Contrast', score: 'Fail', color: 'text-red-500' },
              { label: 'Screen Reader Support', score: 'Pass', color: 'text-green-500' },
            ].map((stat, i) => (
              <div key={i} className="flex justify-between items-center bg-white p-2 rounded-lg border border-slate-100 shadow-sm">
                <span className="text-[10px] font-bold text-slate-600">{stat.label}</span>
                <span className={`text-[10px] font-black uppercase ${stat.color}`}>{stat.score}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Button Mockup */}
        <div className="h-10 w-full bg-slate-900 rounded-xl flex items-center justify-center shadow-lg active:scale-95 transition-transform cursor-pointer">
          <span className="text-[10px] font-black text-white uppercase tracking-[0.15em]">Generate Full Audit</span>
        </div>
      </div>
    </div>
  );
}

function AnnotationPin({ delay, x, y, label, type = 'info' }: { delay: number; x: string; y: string; label: string; type?: 'info' | 'success' | 'warning' | 'error' }) {
  const colors = {
    info: 'bg-primary border-primary/20',
    success: 'bg-green-500 border-green-100',
    warning: 'bg-orange-500 border-orange-100',
    error: 'bg-red-500 border-red-100'
  };

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      whileInView={{ scale: 1, opacity: 1 }}
      transition={{ delay, type: 'spring', stiffness: 200, damping: 20 }}
      style={{ left: x, top: y }}
      className="absolute z-30 pointer-events-none"
    >
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="flex flex-col items-center"
      >
        <div className={`px-4 py-2 rounded-2xl shadow-2xl border-2 border-white flex items-center gap-2 min-w-max bg-white/95 backdrop-blur-md`}>
          <div className={`w-2.5 h-2.5 rounded-full ${colors[type].split(' ')[0]}`} />
          <span className="text-[11px] font-black text-slate-800 tracking-tight">{label}</span>
        </div>
        <div className={`w-0.5 h-6 bg-white shadow-sm`} />
        <div className={`w-3 h-3 rounded-full border-2 border-white shadow-md ${colors[type].split(' ')[0]}`} />
      </motion.div>
    </motion.div>
  );
}

function ProductShowcase() {
  return (
    <section className="relative z-10 max-w-7xl mx-auto px-6 pb-32">
      <div className="relative rounded-[64px] overflow-hidden aspect-[16/10] bg-[#F1F4F9] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] border border-slate-200 p-8 md:p-12 lg:p-20 group">

        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-full h-full opacity-40">
          <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-100 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-50 rounded-full blur-[100px]" />
        </div>

        {/* The Window - Recreating the SaaS UI as a high-fidelity mockup */}
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="w-full h-full bg-white rounded-[40px] shadow-[0_32px_80px_-16px_rgba(0,0,0,0.12)] border border-white flex overflow-hidden relative"
        >
          {/* Sidebar Mockup */}
          <div className="w-20 md:w-24 border-r border-slate-100 bg-slate-50/50 flex flex-col items-center py-8 gap-8 shrink-0">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
              <Target className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col gap-6">
              {[LayoutPanelTop, BarChart3, Settings, ShieldCheck].map((Icon, i) => (
                <div key={i} className={`p-3 rounded-xl transition-colors cursor-pointer ${i === 0 ? 'bg-white shadow-sm text-primary' : 'text-slate-400 hover:text-slate-600'}`}>
                  <Icon className="w-5 h-5" />
                </div>
              ))}
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col overflow-hidden relative">
            {/* Toolbar */}
            <div className="h-16 border-b border-slate-100 flex items-center justify-between px-8 bg-white/80 backdrop-blur-sm z-20">
              <div className="flex items-center gap-4">
                <span className="text-sm font-bold text-slate-800">Analysis: Meeting_241025.mp4</span>
                <div className="px-2 py-0.5 bg-sky-50 text-primary text-[10px] font-black uppercase rounded border border-primary/10 tracking-widest">Processing</div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 overflow-hidden">
                      <ImageWithFallback src={`https://images.unsplash.com/photo-${1500000000000 + i}?q=80&w=100&auto=format&fit=crop`} alt="User" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
                <Button size="sm" className="rounded-full h-9 px-5 text-xs font-bold bg-slate-900 text-white hover:bg-slate-800">Generate Report</Button>
              </div>
            </div>

            {/* The SaaS Content */}
            <div className="flex-1 overflow-auto bg-[#F8FAFC] p-8 md:p-12 relative flex items-start justify-center">
              <div className="w-full max-w-4xl relative">
                {/* The SaaS Image provided by user */}
                <div className="relative rounded-[32px] overflow-hidden shadow-[0_40px_100px_-15px_rgba(0,0,0,0.15)] border border-slate-200 bg-white">
                  <ImageWithFallback
                    src={saasMockup}
                    alt="Design Snapper AI Design Audit Transcript Mockup"
                    className="w-full h-auto"
                  />

                  {/* Animated Annotations with Real Design Audit Data */}
                  <AnnotationPin delay={1.5} x="20%" y="24%" label="Contrast Ratio: 2.4:1 (Fail WCAG AA)" type="error" />
                  <AnnotationPin delay={2.0} x="68%" y="38%" label="Touch Target: 32px (Min 44px req.)" type="warning" />
                  <AnnotationPin delay={2.5} x="35%" y="60%" label="Visual Hierarchy: Optimal Flow" type="success" />
                  <AnnotationPin delay={3.0} x="55%" y="82%" label="Missing ARIA: 'expanded' state" type="error" />
                </div>

                {/* Floating Vision AI HUD elements */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.2 }}
                  className="absolute -left-12 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-xl p-6 rounded-[24px] shadow-2xl border border-white flex flex-col gap-4 z-20 hidden xl:flex w-[220px]"
                >
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-primary" />
                    <span className="text-xs font-black text-slate-900 uppercase tracking-tight">Audit Health</span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-400 tracking-widest">
                      <span>Score</span>
                      <span className="text-primary">74/100</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} whileInView={{ width: '74%' }} transition={{ delay: 1.5, duration: 1 }} className="h-full bg-primary" />
                    </div>
                    <p className="text-[10px] font-bold text-slate-500 leading-relaxed">
                      Your UI is currently failing 4 critical WCAG 2.1 criteria. Click to auto-fix.
                    </p>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export function LandingPage({ onNavigate, session, onSignOut }: LandingPageProps) {
  const user = session?.user;

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is Design Snapper?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Design Snapper is an AI design reviewer and automated design audit tool. It helps product teams and designers automatically catch accessibility issues, UX inconsistencies, and visual hierarchy flaws before shipping."
        }
      },
      {
        "@type": "Question",
        "name": "How does the Design Snapper audit work?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Simply upload your design screens or paste a URL. The Design Snapper Vision AI engine scans your UI against WCAG 2.1 compliance rules, cognitive load heuristics, and standard UI/UX best practices in seconds."
        }
      },
      {
        "@type": "Question",
        "name": "Is Design Snapper good for accessibility audits?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes! The Design Snapper Accessibility Audit specializes in checking WCAG contrast ratios, touch target sizing, ARIA states, and screen reader compatibility."
        }
      }
    ]
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-slate-900 selection:bg-primary/10 font-['Helvetica_Neue',_Helvetica,_Arial,_sans-serif] overflow-x-hidden" style={{ zoom: 0.80 }}>
      <SEO
        title="Design Snapper - The Ultimate AI Design Audit & Critique Tool"
        schemaData={faqSchema}
      />
      {/* Background Elements */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.4]"
          style={{
            backgroundImage: 'radial-gradient(#e2e8f0 0.5px, transparent 0.5px), radial-gradient(#e2e8f0 0.5px, #FDFDFD 0.5px)',
            backgroundSize: '32px 32px',
            backgroundPosition: '0 0, 16px 16px'
          }}
        />
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.4, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]"
        />
      </div>

      {/* Navigation */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative z-50 border-b border-slate-100/50 bg-white/70 backdrop-blur-2xl"
      >
        <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
          <Logo size="lg" className="cursor-pointer" />

          {session && user ? (
            /* Logged-in state: Pricing link + Profile picture + name + dropdown */
            <div className="flex items-center gap-4">
              <button onClick={() => onNavigate('pricing')} className="text-slate-600 hover:text-slate-900 font-bold text-xs uppercase tracking-widest transition-colors cursor-pointer">Pricing</button>
              <Button
                onClick={() => onNavigate('upload')}
                className="bg-slate-900 text-white hover:bg-slate-800 font-black px-8 py-6 shadow-2xl rounded-[18px] transition-all active:scale-95 text-xs uppercase tracking-widest"
              >
                Upload Design
              </Button>
              <UserProfileMenu session={session} onSignOut={onSignOut} onNavigate={onNavigate} />
            </div>

          ) : (
            /* Logged-out state: Sign In + Get Started */
            <div className="flex items-center gap-4">
              <button onClick={() => onNavigate('pricing')} className="text-slate-600 hover:text-slate-900 font-bold text-xs uppercase tracking-widest transition-colors cursor-pointer">Pricing</button>
              <Button variant="ghost" className="text-slate-900 font-black text-xs uppercase tracking-widest" onClick={() => onNavigate('auth')}>Sign In</Button>
              <Button
                onClick={() => onNavigate('upload')}
                className="bg-slate-900 text-white hover:bg-slate-800 font-black px-8 py-6 shadow-2xl rounded-[18px] transition-all active:scale-95 text-xs uppercase tracking-widest"
              >
                Get Started
              </Button>
            </div>
          )}
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-28 pb-32">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="text-center">
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 border border-primary/20 text-primary rounded-full text-xs font-black tracking-widest mb-10 shadow-sm">
            <span className="uppercase flex items-center gap-2"><Sparkles className="w-4 h-4" />Vision AI Audit Engine v4.0</span>
          </motion.div>
          <motion.h1 variants={itemVariants} className="text-7xl md:text-9xl font-black mb-10 leading-[0.95] tracking-tighter text-slate-900">
            Design Snapper.<br /><span className="text-slate-300">The #1 AI Design Reviewer.</span>
          </motion.h1>
          <motion.p variants={itemVariants} className="text-2xl text-slate-500 mb-14 max-w-3xl mx-auto leading-relaxed font-medium">
            Stop manual UI reviews. Use <strong className="text-slate-900 font-black">Design Snapper</strong>, the ultimate <strong className="text-slate-900 font-black">design review tool</strong>, to get an instant <strong className="text-slate-900 font-black">design audit</strong> and <strong className="text-slate-900 font-black">AI design critique</strong> in seconds.
          </motion.p>
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-5 justify-center items-center">
            <Button size="lg" onClick={() => onNavigate('upload')} className="h-16 px-12 text-xl bg-slate-900 hover:bg-slate-800 text-white rounded-[24px] font-black shadow-2xl transition-all hover:scale-[1.02] active:scale-95 group">
              Start Your Audit <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform" />
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

      {/* Product Showcase Illustration */}
      <ProductShowcase />

      {/* Bento Grid Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-20 font-['Helvetica_Neue',_Helvetica,_Arial,_sans-serif]">
        <div className="mb-16">
          <h2 className="text-5xl md:text-6xl font-black mb-6 tracking-tight text-slate-900 leading-tight">
            Design Snapper:<br />Design review, automated.
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
          {/* FEATURE 1: Intelligent Annotations (Big Card) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-7 bg-white border border-slate-200 rounded-[32px] overflow-hidden flex flex-col group shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="p-10 pb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Pin className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-xl font-black text-slate-900">Intelligent Annotations</h3>
              </div>
              <p className="text-sm font-medium text-slate-500 max-w-md mb-6 leading-relaxed">
                Our Vision AI identifies every UI element and pins precise feedback
                exactly where it matters. No more vague feedback on full-screen screenshots.
              </p>
            </div>

            <div className="flex-1 px-10 pb-10 relative">
              <div className="bg-[#FAFAFA] border border-slate-200 rounded-2xl h-full p-0 shadow-inner overflow-hidden relative min-h-[400px]">
                <MeetingTranscriptUI />

                {/* Annotation Pin 1 */}
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  transition={{ delay: 0.5, type: 'spring' }}
                  className="absolute top-[30%] left-[20%] z-10"
                >
                  <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="flex flex-col items-center"
                  >
                    <div className="bg-red-500 text-white p-3 rounded-2xl shadow-xl flex items-center gap-3 min-w-[180px] border-2 border-white">
                      <AlertCircle className="w-5 h-5 shrink-0" />
                      <div>
                        <p className="text-[10px] font-black uppercase leading-none mb-1 opacity-70">Contrast</p>
                        <p className="text-xs font-bold leading-tight">Contrast too low</p>
                      </div>
                    </div>
                    <div className="w-0.5 h-6 bg-red-500" />
                    <div className="w-3 h-3 bg-red-500 rounded-full border-2 border-white shadow-lg" />
                  </motion.div>
                </motion.div>

                {/* Annotation Pin 2 */}
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  transition={{ delay: 0.8, type: 'spring' }}
                  className="absolute top-[50%] right-[25%] z-10"
                >
                  <motion.div
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
                    className="flex flex-col items-center"
                  >
                    <div className="bg-blue-500 text-white p-3 rounded-2xl shadow-xl flex items-center gap-3 min-w-[180px] border-2 border-white">
                      <CheckCircle className="w-5 h-5 shrink-0" />
                      <div>
                        <p className="text-[10px] font-black uppercase leading-none mb-1 opacity-70">Structure</p>
                        <p className="text-xs font-bold leading-tight">Optimal Hierarchy</p>
                      </div>
                    </div>
                    <div className="w-0.5 h-6 bg-blue-500" />
                    <div className="w-3 h-3 bg-blue-500 rounded-full border-2 border-white shadow-lg" />
                  </motion.div>
                </motion.div>
              </div>
            </div>
          </motion.div>

          <div className="lg:col-span-5 flex flex-col gap-6">
            {/* FEATURE 2: Suggestion Rule Sets (Dark Theme Card) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="flex-1 bg-slate-900 border border-slate-800 rounded-[32px] overflow-hidden flex flex-col group shadow-2xl"
            >
              <div className="p-10 pb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                    <Settings className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-black text-white">Suggestion Rule Sets</h3>
                </div>
                <p className="text-sm font-medium text-slate-400 mb-6 leading-relaxed">
                  Define your unique design system constraints. Let the AI enforce consistency across every screen.
                </p>
              </div>
              <div className="flex-1 px-8 pb-8">
                <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6 h-full">
                  <div className="space-y-4">
                    {[
                      { label: 'WCAG 2.1 AA Compliance', status: 'Active', color: 'text-green-400' },
                      { label: 'Brand Spacing (8px Grid)', status: 'Active', color: 'text-green-400' },
                      { label: 'Dark Mode Contrast', status: 'Pending', color: 'text-orange-400' },
                    ].map((rule, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                        <span className="text-xs font-bold text-slate-300">{rule.label}</span>
                        <div className="flex items-center gap-2">
                          <div className={`w-1.5 h-1.5 rounded-full ${i === 2 ? 'bg-orange-400' : 'bg-green-400'}`} />
                          <span className={`text-[10px] font-black uppercase tracking-widest ${rule.color}`}>{rule.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-8 pt-8 border-t border-white/5 flex justify-center">
                    <motion.div
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="px-4 py-2 bg-primary/20 border border-primary/30 rounded-full text-primary text-[10px] font-black uppercase tracking-widest"
                    >
                      AI Enforcer Active
                    </motion.div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* FEATURE 3: AI Design Critique (Light Theme Card) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="flex-1 bg-white border border-slate-200 rounded-[32px] overflow-hidden flex flex-col group shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="p-10 pb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center">
                    <FileText className="w-5 h-5 text-orange-500" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900">AI Design Critique</h3>
                </div>
                <p className="text-sm font-medium text-slate-500 mb-6 leading-relaxed">
                  Get a comprehensive <strong className="text-slate-900 font-bold">design audit</strong> and actionable <strong className="text-slate-900 font-bold">AI design reviewer</strong> feedback. Export executive summaries with a single click.
                </p>
              </div>
              <div className="flex-1 px-8 pb-8 flex items-center justify-center">
                <div className="relative w-full h-full min-h-[220px] rounded-2xl overflow-hidden border border-slate-100 shadow-lg group-hover:scale-[1.02] transition-transform duration-500">
                  <ReportCardUI />
                  {/* Floating Score Badge on Preview */}
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="absolute top-4 right-4 bg-white/95 backdrop-blur shadow-xl rounded-2xl p-3 border border-slate-100 flex flex-col items-center min-w-[70px]"
                  >
                    <span className="text-2xl font-black text-orange-500">92</span>
                    <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Score</span>
                  </motion.div>

                  {/* Error Summary Pills */}
                  <div className="absolute bottom-4 left-4 right-4 flex gap-3">
                    <motion.div
                      initial={{ x: -20, opacity: 0 }}
                      whileInView={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.7 }}
                      className="flex-1 bg-red-500 text-white p-3 rounded-xl shadow-lg border border-white/20 flex items-center justify-between"
                    >
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black uppercase opacity-70 leading-none">Critical</span>
                        <span className="text-lg font-black">3</span>
                      </div>
                      <AlertCircle className="w-4 h-4 opacity-50" />
                    </motion.div>

                    <motion.div
                      initial={{ x: 20, opacity: 0 }}
                      whileInView={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.8 }}
                      className="flex-1 bg-amber-500 text-white p-3 rounded-xl shadow-lg border border-white/20 flex items-center justify-between"
                    >
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black uppercase opacity-70 leading-none">Minor</span>
                        <span className="text-lg font-black">12</span>
                      </div>
                      <Zap className="w-4 h-4 opacity-50" />
                    </motion.div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Grid Features */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          {[
            {
              icon: <ShieldCheck className="w-6 h-6 text-green-500" />,
              title: "Design Snapper Accessibility Audit",
              desc: "Deep scan for WCAG 2.1 compliance, contrast ratios, and touch target optimization with Design Snapper."
            },
            {
              icon: <BarChart3 className="w-6 h-6 text-primary" />,
              title: "Heatmap Diagnostics",
              desc: "Predictive spectral heatmaps show where users will focus their attention most."
            },
            {
              icon: <LayoutPanelTop className="w-6 h-6 text-orange-500" />,
              title: "Visual Hierarchy",
              desc: "AI identifies structural weaknesses in your layout and suggests optimal spacing."
            }
          ].map((feature, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -5 }}
              className="p-8 bg-white border border-slate-200 rounded-[32px] hover:shadow-xl hover:border-slate-300 transition-all group"
            >
              <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 border border-slate-100 group-hover:border-primary/20 transition-all">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-4 text-slate-900">{feature.title}</h3>
              <p className="text-slate-500 leading-relaxed font-medium">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FAQ Section for SEO */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight text-slate-900">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-slate-500 font-medium">
            Everything you need to know about the Design Snapper audit tool.
          </p>
        </div>
        <div className="space-y-6">
          {[
            {
              q: "What is Design Snapper?",
              a: "Design Snapper is an AI design reviewer and automated design audit tool. It helps product teams and designers automatically catch accessibility issues, UX inconsistencies, and visual hierarchy flaws before shipping."
            },
            {
              q: "How does the Design Snapper audit work?",
              a: "Simply upload your design screens or paste a URL. The Design Snapper Vision AI engine scans your UI against WCAG 2.1 compliance rules, cognitive load heuristics, and standard UI/UX best practices in seconds."
            },
            {
              q: "Is Design Snapper good for accessibility audits?",
              a: "Yes! The Design Snapper Accessibility Audit specializes in checking WCAG contrast ratios, touch target sizing, ARIA states, and screen reader compatibility."
            }
          ].map((faq, i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-3xl p-8 hover:shadow-md transition-shadow">
              <h3 className="text-xl font-bold mb-3 text-slate-900">{faq.q}</h3>
              <p className="text-slate-500 leading-relaxed font-medium">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Interactive CTA */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pb-32">
        <div className="relative p-16 bg-gradient-to-b from-slate-50 to-white border border-slate-200 rounded-[48px] overflow-hidden text-center shadow-sm">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
          <h2 className="text-4xl md:text-6xl font-black mb-8 tracking-tight text-slate-900">Ready for a Design Snapper audit?</h2>
          <p className="text-lg text-slate-500 mb-12 max-w-xl mx-auto font-medium">
            Stop guessing. Start auditing. Get your first professional Design Snapper report for free in less than 30 seconds.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" onClick={() => onNavigate('upload')} className="h-14 px-12 text-lg bg-slate-900 text-white hover:bg-slate-800 rounded-full font-bold shadow-xl transition-all active:scale-95">
              Start Free Audit
            </Button>
            <Button variant="outline" size="lg" className="h-14 px-12 text-lg border-slate-200 hover:bg-slate-50 text-slate-600 rounded-full font-bold">Talk to Sales</Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-100 bg-white pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-20">
            <div className="col-span-2">
              <div className="mb-6">
                <Logo size="md" />
              </div>
              <p className="text-slate-500 text-sm max-w-xs font-medium leading-relaxed">
                The world's first automated design audit platform for founders and product teams.
                Auditing designs at the speed of thought.
              </p>
            </div>
            <div>
              <h5 className="font-bold text-sm mb-6 uppercase tracking-widest text-slate-400">Product</h5>
              <ul className="space-y-4 text-sm text-slate-500 font-medium">
                <li><a href="#" onClick={(e) => { e.preventDefault(); onNavigate('upload'); }} className="hover:text-slate-900 transition-colors cursor-pointer">Upload Design</a></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); onNavigate('pricing'); }} className="hover:text-slate-900 transition-colors cursor-pointer">Pricing</a></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); onNavigate('contact'); }} className="hover:text-slate-900 transition-colors cursor-pointer">Contact Us</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-bold text-sm mb-6 uppercase tracking-widest text-slate-400">Company</h5>
              <ul className="space-y-4 text-sm text-slate-500 font-medium">
                <li><a href="#" className="hover:text-slate-900 transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-slate-900 transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-slate-900 transition-colors">Terms</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
            <p>© 2026 Design Snapper Inc. All rights reserved.</p>
            <div className="flex gap-8">
              <a href="#" className="hover:text-slate-900 transition-colors">Twitter</a>
              <a href="#" className="hover:text-slate-900 transition-colors">LinkedIn</a>
              <a href="#" className="hover:text-slate-900 transition-colors">GitHub</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
