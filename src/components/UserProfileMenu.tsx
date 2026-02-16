import { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { User, LogOut, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { Session } from '@supabase/supabase-js';

interface UserProfileMenuProps {
    session: Session | null;
    onSignOut?: () => void;
    onNavigate?: (screen: string) => void;
}

export function UserProfileMenu({ session, onSignOut, onNavigate }: UserProfileMenuProps) {
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setProfileDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const user = session?.user;

    if (!user) {
        return (
            <div className="flex items-center gap-4">
                {onNavigate && <Button variant="ghost" className="text-slate-900 font-black text-xs uppercase tracking-widest" onClick={() => onNavigate('auth')}>Sign In</Button>}
                {onNavigate && <Button
                    onClick={() => onNavigate('upload')}
                    className="bg-slate-900 text-white hover:bg-slate-800 font-black px-6 py-2 shadow-xl rounded-[14px] transition-all active:scale-95 text-xs uppercase tracking-widest"
                >
                    Get Started
                </Button>}
            </div>
        );
    }

    const avatarUrl = user.user_metadata?.avatar_url;
    const fullName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
    const firstName = fullName.split(' ')[0];

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-3 px-3 py-2 rounded-2xl hover:bg-slate-100/80 transition-all cursor-pointer group"
            >
                {avatarUrl ? (
                    <img
                        src={avatarUrl}
                        alt={fullName}
                        className="w-9 h-9 rounded-full object-cover ring-2 ring-slate-200 group-hover:ring-slate-300 transition-all"
                        referrerPolicy="no-referrer"
                    />
                ) : (
                    <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center">
                        <User className="w-4 h-4 text-slate-500" />
                    </div>
                )}
                <span className="font-bold text-sm text-slate-700 hidden sm:block">{firstName}</span>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${profileDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
                {profileDropdownOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-[100]"
                    >
                        <div className="px-4 py-3 border-b border-slate-100">
                            <p className="text-sm font-bold text-slate-900 truncate">{fullName}</p>
                            <p className="text-xs text-slate-400 truncate">{user.email}</p>
                        </div>
                        <div className="p-2">
                            <button
                                onClick={() => {
                                    setProfileDropdownOpen(false);
                                    onSignOut?.();
                                }}
                                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                            >
                                <LogOut className="w-4 h-4" />
                                Log Out
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
