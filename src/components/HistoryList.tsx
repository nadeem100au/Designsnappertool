import { useState, useEffect } from 'react';
import { getUserAudits } from '../utils/supabase/database';
import { Loader2, Calendar, FileImage, ChevronRight, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Card } from './ui/card';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface HistoryListProps {
    userId: string;
    onSelectAudit: (audit: any) => void;
    variant?: 'grid' | 'sidebar';
}

export function HistoryList({ userId, onSelectAudit, variant = 'grid' }: HistoryListProps) {
    const [audits, setAudits] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchHistory() {
            try {
                const data = await getUserAudits(userId);
                setAudits(data || []);
            } catch (err) {
                console.error("Failed to load history", err);
                setError("Failed to load your audit history.");
            } finally {
                setLoading(false);
            }
        }

        if (userId) {
            fetchHistory();
        }
    }, [userId]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-slate-300" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center py-8 text-center px-4">
                <AlertCircle className="w-8 h-8 text-red-400 mb-2" />
                <p className="text-slate-600 text-sm font-medium">{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="mt-2 text-xs text-primary underline hover:text-primary/80"
                >
                    Try Refreshing
                </button>
            </div>
        );
    }

    if (audits.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50/50 mx-4">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3">
                    <FileImage className="w-6 h-6 text-slate-300" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">No Audits Yet</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-[200px]">
                    Your past audits will appear here.
                </p>
            </div>
        );
    }

    if (variant === 'sidebar') {
        return (
            <div className="space-y-3 p-1">
                {audits.map((audit) => (
                    <div
                        key={audit.id}
                        onClick={() => onSelectAudit(audit)}
                        className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-100 cursor-pointer transition-colors group border border-transparent hover:border-slate-200"
                    >
                        <div className="w-20 h-14 bg-slate-100 rounded-lg overflow-hidden shrink-0 border border-slate-100 relative">
                            {audit.thumbnail_url ? (
                                <ImageWithFallback
                                    src={audit.thumbnail_url}
                                    alt={audit.project_name || 'Audit Thumbnail'}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-slate-50">
                                    <FileImage className="w-6 h-6 text-slate-200" />
                                </div>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-bold text-slate-900 line-clamp-2 leading-tight mb-1 group-hover:text-primary transition-colors">
                                {audit.project_name || 'Untitled Audit'}
                            </h4>
                            <p className="text-[10px] text-slate-400 font-medium">
                                {formatDistanceToNow(new Date(audit.created_at), { addSuffix: true })}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {audits.map((audit) => (
                <Card
                    key={audit.id}
                    className="group overflow-hidden cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-slate-100 bg-white"
                    onClick={() => onSelectAudit(audit)}
                >
                    <div className="aspect-[4/3] bg-slate-100 relative overflow-hidden">
                        {audit.thumbnail_url ? (
                            <ImageWithFallback
                                src={audit.thumbnail_url}
                                alt={audit.project_name || 'Audit Thumbnail'}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-slate-50">
                                <FileImage className="w-10 h-10 text-slate-200" />
                            </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <div className="absolute bottom-4 left-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-2 group-hover:translate-y-0">
                            <span className="text-sm font-bold flex items-center gap-1">
                                View Dashboard <ChevronRight className="w-4 h-4" />
                            </span>
                        </div>
                    </div>

                    <div className="p-5">
                        <h4 className="font-bold text-slate-900 line-clamp-1 mb-1" title={audit.project_name}>
                            {audit.project_name || 'Untitled Audit'}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{formatDistanceToNow(new Date(audit.created_at), { addSuffix: true })}</span>
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    );
}
