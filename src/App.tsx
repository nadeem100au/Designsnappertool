import { useState, useEffect, useCallback, useRef } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { supabase } from './utils/supabase/client';
import { LandingPage } from './components/LandingPage';
import { UploadPage } from './components/UploadPage';
import { AnnotationDashboard } from './components/AnnotationDashboard';
import { ReportPage } from './components/ReportPage';
import { InfluencerLibrary } from './components/InfluencerLibrary';
import { InfluencerChat } from './components/InfluencerChat';
import { AuthPage } from './components/AuthPage';
import { SEO } from './components/SEO';
import { projectId, publicAnonKey } from './utils/supabase/info';
import { Loader2 } from 'lucide-react';
import { Toaster, toast } from 'sonner@2.0.3';

import { PricingPage } from './components/PricingPage';

type Screen = 'landing' | 'upload' | 'dashboard' | 'report' | 'influencer-library' | 'chat' | 'auth' | 'pricing';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('landing');
  const [session, setSession] = useState<any>(null);
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [currentTier, setCurrentTier] = useState<string>('starter');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const analysisDataRef = useRef<any>(null);
  const sessionRef = useRef<any>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const fetchUserTier = useCallback(async (token: string) => {
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-cdc57b20/tier`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setCurrentTier(data.tier || 'starter');
      }
    } catch (err) {
      console.error("Failed to fetch tier:", err);
    }
  }, []);

  const verifyStripeSession = useCallback(async (token: string, sessionId: string) => {
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-cdc57b20/verify-session`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ sessionId })
      });
      
      if (response.ok) {
        const data = await response.json();
        setCurrentTier(data.tier);
        toast.success(`Welcome to the ${data.tier.toUpperCase()} plan! Your account has been upgraded.`);
        
        // Clean up URL
        const url = new URL(window.location.href);
        url.searchParams.delete('session_id');
        url.searchParams.delete('success');
        window.history.replaceState({}, '', url.pathname + url.search);
      }
    } catch (err) {
      console.error("Failed to verify session:", err);
      toast.error("Failed to verify subscription. Please contact support.");
    }
  }, []);

  const detectOAuthCallback = useCallback(() => {
    return window.location.hash.includes('access_token') ||
           window.location.hash.includes('refresh_token') ||
           window.location.search.includes('code=');
  }, []);

  const getPathFromScreen = useCallback((screen: Screen) => {
    switch (screen) {
      case 'landing': return '/';
      case 'upload': return '/upload';
      case 'dashboard': return '/dashboard';
      case 'report': return '/report';
      case 'influencer-library': return '/library';
      case 'chat': return '/chat';
      case 'auth': return '/auth';
      case 'pricing': return '/pricing';
      default: return '/';
    }
  }, []);

  const navigateToScreen = useCallback((screen: Screen, data?: any) => {
    const isOAuth = detectOAuthCallback();
    if ((screen === 'upload' || screen === 'dashboard') && !sessionRef.current && !data?.isDemo && !isOAuth) {
      setCurrentScreen('auth');
      window.history.pushState({ screen: 'auth' }, '', '/auth');
      return;
    }

    if (data) {
      setAnalysisData(data);
      analysisDataRef.current = data;
    }
    
    const path = getPathFromScreen(screen);
    const urlParams = new URLSearchParams(window.location.search);
    const reportId = urlParams.get('reportId');
    const isDataPage = screen === 'dashboard' || screen === 'report';
    const finalUrl = (isDataPage && reportId) ? `${path}?reportId=${reportId}` : path;
    
    try {
      window.history.pushState({ screen }, '', finalUrl);
    } catch (e) {
      window.history.replaceState({ screen }, '', finalUrl);
    }
    setCurrentScreen(screen);
  }, [getPathFromScreen, detectOAuthCallback]);

  useEffect(() => {
    analysisDataRef.current = analysisData;
  }, [analysisData]);

  useEffect(() => {
    let mounted = true;
    const initApp = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const reportId = urlParams.get('reportId');
      const path = window.location.pathname;
      const isOAuth = detectOAuthCallback();

      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
        if (!mounted) return;
        sessionRef.current = newSession;
        setSession(newSession);
        if (event === 'SIGNED_IN' && newSession) {
          fetchUserTier(newSession.access_token);
          if (window.location.pathname === '/auth') {
            setCurrentScreen('landing');
            window.history.replaceState({ screen: 'landing' }, '', '/');
          }
        }
      });

      cleanupRef.current = () => subscription.unsubscribe();

      const { data: { session: initialSession } } = await supabase.auth.getSession();
      if (!mounted) return;
      sessionRef.current = initialSession;
      setSession(initialSession);

      if (initialSession) {
        fetchUserTier(initialSession.access_token);
        const sessionId = urlParams.get('session_id');
        if (sessionId) {
          verifyStripeSession(initialSession.access_token, sessionId);
        }
      }

      if (reportId) {
        try {
          const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-cdc57b20/share/${reportId}`, {
            headers: { 'Authorization': `Bearer ${publicAnonKey}` }
          });
          if (!response.ok) throw new Error('Report not found');
          const data = await response.json();
          setAnalysisData(data);
          let screen: Screen = path === '/report' ? 'report' : 'dashboard';
          setCurrentScreen(screen);
          window.history.replaceState({ screen, data }, '', `${path}?reportId=${reportId}`);
        } catch (err) {
          setError('The shared report could not be found.');
        } finally {
          setIsLoading(false);
        }
        return;
      }

      if ((path === '/upload' || path === '/dashboard') && !initialSession && !isOAuth) {
        setCurrentScreen('auth');
        window.history.replaceState({ screen: 'auth' }, '', '/auth');
      } else {
        switch (path) {
          case '/upload': setCurrentScreen('upload'); break;
          case '/library': setCurrentScreen('influencer-library'); break;
          case '/chat': setCurrentScreen('chat'); break;
          case '/pricing': setCurrentScreen('pricing'); break;
          case '/auth': setCurrentScreen(initialSession ? 'landing' : 'auth'); break;
          default: setCurrentScreen('landing');
        }
      }
      setIsLoading(false);
    };

    initApp();

    const handlePopState = (event: PopStateEvent) => {
      if (event.state?.screen) {
        const screen = event.state.screen as Screen;
        setCurrentScreen(screen);
      } else {
        const path = window.location.pathname;
        if (path === '/upload') setCurrentScreen('upload');
        else if (path === '/pricing') setCurrentScreen('pricing');
        else setCurrentScreen('landing');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      mounted = false;
      window.removeEventListener('popstate', handlePopState);
      cleanupRef.current?.();
    };
  }, [fetchUserTier, verifyStripeSession]);

  const renderScreen = () => {
    if (isLoading) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-muted-foreground font-medium">Loading...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background p-6 text-center">
          <h2 className="text-2xl font-bold">Error</h2>
          <p className="text-muted-foreground">{error}</p>
          <button onClick={() => { setError(null); navigateToScreen('landing'); }} className="mt-4 px-6 py-2 bg-primary text-white rounded-lg">Go Home</button>
        </div>
      );
    }

    switch (currentScreen) {
      case 'landing':
        return <LandingPage onNavigate={navigateToScreen} user={session?.user} />;
      case 'auth':
        return <AuthPage onAuthSuccess={() => navigateToScreen('landing')} onBack={() => navigateToScreen('landing')} />;
      case 'upload':
        return <UploadPage onNavigate={navigateToScreen} data={analysisData} />;
      case 'dashboard':
        return analysisData ? <AnnotationDashboard onNavigate={navigateToScreen} data={analysisData} /> : <LandingPage onNavigate={navigateToScreen} />;
      case 'report':
        return analysisData ? <ReportPage onNavigate={navigateToScreen} data={analysisData} /> : <LandingPage onNavigate={navigateToScreen} />;
      case 'influencer-library':
        return <InfluencerLibrary onNavigate={navigateToScreen} data={analysisData} />;
      case 'chat':
        return <InfluencerChat onNavigate={navigateToScreen} initialPersonaId={analysisData?.selectedPersona} />;
      case 'pricing':
        return (
          <PricingPage 
            onBack={() => navigateToScreen('landing')} 
            currentTier={currentTier}
            onPurchase={async (tierId, price) => {
              if (!session) {
                toast.error("Please sign in to upgrade your plan.");
                navigateToScreen('auth');
                return;
              }
              
              const loadingToast = toast.loading("Setting up your subscription...");
              try {
                // Determine if we should use subscription or one-time payment
                // For SaaS, subscriptions are preferred.
                const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-cdc57b20/razorpay/create-subscription`, {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${session.access_token}`,
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({ tierId })
                });

                const data = await response.json();
                
                if (!response.ok) {
                  // Fallback to one-time payment if subscription is not configured (for prototyping ease)
                  console.warn("Subscription not configured, falling back to one-time order", data.error);
                  
                  const orderResponse = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-cdc57b20/razorpay/create-order`, {
                    method: 'POST',
                    headers: {
                      'Authorization': `Bearer ${session.access_token}`,
                      'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ tierId, price })
                  });

                  if (!orderResponse.ok) {
                    const errorData = await orderResponse.json();
                    throw new Error(errorData.error || 'Failed to initialize payment');
                  }
                  
                  const orderData = await orderResponse.json();
                  
                  const options = {
                    key: orderData.key,
                    amount: orderData.amount,
                    currency: orderData.currency,
                    name: "Design Snapper",
                    description: `Upgrade to ${tierId.toUpperCase()} Plan`,
                    order_id: orderData.id,
                    handler: async function (response: any) {
                      toast.loading("Verifying payment...", { id: loadingToast });
                      const verifyResponse = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-cdc57b20/razorpay/verify-payment`, {
                        method: 'POST',
                        headers: {
                          'Authorization': `Bearer ${session.access_token}`,
                          'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                          razorpay_order_id: response.razorpay_order_id,
                          razorpay_payment_id: response.razorpay_payment_id,
                          razorpay_signature: response.razorpay_signature,
                          tierId
                        })
                      });

                      if (verifyResponse.ok) {
                        const result = await verifyResponse.json();
                        setCurrentTier(result.tier);
                        toast.success(`Success! You are now on the ${result.tier.toUpperCase()} plan.`, { id: loadingToast });
                      } else {
                        toast.error("Payment verification failed.", { id: loadingToast });
                      }
                    },
                    prefill: { email: session.user.email },
                    theme: { color: "#0066ff" }
                  };
                  
                  const rzp = new (window as any).Razorpay(options);
                  rzp.open();
                  toast.dismiss(loadingToast);
                  return;
                }
                
                // If subscription was created successfully
                const options = {
                  key: data.key,
                  subscription_id: data.subscription_id,
                  name: "Design Snapper",
                  description: `Monthly ${tierId.toUpperCase()} Subscription`,
                  handler: async function (response: any) {
                    toast.loading("Finalizing subscription...", { id: loadingToast });
                    const verifyResponse = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-cdc57b20/razorpay/verify-subscription`, {
                      method: 'POST',
                      headers: {
                        'Authorization': `Bearer ${session.access_token}`,
                        'Content-Type': 'application/json'
                      },
                      body: JSON.stringify({
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_subscription_id: response.razorpay_subscription_id,
                        razorpay_signature: response.razorpay_signature,
                        tierId
                      })
                    });

                    if (verifyResponse.ok) {
                      const result = await verifyResponse.json();
                      setCurrentTier(result.tier);
                      toast.success(`Welcome to the ${result.tier.toUpperCase()} plan!`, { id: loadingToast });
                    } else {
                      toast.error("Subscription verification failed.", { id: loadingToast });
                    }
                  },
                  prefill: { email: session.user.email },
                  theme: { color: "#0066ff" }
                };

                const rzp = new (window as any).Razorpay(options);
                rzp.open();
                toast.dismiss(loadingToast);
              } catch (err: any) {
                console.error(err);
                toast.error(err.message || "Failed to start checkout. Please try again.", { id: loadingToast });
              }
            }} 
          />
        );
      default:
        return <LandingPage onNavigate={navigateToScreen} user={session?.user} />;
    }
  };

  return (
    <HelmetProvider>
      <div className="min-h-screen bg-background">
        <SEO title="Design Snapper - AI Design Audit" />
        <Toaster position="bottom-right" richColors />
        {renderScreen()}
      </div>
    </HelmetProvider>
  );
}
