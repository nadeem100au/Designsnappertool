import { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Check, Shield, Clock, Zap, ArrowLeft, Star, Sparkles, Target, ZapIcon, Rocket, Crown } from 'lucide-react';
import { motion } from 'motion/react';

interface PricingPageProps {
  onBack: () => void;
  onPurchase: (tierId: string, price: number) => void;
  currentTier?: string;
}

const PRICING_TIERS = [
  {
    id: 'starter',
    name: 'Starter',
    price: 0,
    features: [
      '3 Design Audits / mo',
      'Standard AI Analysis',
      'Basic Report Export',
      'Community Support'
    ],
    icon: <ZapIcon className="w-6 h-6 text-slate-400" />,
    buttonText: 'Current Plan',
    isFree: true,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 200,
    features: [
      '50 Design Audits / mo',
      'Premium Expert Personas',
      'Priority Analysis',
      'Full History Access',
      'Advanced Heatmaps'
    ],
    icon: <Rocket className="w-6 h-6 text-[#0066ff]" />,
    buttonText: 'Upgrade to Pro',
    isPopular: true,
    isSubscription: true,
  },
  {
    id: 'elite',
    name: 'Elite',
    price: 500,
    features: [
      'Unlimited Design Audits',
      'Custom Audit Criteria',
      'Team Collaboration',
      'White-label Reports',
      '24/7 Priority Support'
    ],
    icon: <Crown className="w-6 h-6 text-[#ffaa00]" />,
    buttonText: 'Upgrade to Elite',
    isBestValue: true,
    isSubscription: true,
  }
];

export function PricingPage({ onBack, onPurchase, currentTier = 'starter' }: PricingPageProps) {
  const [selectedTier, setSelectedTier] = useState(PRICING_TIERS[1]);

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex flex-col items-center pt-20 pb-32 px-6">
      <div className="absolute top-8 left-8">
        <button 
          onClick={onBack} 
          className="flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-colors font-black uppercase text-[10px] tracking-widest"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      </div>

      <div className="w-full max-w-4xl text-center mb-16">
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 bg-slate-900 rounded-[14px] flex items-center justify-center shadow-xl rotate-[-2deg] mb-4">
            <Target className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter uppercase italic">Pricing.</h1>
        </div>
        <p className="text-xl font-medium text-slate-500 max-w-2xl mx-auto">
          Choose the plan that fits your design workflow. Upgrade or cancel anytime.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl mb-12">
        {PRICING_TIERS.map((tier) => (
          <motion.div
            key={tier.id}
            whileHover={{ y: -8 }}
            className="relative"
          >
            {tier.isPopular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20 px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase text-white bg-[#0066ff] shadow-lg">
                MOST POPULAR
              </div>
            )}
            {tier.isBestValue && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20 px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase text-white bg-slate-900 shadow-lg">
                ELITE STATUS
              </div>
            )}
            
            <Card className={`p-8 h-full rounded-[40px] border-2 transition-all flex flex-col items-start gap-6 ${
              selectedTier.id === tier.id 
                ? 'border-[#0066ff] bg-white shadow-[0_32px_64px_-16px_rgba(0,102,255,0.12)]' 
                : 'border-slate-100 bg-white hover:border-slate-200 shadow-sm'
            }`}>
              <div className="flex items-center justify-between w-full">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                  tier.id === 'pro' ? 'bg-[#0066ff]/10' : tier.id === 'elite' ? 'bg-[#ffaa00]/10' : 'bg-slate-100'
                }`}>
                  {tier.icon}
                </div>
                {currentTier === tier.id && (
                  <span className="text-[10px] font-black text-[#00c853] bg-[#00c853]/10 px-3 py-1 rounded-full uppercase tracking-widest">Active</span>
                )}
              </div>

              <div className="space-y-1">
                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">{tier.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-slate-900">₹{tier.price}</span>
                  {!tier.isFree && <span className="text-sm font-bold text-slate-400">/mo</span>}
                </div>
              </div>

              <div className="w-full space-y-4 flex-grow">
                {tier.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="mt-1 w-5 h-5 rounded-full bg-slate-50 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-slate-900" />
                    </div>
                    <span className="text-sm font-medium text-slate-600">{feature}</span>
                  </div>
                ))}
              </div>

              <Button 
                onClick={() => {
                  setSelectedTier(tier);
                  if (!tier.isFree && currentTier !== tier.id) {
                    onPurchase(tier.id, tier.price);
                  }
                }}
                disabled={currentTier === tier.id}
                className={`w-full h-14 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${
                  currentTier === tier.id
                    ? 'bg-slate-50 text-slate-400 cursor-default'
                    : tier.id === 'pro'
                      ? 'bg-[#0066ff] hover:bg-[#0052cc] text-white shadow-lg shadow-[#0066ff]/20'
                      : tier.id === 'elite'
                        ? 'bg-slate-900 hover:bg-black text-white'
                        : 'bg-white border-2 border-slate-100 hover:border-slate-200 text-slate-900'
                }`}
              >
                {currentTier === tier.id ? 'Active Plan' : tier.buttonText}
              </Button>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="w-full max-w-3xl flex flex-col items-center gap-12">
        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 text-slate-400 font-bold">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5" />
            <span className="text-[10px] uppercase tracking-widest whitespace-nowrap">Secure via Stripe</span>
          </div>
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5" />
            <span className="text-[10px] uppercase tracking-widest whitespace-nowrap">Instant Activation</span>
          </div>
          <div className="flex items-center gap-3">
            <Zap className="w-5 h-5" />
            <span className="text-[10px] uppercase tracking-widest whitespace-nowrap">Cancel Anytime</span>
          </div>
        </div>

        <p className="text-center text-sm text-slate-400 max-w-xl font-medium leading-relaxed">
          Questions about our enterprise plan? <span className="text-[#0066ff] cursor-pointer hover:underline">Contact our sales team</span> for custom integrations and volume discounts.
        </p>
      </div>

      {/* Trust Badges */}
      <div className="mt-24 max-w-4xl w-full">
         <div className="flex flex-wrap items-center justify-center gap-12 opacity-30 grayscale contrast-125">
            <div className="font-black text-xl tracking-tighter italic">STRIPE</div>
            <div className="font-black text-xl tracking-tighter italic">VERCEL</div>
            <div className="font-black text-xl tracking-tighter italic">LINEAR</div>
            <div className="font-black text-xl tracking-tighter italic">FIGMA</div>
            <div className="font-black text-xl tracking-tighter italic">RAYCAST</div>
         </div>
      </div>
    </div>
  );
}
