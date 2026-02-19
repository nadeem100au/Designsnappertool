import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { X, Clock, ChevronRight, AlertCircle, CheckCircle2, Layout, ExternalLink, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { getUserAudits } from '../utils/supabase/database';
import { formatDistanceToNow } from 'date-fns';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface HistorySidebarProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectAudit: (audit: any) => void;
    userId: string;
}

export function HistorySidebar({ isOpen, onClose, onSelectAudit, userId }: HistorySidebarProps) {
    const [audits, setAudits] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (isOpen && userId) {
            setLoading(true);
            setError(null);
            getUserAudits(userId)
                .then((data) => setAudits(data || []))
                .catch((err) => {
                    console.error('Failed to load history', err);
                    setError('Failed to load audit history.');
                })
                .finally(() => setLoading(false));
        }
    }, [isOpen, userId]);

    const getStats = (audit: any) => {
        const annotations = audit.analysis_data?.annotations || [];
        const critical = annotations.filter((a: any) => a.severity === 'critical').length;
        const minor = annotations.filter((a: any) => a.severity === 'minor').length;
        return { critical, minor };
    };

    if (!mounted) return null;

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/20 z-40"
                    />

                    {/* Sidebar */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed top-0 right-0 h-full w-full max-w-sm bg-white shadow-2xl z-50 border-l border-slate-100 flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
                                    <Clock className="w-5 h-5 text-slate-600" />
                                </div>
                                <div>
                                    <h3 className="font-black text-slate-900 uppercase tracking-tight">Audit History</h3>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Your recent scans</p>
                                </div>
                            </div>
                            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
                                <X className="w-5 h-5" />
                            </Button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-20">
                                    <Loader2 className="w-6 h-6 animate-spin text-slate-300" />
                                    <p className="text-slate-400 mt-3 text-xs font-bold uppercase tracking-widest">Loading...</p>
                                </div>
                            ) : error ? (
                                <div className="flex flex-col items-center justify-center py-20 text-center">
                                    <AlertCircle className="w-8 h-8 text-red-400 mb-2" />
                                    <p className="text-sm font-medium text-slate-600">{error}</p>
                                </div>
                            ) : audits.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
                                    <Layout className="w-12 h-12 mb-4" />
                                    <p className="text-sm font-bold uppercase tracking-widest">No history yet</p>
                                    <p className="text-xs text-slate-500 mt-1">Run your first audit to see it here.</p>
                                </div>
                            ) : (
                                audits.map((audit, index) => {
                                    const stats = getStats(audit);
                                    return (
                                        <motion.div
                                            key={audit.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => {
                                                onSelectAudit(audit);
                                                onClose();
                                            }}
                                            className="group p-4 bg-white border border-slate-100 rounded-2xl hover:border-primary/30 hover:shadow-lg transition-all cursor-pointer relative overflow-hidden"
                                        >
                                            <div className="flex gap-4">
                                                <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-50 border border-slate-100 shrink-0">
                                                    {audit.thumbnail_url ? (
                                                        <ImageWithFallback
                                                            src={audit.thumbnail_url}
                                                            alt={audit.project_name || 'Audit'}
                                                            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center bg-slate-50">
                                                            <Layout className="w-6 h-6 text-slate-200" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between mb-1">
                                                        <h4 className="font-bold text-slate-900 text-sm truncate pr-4">
                                                            {audit.project_name || 'Untitled Audit'}
                                                        </h4>
                                                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-primary transition-colors shrink-0" />
                                                    </div>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-3 flex items-center gap-1.5">
                                                        <Clock className="w-3 h-3" />
                                                        {formatDistanceToNow(new Date(audit.created_at), { addSuffix: true })}
                                                    </p>

                                                    <div className="flex gap-2">
                                                        <div className="px-2 py-0.5 bg-red-50 rounded-md border border-red-100 flex items-center gap-1">
                                                            <AlertCircle className="w-2.5 h-2.5 text-red-500" />
                                                            <span className="text-[9px] font-black text-red-600">{stats.critical}</span>
                                                        </div>
                                                        <div className="px-2 py-0.5 bg-blue-50 rounded-md border border-blue-100 flex items-center gap-1">
                                                            <CheckCircle2 className="w-2.5 h-2.5 text-primary" />
                                                            <span className="text-[9px] font-black text-primary">{stats.minor}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Hover Indicator */}
                                            <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <ExternalLink className="w-3 h-3 text-primary" />
                                            </div>
                                        </motion.div>
                                    );
                                })
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-slate-100 bg-slate-50/50">
                            <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                {audits.length} audit{audits.length !== 1 ? 's' : ''} total
                            </p>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>,
        document.body
    );
}
