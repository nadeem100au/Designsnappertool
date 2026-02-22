import { useState } from 'react';
import { Target, ArrowRight, ArrowLeft, Mail, ChevronDown, Check, X, Shield, Clock, Zap, Rocket, Crown, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { Session } from '@supabase/supabase-js';
import { UserProfileMenu } from './UserProfileMenu';
import { Button } from './ui/button';
import { useRazorpay } from '../hooks/useRazorpay';
import { toast } from 'sonner';

interface ContactPageProps {
    onNavigate: (screen: 'landing' | 'upload' | 'dashboard' | 'report' | 'auth' | 'pricing' | 'contact', data?: any) => void;
    session?: Session | null;
    onSignOut?: () => void;
}

type Region = 'India' | 'International';
const REGIONS: Region[] = ['India', 'International'];

interface TierFeature {
    text: string;
    bold?: boolean;
    enabled?: boolean;
    exclusive?: boolean;
}

interface PricingTier {
    id: string;
    name: string;
    price: string;
    priceSubtext: string;
    description: string;
    features: TierFeature[];
    icon: React.ReactNode;
    buttonText: string;
    isFree?: boolean;
    isPopular?: boolean;
    isBestValue?: boolean;
    bgIcon: string;
    borderColor: string;
    buttonStyle: string;
}

export function ContactPage({ onNavigate, session, onSignOut }: ContactPageProps) {
    const user = session?.user;
    const [region, setRegion] = useState<Region>('India');
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const { processPayment, loading: paymentLoading } = useRazorpay();

    const isIndia = region === 'India';

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        message: ''
    });

    const tiers: PricingTier[] = [
        {
            id: 'starter',
            name: 'Starter',
            price: 'Free',
            priceSubtext: 'forever',
            description: "Try Design Snapper risk-free",
            features: [
                { text: '3 Free Design Audits' },
                { text: 'AI-Powered Analysis' },
                { text: 'WCAG Contrast Checks' },
                { text: 'Heuristic Evaluation' },
                { text: 'Expert Persona Feedback', enabled: false },
                { text: 'Unlimited Audits', enabled: false },
            ],
            icon: <Zap className="w-6 h-6 text-slate-400" />,
            buttonText: 'Current Plan',
            isFree: true,
            bgIcon: 'bg-slate-100',
            borderColor: 'border-slate-100',
            buttonStyle: 'bg-slate-50 text-slate-400 cursor-default',
        },
        {
            id: 'pro',
            name: 'Pro',
            price: isIndia ? '₹500' : '$9',
            priceSubtext: 'one-time',
            description: "Unlock the full power of Snapper",
            features: [
                { text: '30 Design Audit Credits' },
                { text: `~${isIndia ? '₹16.67' : '$0.30'} per audit` },
                { text: 'All AI Models (incl. Claude Opus)' },
                { text: 'Premium Expert Personas' },
                { text: 'Full Audit History' },
                { text: 'Priority Processing' },
            ],
            icon: <Rocket className="w-6 h-6 text-blue-600" />,
            buttonText: 'Upgrade to Pro',
            isPopular: true,
            bgIcon: 'bg-blue-600/10',
            borderColor: 'border-blue-600',
            buttonStyle: 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20',
        },
        {
            id: 'elite',
            name: 'Elite',
            price: 'Custom audits',
            priceSubtext: '',
            description: "Maximum power & support",
            features: [
                { text: 'Unlimited Design Audits' },
                { text: 'Custom Audit Criteria' },
                { text: 'Team Collaboration' },
                { text: 'White-label Reports' },
                { text: '24/7 Priority Support' },
            ],
            icon: <Crown className="w-6 h-6 border-b" style={{ color: '#f59e0b' }} />,
            buttonText: 'Contact Us',
            isBestValue: true,
            bgIcon: '',
            borderColor: 'border-slate-100',
            buttonStyle: 'bg-slate-900 hover:bg-black text-white',
        }
    ];

    const selectedTierId = 'pro';

    const handleUpgrade = (tierId: string) => {
        if (tierId === 'starter') return;
        if (tierId === 'elite') {
            // Scroll to top to contact form since we are already on the contact page
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        if (!session) {
            toast.error('Please sign in to upgrade.', {
                action: { label: 'Sign In', onClick: () => onNavigate('auth') },
            });
            return;
        }

        const amount = isIndia ? 500 : 9;
        const currency = isIndia ? 'INR' : 'USD';

        processPayment({
            amount,
            currency,
            accessToken: session.access_token,
            onSuccess: () => {
                toast.success('🎉 Welcome to Pro! You now have 30 credits.');
                onNavigate('upload');
            },
            onError: (error: any) => {
                console.error('Payment failed:', error);
            },
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.fullName || !formData.email || !formData.message) {
            toast.error('Please fill in all required fields.');
            return;
        }
        toast.success('Message sent successfully! We will get back to you soon.');
        setFormData({ fullName: '', email: '', phone: '', message: '' });
    };

    return (
        <div className="min-h-screen bg-[#FDFDFD] text-slate-900 font-['Inter',_'Helvetica_Neue',_Helvetica,_Arial,_sans-serif] overflow-x-hidden flex flex-col relative">

            {/* Navigation matching LandingPage */}
            <motion.nav
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="relative z-50 bg-[#FDFDFD]"
            >
                <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate('landing')}>
                        <div className="w-10 h-10 bg-slate-900 rounded-[14px] flex items-center justify-center shadow-xl rotate-[-2deg]">
                            <Target className="w-6 h-6 text-white" />
                        </div>
                        <span className="font-black text-2xl tracking-tighter text-slate-900 uppercase italic">Design Snapper.</span>
                    </div>

                    {session && user ? (
                        <div className="flex items-center gap-4">
                            <button onClick={() => onNavigate('dashboard')} className="text-slate-600 hover:text-slate-900 font-bold text-xs uppercase tracking-widest transition-colors cursor-pointer flex items-center gap-2">
                                <Clock className="w-4 h-4" /> History
                            </button>
                            <Button
                                onClick={() => onNavigate('upload')}
                                className="bg-slate-900 text-white hover:bg-slate-800 font-black px-8 py-6 shadow-2xl rounded-[18px] transition-all active:scale-95 text-xs uppercase tracking-widest"
                            >
                                Upload Design
                            </Button>
                            <UserProfileMenu session={session} onSignOut={onSignOut} onNavigate={onNavigate} />
                        </div>
                    ) : (
                        <div className="flex items-center gap-4">
                            <button onClick={() => onNavigate('dashboard')} className="text-slate-600 hover:text-slate-900 font-bold text-xs uppercase tracking-widest transition-colors cursor-pointer flex items-center gap-2">
                                <Clock className="w-4 h-4" /> History
                            </button>
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
            <div className="max-w-3xl mx-auto px-6 pt-20 pb-12 text-center">
                <div className="inline-flex items-center justify-center gap-2 px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-lg text-[10px] font-black tracking-widest uppercase mb-6">
                    <Mail className="w-3.5 h-3.5" />
                    Get In Touch
                </div>
                <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter mb-6 leading-[1.1]">
                    Let's talk <span className="text-slate-300">design audits.</span>
                </h1>
                <p className="text-lg text-slate-500 font-medium max-w-xl mx-auto leading-relaxed">
                    Whether you want a custom plan, have a question, or just want to see a live demo — we're here. Reach out and we'll reply within 2 hours.
                </p>
            </div>

            {/* Contact Grid layout */}
            <div className="max-w-6xl mx-auto px-6 pb-32 grid grid-cols-1 lg:grid-cols-2 gap-12 w-full">
                {/* Left Col: Form */}
                <div className="bg-white rounded-[32px] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.05)] border border-slate-100 p-8 md:p-12 h-fit">
                    <h2 className="text-2xl font-black text-slate-900 mb-8">Send Us a Message</h2>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Full Name <span className="text-primary">*</span></label>
                            <div className="relative flex items-center">
                                <span className="absolute left-4 text-slate-400">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4出0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                                </span>
                                <input
                                    type="text"
                                    placeholder="Aarav Mehta"
                                    value={formData.fullName}
                                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                    className="w-full h-12 bg-[#FAFAFA] border border-slate-200 rounded-xl pl-12 pr-4 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-slate-400"
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Email Address <span className="text-primary">*</span></label>
                            <div className="relative flex items-center">
                                <span className="absolute left-4 text-slate-400">
                                    <Mail className="w-4 h-4" />
                                </span>
                                <input
                                    type="email"
                                    placeholder="aarav@company.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full h-12 bg-[#FAFAFA] border border-slate-200 rounded-xl pl-12 pr-4 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-slate-400"
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Phone Number</label>
                            <div className="relative flex items-center">
                                <span className="absolute left-4 text-slate-400">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                                </span>
                                <input
                                    type="tel"
                                    placeholder="+91 98765 43210"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full h-12 bg-[#FAFAFA] border border-slate-200 rounded-xl pl-12 pr-4 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-slate-400"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Message <span className="text-primary">*</span></label>
                            <textarea
                                placeholder="Tell us about your project, team size, or what you'd like to achieve with Design Snapper..."
                                value={formData.message}
                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                className="w-full h-32 bg-[#FAFAFA] border border-slate-200 rounded-xl p-4 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-slate-400 resize-none"
                                required
                            />
                        </div>

                        <Button type="submit" className="w-full h-14 bg-slate-900 text-white rounded-[14px] font-black text-xs tracking-widest uppercase mt-4 shadow-xl shadow-slate-900/10 hover:bg-slate-800 hover:-translate-y-0.5 transition-all">
                            Send Message <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                        <p className="text-[10px] text-center text-slate-400 font-medium">
                            We never share your data. Average reply time: <strong className="text-slate-600 font-bold">under 2 hours.</strong>
                        </p>
                    </form>
                </div>

                {/* Right Col: Cards */}
                <div className="flex flex-col gap-6 lg:pt-8 w-full max-w-md mx-auto lg:mx-0">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col gap-1 items-start">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                                <Mail className="w-5 h-5" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Email</span>
                                <a href="mailto:designsnapper100@gmail.com" className="text-sm font-black text-slate-900 hover:text-primary transition-colors">designsnapper100@gmail.com</a>
                                <span className="text-[10px] font-medium text-slate-400 mt-0.5">Replies within 2 business hours</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-900 rounded-3xl p-8 relative overflow-hidden shadow-2xl">
                        {/* Decoration */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[80px] rounded-full translate-x-1/2 -translate-y-1/2" />
                        <div className="relative z-10 flex flex-col items-start gap-4">
                            <div className="px-3 py-1 bg-white/10 text-primary border border-white/10 rounded-lg text-[10px] font-black uppercase tracking-widest backdrop-blur-sm">
                                Free First Audit
                            </div>
                            <h3 className="text-2xl font-black text-white">Try before you buy</h3>
                            <p className="text-sm text-slate-400 font-medium leading-relaxed mb-4">
                                Upload any design and get a full 18-principle AI audit — completely free, no credit card required.
                            </p>
                            <Button onClick={() => onNavigate('upload')} className="bg-primary text-white hover:bg-primary/90 hover:scale-105 active:scale-95 transition-all w-full md:w-auto h-12 px-6 rounded-xl font-black text-xs uppercase tracking-widest">
                                Start Free Audit <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Pricing Section imported via the same style as PricingPage */}
            <div className="w-full bg-[#FAFAFA] pt-24 pb-32 flex flex-col items-center">
                {/* Header content similar to pricing */}
                <div className="w-full max-w-4xl text-center mb-16 relative z-10 px-6">
                    <div className="inline-flex items-center justify-center gap-2 px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-lg text-[10px] font-black tracking-widest uppercase mb-8">
                        <Zap className="w-3.5 h-3.5" />
                        Pricing — All in 1 tab
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter mb-4">
                        Simple, transparent <br /> pricing.
                    </h2>
                    <p className="text-[13px] font-medium text-slate-500 max-w-xl mx-auto leading-relaxed">
                        No hidden fees. Cancel anytime. One-time payment for Pro. Prices in Indian Rupees.
                    </p>

                    <div className="flex flex-col items-center gap-6 mt-8">
                        <div className="relative z-50">
                            <button
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-all text-xs font-bold text-slate-600 cursor-pointer uppercase tracking-wider"
                            >
                                <Globe className="w-3.5 h-3.5 text-slate-400" />
                                {region}
                                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                            </button>

                            <AnimatePresence>
                                {dropdownOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -8, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: -8, scale: 0.95 }}
                                        transition={{ duration: 0.15 }}
                                        className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50"
                                    >
                                        {REGIONS.map((r) => (
                                            <button
                                                key={r}
                                                onClick={() => { setRegion(r); setDropdownOpen(false); }}
                                                className={`w-full text-left px-4 py-3 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${region === r
                                                    ? 'bg-blue-600/5 text-blue-600'
                                                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                                                    }`}
                                            >
                                                {r}
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>

                {/* Reused Cards block */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl items-stretch px-6">
                    {tiers.map((tier) => (
                        <motion.div
                            key={tier.id}
                            whileHover={{ y: -8 }}
                            className="flex flex-col relative h-full"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            {/* Badges */}
                            {tier.isPopular && (
                                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-20 px-4 py-1 rounded-full text-[10px] font-black tracking-widest uppercase text-white bg-blue-600 shadow-lg whitespace-nowrap">
                                    MOST POPULAR
                                </div>
                            )}
                            {tier.isBestValue && (
                                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-20 px-4 py-1 rounded-full text-[10px] font-black tracking-widest uppercase text-white bg-slate-900 shadow-lg whitespace-nowrap border border-slate-700">
                                    CUSTOM
                                </div>
                            )}

                            {/* Card Content */}
                            <div className={`p-8 h-full rounded-[40px] border-2 transition-all flex flex-col items-start gap-6 relative group ${selectedTierId === tier.id
                                ? 'border-blue-600 bg-white shadow-xl z-10'
                                : 'border-slate-100 bg-white hover:border-slate-200 shadow-sm z-0'
                                }`}>
                                {/* Header */}
                                <div className="flex items-center justify-between w-full">
                                    <div
                                        className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${tier.bgIcon}`}
                                        style={tier.id === 'elite' ? { backgroundColor: 'rgba(245, 158, 11, 0.1)' } : {}}
                                    >
                                        {tier.icon}
                                    </div>
                                    {tier.id === 'starter' && (
                                        <span className="text-[10px] font-black text-green-600 bg-green-600/10 px-3 py-1 rounded-full uppercase tracking-widest">Active</span>
                                    )}
                                </div>

                                {/* Price & Name */}
                                <div className="space-y-1 w-full">
                                    <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">{tier.name}</h3>
                                    <div className="flex items-baseline gap-2 w-full">
                                        <span className={`font-black text-slate-900 truncate ${tier.id === 'elite' ? 'text-[32px] tracking-tight' : 'text-4xl'}`}>
                                            {tier.price}
                                        </span>
                                        {tier.priceSubtext && <span className="text-sm font-bold text-slate-400">{tier.priceSubtext}</span>}
                                    </div>
                                    <p className="text-xs text-slate-400 font-medium pt-1">{tier.description}</p>
                                </div>

                                {/* Features List */}
                                <div className="w-full space-y-4 flex-grow pt-2">
                                    {tier.features.map((feature, idx) => (
                                        <div key={idx} className={`flex items-start gap-3 ${feature.enabled === false ? 'opacity-50 grayscale' : ''}`}>
                                            <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${feature.enabled === false ? 'bg-slate-100' : 'bg-slate-50'
                                                }`}>
                                                {feature.enabled === false
                                                    ? <X className="w-3 h-3 text-slate-400" />
                                                    : <Check className="w-3 h-3 text-slate-900" />
                                                }
                                            </div>
                                            <span className={`text-sm font-medium ${feature.bold ? 'text-slate-900 font-bold' : 'text-slate-600'}`}>
                                                {feature.text}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                {/* Action Button */}
                                <button
                                    onClick={() => handleUpgrade(tier.id)}
                                    disabled={tier.isFree || paymentLoading}
                                    className={`w-full h-14 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 mt-auto ${tier.buttonStyle} ${(paymentLoading && tier.id === 'pro') ? 'opacity-60 cursor-wait' : ''}`}
                                >
                                    {tier.buttonText}
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Basic Footer match */}
            <footer className="w-full relative z-10 border-t border-slate-100 bg-white py-12 px-6 mt-auto">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center shadow-md rotate-[-2deg]">
                            <Target className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-black text-lg text-slate-900 uppercase italic">Design Snapper.</span>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-6 text-[10px] font-black uppercase tracking-widest text-slate-400">
                        <a href="#" className="hover:text-slate-900 transition-colors">Home</a>
                        <a href="#" className="hover:text-slate-900 transition-colors">Audit Tool</a>
                        <a href="#" className="hover:text-slate-900 transition-colors">Privacy</a>
                        <a href="#" className="hover:text-slate-900 transition-colors">Terms</a>
                    </div>

                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        © 2026 Design Snapper Inc.
                    </p>
                </div>
            </footer>
        </div>
    );
}
