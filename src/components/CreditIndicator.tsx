import { motion } from 'motion/react';

interface CreditIndicatorProps {
    plan: 'starter' | 'pro';
    creditsRemaining: number;
    totalCredits: number;
    auditsUsed: number;
    maxFreeAudits: number;
    loading: boolean;
    onUpgrade?: () => void;
}

export function CreditIndicator({
    plan,
    creditsRemaining,
    totalCredits,
    auditsUsed,
    maxFreeAudits,
    loading,
    onUpgrade,
}: CreditIndicatorProps) {
    if (loading) {
        return (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-full animate-pulse">
                <div className="w-8 h-8 rounded-full bg-slate-200" />
                <div className="w-16 h-3 bg-slate-200 rounded" />
            </div>
        );
    }

    const isStarter = plan === 'starter';
    const freeRemaining = maxFreeAudits - auditsUsed;
    const isExhausted = isStarter ? freeRemaining <= 0 : creditsRemaining <= 0;

    // Circle math
    const size = 36;
    const strokeWidth = 3;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;

    let percentage: number;
    if (isStarter) {
        percentage = Math.max(0, freeRemaining / maxFreeAudits) * 100;
    } else {
        percentage = totalCredits > 0 ? Math.max(0, creditsRemaining / totalCredits) * 100 : 0;
    }

    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    // Color based on percentage
    let ringColor: string;
    let textColor: string;
    if (isExhausted) {
        ringColor = '#ef4444'; // red-500
        textColor = 'text-red-600';
    } else if (percentage > 50) {
        ringColor = '#22c55e'; // green-500
        textColor = 'text-green-600';
    } else if (percentage > 20) {
        ringColor = '#f59e0b'; // amber-500
        textColor = 'text-amber-600';
    } else {
        ringColor = '#ef4444'; // red-500
        textColor = 'text-red-500';
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2.5 px-3 py-1.5 bg-white border border-slate-100 rounded-full shadow-sm cursor-default select-none"
            title={isStarter ? `${freeRemaining} of ${maxFreeAudits} free audits remaining` : `${creditsRemaining.toFixed(2)} of ${totalCredits.toFixed(0)} credits remaining`}
        >
            {/* Circular progress ring */}
            <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
                <svg width={size} height={size} className="rotate-[-90deg]">
                    {/* Background track */}
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        stroke="#e2e8f0"
                        strokeWidth={strokeWidth}
                    />
                    {/* Progress arc */}
                    <motion.circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        stroke={ringColor}
                        strokeWidth={strokeWidth}
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                    />
                </svg>
                {/* Center icon/number */}
                <span className={`absolute text-[9px] font-black ${textColor}`}>
                    {isStarter ? freeRemaining : Math.floor(percentage) + '%'}
                </span>
            </div>

            {/* Text label */}
            <div className="flex flex-col leading-none">
                {isStarter ? (
                    <>
                        <span className="text-[10px] font-bold text-slate-900 uppercase tracking-wider">
                            {freeRemaining}/{maxFreeAudits} Audits
                        </span>
                        <span className="text-[9px] text-slate-400 font-medium uppercase tracking-wide">
                            Free Plan
                        </span>
                    </>
                ) : (
                    <>
                        <span className={`text-[10px] font-bold text-slate-900 uppercase tracking-wider`}>
                            {creditsRemaining.toFixed(2)} Credits
                        </span>
                        <span className="text-[9px] text-slate-400 font-medium uppercase tracking-wide">
                            Pro Plan
                        </span>
                    </>
                )}
            </div>

            {/* Upgrade button for exhausted starter users */}
            {isStarter && isExhausted && onUpgrade && (
                <button
                    onClick={onUpgrade}
                    className="ml-1 px-2.5 py-1 bg-blue-600 text-white text-[9px] font-black uppercase tracking-widest rounded-full hover:bg-blue-700 transition-colors cursor-pointer"
                >
                    Upgrade
                </button>
            )}

        </motion.div>
    );
}
