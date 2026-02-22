import { useState, useEffect, useCallback } from 'react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

export interface CreditsData {
    plan: 'starter' | 'pro';
    creditsRemaining: number;
    totalCredits: number;
    auditsUsed: number;
    maxFreeAudits: number;
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

export function useCredits(session: any): CreditsData {
    const [plan, setPlan] = useState<'starter' | 'pro'>('starter');
    const [creditsRemaining, setCreditsRemaining] = useState(0);
    const [totalCredits, setTotalCredits] = useState(0);
    const [auditsUsed, setAuditsUsed] = useState(0);
    const [maxFreeAudits, setMaxFreeAudits] = useState(3);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchCredits = useCallback(async () => {
        if (!session?.access_token) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            // User token goes in query param; anon key in Authorization (required by Supabase gateway)
            const response = await fetch(
                `https://${projectId}.supabase.co/functions/v1/make-server-cdc57b20/credits?token=${encodeURIComponent(session.access_token)}`,
                {
                    headers: {
                        'Authorization': `Bearer ${publicAnonKey}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (!response.ok) {
                throw new Error('Failed to fetch credits');
            }

            const data = await response.json();
            console.log('[useCredits] API response:', data);
            setPlan(data.plan);
            setCreditsRemaining(data.creditsRemaining);
            setTotalCredits(data.totalCredits);
            setAuditsUsed(data.auditsUsed);
            setMaxFreeAudits(data.maxFreeAudits);
            setError(null);
        } catch (err: any) {
            console.error('Failed to fetch credits:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [session?.access_token]);

    useEffect(() => {
        fetchCredits();
    }, [fetchCredits]);

    return {
        plan,
        creditsRemaining,
        totalCredits,
        auditsUsed,
        maxFreeAudits,
        loading,
        error,
        refetch: fetchCredits,
    };
}
