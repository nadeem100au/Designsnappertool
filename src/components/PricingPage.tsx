import { useState } from 'react';
import { Check, Shield, Clock, Zap, ArrowLeft, Target, Rocket, Crown, X, Globe, ChevronDown, Loader2, CreditCard } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useRazorpay } from '../hooks/useRazorpay';
import { toast } from 'sonner';

interface PricingPageProps {
    onNavigate: (screen: string, data?: any) => void;
    session?: any;
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
    price: string;           // formatted price string
    priceSubtext: string;    // e.g. "one-time" or "/mo"
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

export function PricingPage({ onNavigate, session }: PricingPageProps) {
    const [region, setRegion] = useState<Region>('India');
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const { processPayment, loading: paymentLoading } = useRazorpay();

    const isIndia = region === 'India';
    const symbol = isIndia ? '₹' : '$';

    const tiers: PricingTier[] = [
        {
            id: 'starter',
            name: 'Starter',
            price: 'Free',
            priceSubtext: 'forever',
            description: "Try Design Snapper risk-free",
            features: [
                { text: '3 Free Design Audits', bold: true },
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
                { text: '30 Design Audit Credits', bold: true },
                { text: `~${isIndia ? '₹16.67' : '$0.30'} per audit`, bold: true },
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
            price: isIndia ? '₹1,500' : '$29',
            priceSubtext: '/mo',
            description: "Maximum power & support",
            features: [
                { text: 'Unlimited Design Audits' },
                { text: 'Custom Audit Criteria' },
                { text: 'Team Collaboration' },
                { text: 'White-label Reports', exclusive: true, bold: true },
                { text: '24/7 Priority Support' },
            ],
            icon: <Crown className="w-6 h-6" style={{ color: '#f59e0b' }} />,
            buttonText: 'Coming Soon',
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
            toast.info('Elite plan is coming soon!');
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

    return (
        <div className="min-h-screen bg-[#FDFDFD] flex flex-col items-center pt-20 pb-32 px-6 overflow-x-hidden font-['Inter',_'Helvetica_Neue',_Helvetica,_Arial,_sans-serif] relative">

            {/* ---- Razorpay Loading Overlay ---- */}
            <AnimatePresence>
                {paymentLoading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                            className="bg-white rounded-3xl p-10 shadow-2xl flex flex-col items-center gap-5 max-w-sm mx-6"
                        >
                            {/* Animated shimmer ring */}
                            <div className="relative w-20 h-20">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                                    className="absolute inset-0 rounded-full border-[3px] border-transparent"
                                    style={{ borderTopColor: '#2563eb', borderRightColor: '#2563eb' }}
                                />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <CreditCard className="w-8 h-8 text-blue-600" />
                                </div>
                            </div>

                            <div className="text-center">
                                <h3 className="text-lg font-black text-slate-900 tracking-tight">Processing Payment</h3>
                                <p className="text-sm text-slate-500 mt-1.5 font-medium">
                                    Razorpay secure checkout is loading…
                                </p>
                            </div>

                            {/* Pulsing dots */}
                            <div className="flex gap-1.5">
                                {[0, 1, 2].map((i) => (
                                    <motion.div
                                        key={i}
                                        animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
                                        transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                                        className="w-2 h-2 rounded-full bg-blue-600"
                                    />
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Back Button */}
            <div className="absolute top-8 left-8 z-50">
                <button
                    onClick={() => onNavigate('landing')}
                    className="flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-colors font-black uppercase text-[10px] tracking-widest cursor-pointer"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                </button>
            </div>

            {/* Header Section */}
            <div className="w-full max-w-4xl text-center mb-16 mt-8 relative z-10">
                <div className="flex flex-col items-center mb-6">
                    <div className="w-12 h-12 bg-slate-900 rounded-[14px] flex items-center justify-center shadow-xl rotate-[-2deg] mb-4">
                        <Target className="w-7 h-7 text-white" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter uppercase italic">Pricing.</h1>
                </div>

                {/* Region Dropdown */}
                <div className="flex flex-col items-center gap-6 mb-8">
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

                <p className="text-lg font-medium text-slate-500 max-w-2xl mx-auto">
                    Simple, transparent pricing. Pay once — audit as much as you need.
                </p>
            </div>

            {/* Pricing Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl mb-12 items-stretch">
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
                                COMING SOON
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
                                <div className="flex items-baseline gap-2">
                                    <span className="text-4xl font-black text-slate-900">
                                        {tier.price}
                                    </span>
                                    <span className="text-sm font-bold text-slate-400">{tier.priceSubtext}</span>
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
                                disabled={tier.isFree || paymentLoading || tier.id === 'elite'}
                                className={`w-full h-14 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 mt-auto ${tier.buttonStyle} ${(paymentLoading && tier.id === 'pro') ? 'opacity-60 cursor-wait' : ''} ${tier.id === 'elite' ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {tier.buttonText}
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Trust Badges */}
            <div className="w-full max-w-3xl flex flex-col items-center gap-12">
                <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 text-slate-400 font-bold">
                    <div className="flex items-center gap-3">
                        <Shield className="w-4 h-4" />
                        <span className="text-[10px] uppercase tracking-widest whitespace-nowrap">
                            {isIndia ? 'Secure via Razorpay' : 'Secure Payments'}
                        </span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Clock className="w-4 h-4" />
                        <span className="text-[10px] uppercase tracking-widest whitespace-nowrap">Instant Activation</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Zap className="w-4 h-4" />
                        <span className="text-[10px] uppercase tracking-widest whitespace-nowrap">No Subscriptions</span>
                    </div>
                </div>

                <p className="text-center text-sm text-slate-400 max-w-xl font-medium leading-relaxed">
                    Pro credits never expire. Use them at your own pace — no monthly pressure.
                </p>
            </div>
        </div>
    );
}
