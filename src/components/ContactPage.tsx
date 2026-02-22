import { useState } from 'react';
import { motion } from 'motion/react';
import { Target, ArrowRight, Mail, Phone, MessageSquare, User, CheckCircle, Clock, Zap, Shield } from 'lucide-react';
import { Button } from './ui/button';
import svgPaths from '../imports/svg-pk3tb1s8uq';

interface ContactPageProps {
    onNavigate: (screen: any) => void;
    onHistoryToggle?: () => void;
}

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.08 },
    },
};

const itemVariants = {
    hidden: { y: 24, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: { type: 'spring' as const, stiffness: 100, damping: 15 },
    },
};

export function ContactPage({ onNavigate, onHistoryToggle }: ContactPageProps) {
    const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
    const [focusedField, setFocusedField] = useState<string | null>(null);
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        await new Promise(res => setTimeout(res, 1200));
        setLoading(false);
        setSubmitted(true);
    };

    const scrollToForm = (prefill?: string) => {
        if (prefill) setForm(prev => ({ ...prev, message: prefill }));
        document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

    const inputBase =
        'w-full bg-slate-50 border rounded-2xl px-5 py-4 text-sm font-medium text-slate-900 placeholder-slate-400 outline-none transition-all duration-200';
    const inputFocused = (field: string) =>
        focusedField === field
            ? 'border-[#0066ff] shadow-[0_0_0_3px_rgba(0,102,255,0.12)] bg-white'
            : 'border-slate-200 hover:border-slate-300';

    return (
        <div className="min-h-screen bg-[#FDFDFD] text-slate-900 font-['Helvetica_Neue',_Helvetica,_Arial,_sans-serif] overflow-x-hidden">
            {/* Navbar */}
            <motion.nav
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="relative z-50 border-b border-slate-100/50 bg-white/70 backdrop-blur-2xl sticky top-0"
            >
                <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
                    <button
                        onClick={() => onNavigate('landing')}
                        className="flex items-center gap-3 group"
                    >
                        <div className="w-10 h-10 bg-slate-900 rounded-[14px] flex items-center justify-center shadow-xl rotate-[-2deg] group-hover:rotate-0 transition-transform">
                            <Target className="w-6 h-6 text-white" />
                        </div>
                        <span className="font-black text-2xl tracking-tighter text-slate-900 uppercase italic">Snapper.</span>
                    </button>
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            onClick={onHistoryToggle}
                            className="text-slate-900 font-black text-xs uppercase tracking-widest flex items-center gap-2"
                        >
                            <Clock className="w-4 h-4" />
                            History
                        </Button>
                        <Button variant="ghost" className="text-slate-900 font-black text-xs uppercase tracking-widest">
                            Sign In
                        </Button>
                        <Button
                            onClick={() => onNavigate('upload')}
                            className="bg-slate-900 text-white hover:bg-slate-800 font-black px-8 py-6 shadow-2xl rounded-[18px] transition-all active:scale-95 text-xs uppercase tracking-widest"
                        >
                            Get Started
                        </Button>
                    </div>
                </div>
            </motion.nav>

            {/* Hero */}
            <section className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-10">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="text-center"
                >
                    <motion.div
                        variants={itemVariants}
                        className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#0066ff]/10 border border-[#0066ff]/20 text-[#0066ff] rounded-full text-xs font-black tracking-widest mb-8 shadow-sm"
                    >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span className="uppercase">Get In Touch</span>
                    </motion.div>
                    <motion.h1
                        variants={itemVariants}
                        className="text-6xl md:text-8xl font-black mb-6 leading-[0.95] tracking-tighter text-slate-900"
                    >
                        Let's talk<br />
                        <span className="text-slate-300">design audits.</span>
                    </motion.h1>
                    <motion.p
                        variants={itemVariants}
                        className="text-lg text-slate-500 max-w-xl mx-auto font-medium leading-relaxed"
                    >
                        Whether you want a custom plan, have a question, or just want to see a live demo — we're here. Reach out and we'll reply within 2 hours.
                    </motion.p>
                </motion.div>
            </section>

            {/* Main Content Grid */}
            <section className="relative z-10 max-w-7xl mx-auto px-6 pb-24">
                <div className="grid lg:grid-cols-2 gap-16 items-start">

                    {/* LEFT — Contact Form */}
                    <motion.div
                        id="contact-form"
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3, duration: 0.6 }}
                        className="bg-white border border-slate-100 rounded-[32px] p-10 shadow-[0_20px_60px_-16px_rgba(0,0,0,0.08)]"
                    >
                        {submitted ? (
                            <div className="flex flex-col items-center justify-center text-center py-16 gap-6">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: 'spring', stiffness: 200, damping: 12 }}
                                    className="w-20 h-20 bg-green-50 border-2 border-green-200 rounded-full flex items-center justify-center"
                                >
                                    <CheckCircle className="w-10 h-10 text-green-500" />
                                </motion.div>
                                <h3 className="text-3xl font-black text-slate-900 tracking-tight">Message Sent!</h3>
                                <p className="text-slate-500 font-medium max-w-xs">
                                    Thanks for reaching out. We'll get back to you within 2 hours on business days.
                                </p>
                                <Button
                                    onClick={() => { setSubmitted(false); setForm({ name: '', email: '', phone: '', message: '' }); }}
                                    variant="outline"
                                    className="mt-2 rounded-2xl font-black text-xs uppercase tracking-widest border-slate-200"
                                >
                                    Send Another
                                </Button>
                            </div>
                        ) : (
                            <>
                                <div className="mb-8">
                                    <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-1">Send Us a Message</h2>
                                </div>
                                <form onSubmit={handleSubmit} className="space-y-5">
                                    {/* Name */}
                                    <div className="relative">
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">
                                            Full Name <span className="text-[#0066ff]">*</span>
                                        </label>
                                        <div className="relative">
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                            <input
                                                type="text"
                                                name="name"
                                                required
                                                value={form.name}
                                                onChange={handleChange}
                                                onFocus={() => setFocusedField('name')}
                                                onBlur={() => setFocusedField(null)}
                                                placeholder="Aarav Mehta"
                                                className={`${inputBase} ${inputFocused('name')} pl-11`}
                                            />
                                        </div>
                                    </div>

                                    {/* Email */}
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">
                                            Email Address <span className="text-[#0066ff]">*</span>
                                        </label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                            <input
                                                type="email"
                                                name="email"
                                                required
                                                value={form.email}
                                                onChange={handleChange}
                                                onFocus={() => setFocusedField('email')}
                                                onBlur={() => setFocusedField(null)}
                                                placeholder="aarav@company.com"
                                                className={`${inputBase} ${inputFocused('email')} pl-11`}
                                            />
                                        </div>
                                    </div>

                                    {/* Phone */}
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">
                                            Phone Number
                                        </label>
                                        <div className="relative">
                                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={form.phone}
                                                onChange={handleChange}
                                                onFocus={() => setFocusedField('phone')}
                                                onBlur={() => setFocusedField(null)}
                                                placeholder="+91 98765 43210"
                                                className={`${inputBase} ${inputFocused('phone')} pl-11`}
                                            />
                                        </div>
                                    </div>

                                    {/* Message */}
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">
                                            Message <span className="text-[#0066ff]">*</span>
                                        </label>
                                        <textarea
                                            name="message"
                                            required
                                            rows={5}
                                            value={form.message}
                                            onChange={handleChange}
                                            onFocus={() => setFocusedField('message')}
                                            onBlur={() => setFocusedField(null)}
                                            placeholder="Tell us about your project, team size, or what you'd like to achieve with Design Snapper..."
                                            className={`${inputBase} ${inputFocused('message')} resize-none`}
                                        />
                                    </div>

                                    {/* Submit */}
                                    <div className="pt-2">
                                        <Button
                                            type="submit"
                                            disabled={loading}
                                            className="w-full h-14 bg-slate-900 text-white hover:bg-slate-800 rounded-[18px] font-black text-sm uppercase tracking-widest shadow-xl transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-60 disabled:scale-100 group"
                                        >
                                            {loading ? (
                                                <span className="flex items-center gap-2">
                                                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                                    </svg>
                                                    Sending…
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-2">
                                                    Send Message
                                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                                </span>
                                            )}
                                        </Button>
                                    </div>

                                    <p className="text-[10px] text-slate-400 font-medium text-center pt-1">
                                        <Shield className="w-3 h-3 inline mr-1 -mt-0.5" />
                                        We never share your data. Average reply time: <span className="text-slate-600 font-bold">under 2 hours.</span>
                                    </p>
                                </form>
                            </>
                        )}
                    </motion.div>

                    {/* RIGHT — Info + Quick contact */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4, duration: 0.6 }}
                        className="space-y-6"
                    >
                        {/* Email card only */}
                        <div className="flex items-start gap-5 p-6 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md hover:border-[#0066ff]/20 transition-all">
                            <div className="w-10 h-10 bg-[#0066ff]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                                <Mail className="w-5 h-5 text-[#0066ff]" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Email</p>
                                <p className="text-base font-black text-slate-900">designsnapper100@gmail.com</p>
                                <p className="text-xs text-slate-400 font-medium mt-0.5">Replies within 2 business hours</p>
                            </div>
                        </div>

                        {/* Audit CTA card */}
                        <div className="p-6 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[#0066ff]/20 rounded-full blur-2xl -translate-y-8 translate-x-8" />
                            <div className="relative z-10">
                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#0066ff]/20 border border-[#0066ff]/30 rounded-full text-[9px] font-black text-[#0066ff] uppercase tracking-widest mb-4">
                                    <Zap className="w-3 h-3" /> Free First Audit
                                </div>
                                <h3 className="text-xl font-black mb-2 tracking-tight">Try before you buy</h3>
                                <p className="text-slate-400 text-sm font-medium mb-5 leading-relaxed">
                                    Upload any design and get a full 15-principle AI audit — completely free, no credit card required.
                                </p>
                                <Button
                                    onClick={() => onNavigate('upload')}
                                    className="h-11 px-8 bg-[#0066ff] hover:bg-[#0052cc] text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 group"
                                >
                                    Start Free Audit <ArrowRight className="w-3.5 h-3.5 ml-2 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Pricing Section */}
            <section className="relative z-10 bg-[#f8fafc] border-y border-slate-100 py-24">
                <div className="max-w-7xl mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-16"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#0066ff]/10 border border-[#0066ff]/20 text-[#0066ff] rounded-full text-xs font-black tracking-widest mb-6">
                            <Zap className="w-3.5 h-3.5" />
                            <span className="uppercase">Pricing — All in ₹ INR</span>
                        </div>
                        <h2 className="text-4xl md:text-6xl font-black mb-5 tracking-tighter text-slate-900">
                            Simple, transparent<br />pricing.
                        </h2>
                        <p className="text-[#90a1b9] font-medium max-w-lg mx-auto">
                            No hidden fees. Cancel anytime. One-time payment for Pro. Prices in Indian Rupees.
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-6 items-start">

                        {/* STARTER */}
                        <motion.div
                            initial={{ opacity: 0, y: 32 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0, duration: 0.5 }}
                            className="bg-white flex flex-col gap-[21px] p-[30px] rounded-[40px] border-2 border-[#f1f5f9] shadow-sm relative"
                        >
                            {/* Icon row */}
                            <div className="flex items-center justify-between w-full">
                                <div className="bg-[#f1f5f9] w-[42px] h-[42px] rounded-[14px] flex items-center justify-center">
                                    <svg width="21" height="21" viewBox="0 0 21 21" fill="none">
                                        <path d={svgPaths.p9168200} stroke="#90A1B9" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" />
                                    </svg>
                                </div>
                                <span className="font-black text-[10px] tracking-[1px] uppercase text-[#00a63e]">Active</span>
                            </div>

                            {/* Heading */}
                            <div className="w-full">
                                <p className="font-black text-[21px] tracking-[-0.525px] uppercase text-[#0f172b] leading-[28px]">Starter</p>
                                <div className="flex items-end gap-[7px]">
                                    <span className="font-black text-[31.5px] text-[#0f172b] leading-[35px]">Free</span>
                                    <span className="font-bold text-[12.3px] text-[#90a1b9] leading-[35px]">forever</span>
                                </div>
                                <p className="font-medium text-[10.5px] text-[#90a1b9] leading-[14px] mt-0.5">Try Design Snapper risk-free</p>
                            </div>

                            {/* Features */}
                            <div className="flex flex-col gap-[14px] pt-[7px] w-full">
                                {[
                                    { text: '3 Free Design Audits', color: '#0f172b', check: true },
                                    { text: 'AI-Powered Analysis', color: '#45556c', check: true },
                                    { text: 'WCAG Contrast Checks', color: '#45556c', check: true },
                                    { text: 'Heuristic Evaluation', color: '#45556c', check: true },
                                ].map(f => (
                                    <div key={f.text} className="flex items-start gap-[10.5px] w-full">
                                        <div className="w-[17.5px] h-[17.5px] rounded-full bg-[#f8fafc] flex items-center justify-center flex-shrink-0 mt-[1.75px]">
                                            <svg width="10.5" height="10.5" viewBox="0 0 10.5 10.5" fill="none">
                                                <path d={svgPaths.p24759e00} stroke="#0F172B" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.875" />
                                            </svg>
                                        </div>
                                        <span className="font-medium text-[12.3px] leading-[17.5px]" style={{ color: f.color }}>{f.text}</span>
                                    </div>
                                ))}
                                {/* Dimmed / crossed feature */}
                                <div className="flex items-start gap-[10.5px] w-full opacity-50">
                                    <div className="w-[17.5px] h-[17.5px] rounded-full bg-[#f1f5f9] flex items-center justify-center flex-shrink-0 mt-[1.75px]">
                                        <svg width="10.5" height="10.5" viewBox="0 0 10.5 10.5" fill="none">
                                            <path d="M7.875 2.625L2.625 7.875" stroke="#90A1B9" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.875" />
                                            <path d="M2.625 2.625L7.875 7.875" stroke="#90A1B9" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.875" />
                                        </svg>
                                    </div>
                                    <span className="font-medium text-[12.3px] text-[#45556c] leading-[17.5px]">Expert Persona Feedback</span>
                                </div>
                            </div>

                            {/* Button */}
                            <div className="bg-[#f8fafc] h-[49px] rounded-[14px] w-full flex items-center justify-center">
                                <span className="font-black text-[10.5px] text-[#90a1b9] tracking-[1.05px] uppercase">Current Plan</span>
                            </div>
                        </motion.div>

                        {/* PRO */}
                        <motion.div
                            initial={{ opacity: 0, y: 32 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1, duration: 0.5 }}
                            className="relative flex flex-col items-start justify-center"
                        >
                            {/* Most Popular badge */}
                            <div className="absolute left-1/2 -translate-x-1/2 -top-[10.5px] z-10 bg-[#155dfc] px-[14px] py-[3.5px] rounded-full shadow-lg">
                                <span className="font-black text-[10px] text-white tracking-[1px] uppercase whitespace-nowrap">Most Popular</span>
                            </div>
                            <div className="bg-white w-full flex flex-col gap-[21px] p-[30px] rounded-[40px] border-2 border-[#155dfc] shadow-[0px_20px_25px_-5px_rgba(0,0,0,0.1),0px_8px_10px_-6px_rgba(0,0,0,0.1)] relative">
                                {/* Icon row */}
                                <div className="flex items-center w-full">
                                    <div className="w-[42px] h-[42px] rounded-[14px] flex items-center justify-center">
                                        <svg width="21" height="21" viewBox="0 0 21 21" fill="none">
                                            <path d={svgPaths.p1748eff0} stroke="#155DFC" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" />
                                            <path d={svgPaths.pe353000} stroke="#155DFC" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" />
                                            <path d={svgPaths.p3f18a340} stroke="#155DFC" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" />
                                            <path d={svgPaths.pa920580} stroke="#155DFC" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" />
                                        </svg>
                                    </div>
                                </div>

                                {/* Heading */}
                                <div className="w-full">
                                    <p className="font-black text-[21px] tracking-[-0.525px] uppercase text-[#0f172b] leading-[28px]">Pro</p>
                                    <div className="flex items-end gap-[7px]">
                                        <span className="font-black text-[31.5px] text-[#0f172b] leading-[35px]">₹500</span>
                                        <span className="font-bold text-[12.3px] text-[#90a1b9] leading-[35px]">one-time</span>
                                    </div>
                                    <p className="font-medium text-[10.5px] text-[#90a1b9] leading-[14px] mt-0.5">Unlock the full power of Snapper</p>
                                </div>

                                {/* Features */}
                                <div className="flex flex-col gap-[14px] pt-[7px] w-full">
                                    {[
                                        { text: '30 Design Audit Credits', color: '#0f172b' },
                                        { text: '~₹16.67 per audit', color: '#0f172b' },
                                        { text: 'All AI Models (incl. Claude Opus)', color: '#45556c' },
                                        { text: 'Premium Expert Personas', color: '#45556c' },
                                        { text: 'Full Audit History', color: '#45556c' },
                                    ].map(f => (
                                        <div key={f.text} className="flex items-start gap-[10.5px] w-full">
                                            <div className="w-[17.5px] h-[17.5px] rounded-full bg-[#f8fafc] flex items-center justify-center flex-shrink-0 mt-[1.75px]">
                                                <svg width="10.5" height="10.5" viewBox="0 0 10.5 10.5" fill="none">
                                                    <path d={svgPaths.p24759e00} stroke="#0F172B" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.875" />
                                                </svg>
                                            </div>
                                            <span className="font-medium text-[12.3px] leading-[17.5px]" style={{ color: f.color }}>{f.text}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Button */}
                                <button
                                    onClick={() => onNavigate('upload')}
                                    className="bg-[#155dfc] h-[49px] rounded-[14px] w-full flex items-center justify-center shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)] hover:bg-[#0052cc] transition-colors active:scale-95"
                                >
                                    <span className="font-black text-[10.5px] text-white tracking-[1.05px] uppercase">Upgrade to Pro</span>
                                </button>
                            </div>
                        </motion.div>

                        {/* ELITE */}
                        <motion.div
                            initial={{ opacity: 0, y: 32 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                            className="relative flex flex-col items-start justify-center"
                        >
                            {/* Custom badge */}
                            <div className="absolute left-1/2 -translate-x-1/2 -top-[10.5px] z-10 bg-[#0f172b] px-[14px] py-[3.5px] rounded-full shadow-lg">
                                <span className="font-black text-[10px] text-white tracking-[1px] uppercase whitespace-nowrap">Custom</span>
                            </div>
                            <div className="bg-white w-full flex flex-col gap-[21px] p-[30px] rounded-[40px] border-2 border-[#f1f5f9] shadow-sm relative">
                                {/* Icon row */}
                                <div className="flex items-center w-full">
                                    <div className="bg-[rgba(245,158,11,0.1)] w-[42px] h-[42px] rounded-[14px] flex items-center justify-center">
                                        <svg width="21" height="21" viewBox="0 0 21 21" fill="none">
                                            <path d={svgPaths.p2c136d00} stroke="#F59E0B" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" />
                                            <path d="M4.375 18.375H16.625" stroke="#F59E0B" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" />
                                        </svg>
                                    </div>
                                </div>

                                {/* Heading */}
                                <div className="w-full">
                                    <p className="font-extrabold text-[21px] tracking-[-0.525px] uppercase text-[#0f172b] leading-[28px]">Elite</p>
                                    <span className="font-black text-[31.5px] text-[#0f172b] leading-[35px]">Custom audits</span>
                                    <p className="font-medium text-[10.5px] text-[#90a1b9] leading-[14px] mt-0.5">Maximum power &amp; support</p>
                                </div>

                                {/* Features */}
                                <div className="flex flex-col gap-[14px] pt-[7px] w-full">
                                    {[
                                        { text: 'Unlimited Design Audits', bold: false },
                                        { text: 'Custom Audit Criteria', bold: false },
                                        { text: 'Team Collaboration', bold: false },
                                        { text: 'White-label Reports', bold: true },
                                        { text: '24/7 Priority Support', bold: false },
                                    ].map(f => (
                                        <div key={f.text} className="flex items-start gap-[10.5px] w-full">
                                            <div className="w-[17.5px] h-[17.5px] rounded-full bg-[#f8fafc] flex items-center justify-center flex-shrink-0 mt-[1.75px]">
                                                <svg width="10.5" height="10.5" viewBox="0 0 10.5 10.5" fill="none">
                                                    <path d={svgPaths.p24759e00} stroke="#0F172B" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.875" />
                                                </svg>
                                            </div>
                                            <span className={`text-[12.3px] leading-[17.5px] text-[#0f172b] ${f.bold ? 'font-black' : 'font-medium'}`}>{f.text}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Button */}
                                <button
                                    onClick={() => scrollToForm("Hi, I'm interested in the Elite plan. Could you share more details about custom pricing and onboarding?")}
                                    className="bg-[#0f172b] h-[49px] rounded-[14px] w-full flex items-center justify-center hover:bg-slate-800 transition-colors active:scale-95"
                                >
                                    <span className="font-black text-[10.5px] text-white tracking-[1.05px] uppercase">Contact Us</span>
                                </button>
                            </div>
                        </motion.div>

                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="relative z-10 border-t border-slate-100 bg-white pt-16 pb-10">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-slate-900 rounded-xl flex items-center justify-center">
                            <Target className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-black text-lg text-slate-900 uppercase italic tracking-tight">Design Snapper.</span>
                    </div>
                    <div className="flex gap-6 text-xs font-bold uppercase tracking-widest text-slate-400">
                        <button onClick={() => onNavigate('landing')} className="hover:text-slate-900 transition-colors">Home</button>
                        <button onClick={() => onNavigate('upload')} className="hover:text-slate-900 transition-colors">Audit Tool</button>
                        <a href="#" className="hover:text-slate-900 transition-colors">Privacy</a>
                        <a href="#" className="hover:text-slate-900 transition-colors">Terms</a>
                    </div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">© 2026 Design Snapper Inc.</p>
                </div>
            </footer>
        </div>
    );
}
