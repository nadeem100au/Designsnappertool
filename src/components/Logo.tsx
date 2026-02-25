import React from 'react';

interface LogoProps {
    className?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    variant?: 'dark' | 'light';
    showText?: boolean;
}

export function Logo({ className = '', size = 'md', variant = 'dark', showText = true }: LogoProps) {
    const sizeConfig = {
        sm: { box: 'w-6 h-6 rounded-md', icon: 'text-sm', text: 'text-sm' },
        md: { box: 'w-8 h-8 rounded-[10px]', icon: 'text-lg', text: 'text-lg' },
        lg: { box: 'w-10 h-10 rounded-[14px]', icon: 'text-xl', text: 'text-2xl' },
        xl: { box: 'w-12 h-12 rounded-2xl', icon: 'text-2xl', text: 'text-3xl' },
    };

    const themeConfig = {
        dark: { box: 'bg-slate-900 text-white', text: 'text-slate-900' },
        light: { box: 'bg-white text-slate-900 shadow-sm', text: 'text-white' },
    };

    const currentSize = sizeConfig[size];
    const currentTheme = themeConfig[variant];

    // We rotate slightly for that dynamic snap feel, and use 's.' as requested
    return (
        <div className={`flex items-center gap-2.5 ${className}`}>
            <div
                className={`${currentSize.box} ${currentTheme.box} flex items-center justify-center shadow-lg rotate-[-2deg] shrink-0`}
            >
                <span
                    className={`${currentSize.icon} font-black italic select-none relative`}
                    style={{ left: '-0.05em', top: '-0.1em', lineHeight: '1' }}
                >
                    s.
                </span>
            </div>
            {showText && (
                <span className={`font-black ${currentSize.text} tracking-tighter uppercase italic ${currentTheme.text}`}>
                    Design Snapper.
                </span>
            )}
        </div>
    );
}
