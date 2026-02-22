import { useState, useEffect, useCallback, useRef } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { LandingPage } from './components/LandingPage';
import { UploadPage } from './components/UploadPage';
import { AnnotationDashboard } from './components/AnnotationDashboard';
import { ReportPage } from './components/ReportPage';
import { InfluencerLibrary } from './components/InfluencerLibrary';
import { InfluencerChat } from './components/InfluencerChat';
import { SEO } from './components/SEO';
import { projectId, publicAnonKey } from './utils/supabase/info';
import { Loader2 } from 'lucide-react';
import { Toaster } from 'sonner';
import { AuthPage } from './components/AuthPage';
import { CompleteProfilePage } from './components/CompleteProfilePage';
import { PricingPage } from './components/PricingPage';
import { supabase } from './utils/supabase/client';
import { Session } from '@supabase/supabase-js';
import { useCredits } from './hooks/useCredits';

type Screen = 'landing' | 'upload' | 'dashboard' | 'report' | 'influencer-library' | 'chat' | 'auth' | 'complete-profile' | 'pricing';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('landing');
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const analysisDataRef = useRef<any>(null);

  // Lifted here so credits persist across page navigation
  const credits = useCredits(session);

  // Keep ref in sync with state so popstate handler always has current data
  useEffect(() => {
    analysisDataRef.current = analysisData;
  }, [analysisData]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);

      if (session) {
        // Check if user has a username
        const hasUsername = !!session.user.user_metadata?.username;

        if (!hasUsername) {
          // If no username, force redirect to complete profile
          if (currentScreen !== 'complete-profile') {
            navigateToScreen('complete-profile');
          }
        } else if (currentScreen === 'auth' || currentScreen === 'complete-profile') {
          // If on auth or complete-profile and has username, go to upload
          navigateToScreen('upload');
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [currentScreen]);

  const getPageTitle = (screen: Screen) => {
    switch (screen) {
      case 'landing': return 'Design Snapper - AI Design Audit Tool';
      case 'upload': return 'Upload Design - Design Snapper';
      case 'dashboard': return 'Analysis Dashboard - Design Snapper';
      case 'report': return 'Full Audit Report - Design Snapper';
      case 'influencer-library': return 'Select Design Expert - Design Snapper';
      case 'chat': return 'Chat with Influencer - Design Snapper';
      case 'auth': return 'Sign In - Design Snapper';
      case 'complete-profile': return 'Complete Profile - Design Snapper';
      case 'pricing': return 'Pricing - Design Snapper';
      default: return 'Design Snapper';
    }
  };

  const getPathFromScreen = (screen: Screen) => {
    switch (screen) {
      case 'landing': return '/';
      case 'upload': return '/upload';
      case 'dashboard': return '/dashboard';
      case 'report': return '/report';
      case 'influencer-library': return '/library';
      case 'chat': return '/chat';
      case 'auth': return '/auth';
      case 'complete-profile': return '/complete-profile';
      case 'pricing': return '/pricing';
      default: return '/';
    }
  };

  const navigateToScreen = useCallback((screen: any, data?: any) => {
    // Protect upload route
    if (screen === 'upload' && !session) {
      setCurrentScreen('auth');
      window.history.pushState({ screen: 'auth' }, '', '/auth');
      return;
    }

    if (data) {
      setAnalysisData(data);
      analysisDataRef.current = data;
    }

    const path = getPathFromScreen(screen as Screen);
    const urlParams = new URLSearchParams(window.location.search);
    const reportId = urlParams.get('reportId');

    // Maintain reportId in URL if we are moving between data-driven pages
    const isDataPage = screen === 'dashboard' || screen === 'report';
    const finalUrl = (isDataPage && reportId) ? `${path}?reportId=${reportId}` : path;

    try {
      // Only store screen name in history — never store large base64 data
      // as it can exceed browser pushState size limits and throw DOMException
      window.history.pushState({ screen }, '', finalUrl);
    } catch (e) {
      console.warn('pushState failed, falling back to replaceState:', e);
      try {
        window.history.replaceState({ screen }, '', finalUrl);
      } catch (_) { /* ignore */ }
    }
    setCurrentScreen(screen as Screen);
  }, [session]);

  const handleSignOut = useCallback(async () => {
    await supabase.auth.signOut();
    setSession(null);
    navigateToScreen('landing');
  }, [navigateToScreen]);

  useEffect(() => {
    const initApp = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const reportId = urlParams.get('reportId');
      const path = window.location.pathname;

      // Check current session first to handle /complete-profile logic on refresh
      const { data: { session: currentSession } } = await supabase.auth.getSession();

      if (currentSession && !currentSession.user.user_metadata?.username) {
        // Force complete profile if logged in but no username
        setCurrentScreen('complete-profile');
        setIsLoading(false);
        return;
      }

      // Handle shared report priority
      if (reportId) {
        try {
          const response = await fetch(
            `https://${projectId}.supabase.co/functions/v1/make-server-cdc57b20/share/${reportId}`,
            {
              headers: {
                'Authorization': `Bearer ${publicAnonKey}`
              }
            }
          );

          if (!response.ok) throw new Error('Report not found');
          const data = await response.json();
          setAnalysisData(data);

          // Respect the current path if it's valid for data-driven screens
          let screen: Screen = 'dashboard';
          if (path === '/report') screen = 'report';

          setCurrentScreen(screen);
          window.history.replaceState({ screen, data }, '', `${path}?reportId=${reportId}`);
        } catch (err) {
          console.error('Error fetching report:', err);
          setError('The shared report could not be found or has expired.');
        } finally {
          setIsLoading(false);
        }
        return;
      }

      // Initial route based on path
      switch (path) {
        case '/upload': setCurrentScreen('upload'); break;
        case '/dashboard': setCurrentScreen('landing'); break; // No data, redirect home
        case '/report': setCurrentScreen('landing'); break; // No data, redirect home
        case '/library': setCurrentScreen('influencer-library'); break;
        case '/chat': setCurrentScreen('chat'); break;
        case '/pricing': setCurrentScreen('pricing'); break;
        case '/complete-profile':
          if (currentSession && !currentSession.user.user_metadata?.username) {
            setCurrentScreen('complete-profile');
          } else {
            setCurrentScreen('landing');
          }
          break;
        default: setCurrentScreen('landing');
      }
      setIsLoading(false);
    };

    initApp();

    const handlePopState = (event: PopStateEvent) => {
      if (event.state?.screen) {
        const screen = event.state.screen as Screen;
        // For data-dependent screens, only navigate there if we still have data
        if ((screen === 'dashboard' || screen === 'report') && !analysisDataRef.current) {
          setCurrentScreen('landing');
        } else {
          setCurrentScreen(screen);
        }
      } else {
        // Fallback for direct URL entries
        const path = window.location.pathname;
        switch (path) {
          case '/upload': setCurrentScreen('upload'); break;
          case '/dashboard':
            setCurrentScreen(analysisDataRef.current ? 'dashboard' : 'landing');
            break;
          case '/report':
            setCurrentScreen(analysisDataRef.current ? 'report' : 'landing');
            break;
          case '/library': setCurrentScreen('influencer-library'); break;
          case '/chat': setCurrentScreen('chat'); break;
          case '/pricing': setCurrentScreen('pricing'); break;
          case '/complete-profile': setCurrentScreen('complete-profile'); break;
          default: setCurrentScreen('landing');
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const renderScreen = () => {
    if (isLoading) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-muted-foreground font-medium">Loading analysis report...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background p-6 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-600 mb-2">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
          </div>
          <h2 className="text-2xl font-bold">Report Not Found</h2>
          <p className="text-muted-foreground max-w-md">{error}</p>
          <button
            onClick={() => { setError(null); navigateToScreen('landing'); }}
            className="mt-4 px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            Go to Homepage
          </button>
        </div>
      );
    }

    switch (currentScreen) {
      case 'landing':
        return <LandingPage onNavigate={navigateToScreen} session={session} onSignOut={handleSignOut} />;
      case 'upload':
        return <UploadPage onNavigate={navigateToScreen} data={analysisData} session={session} onSignOut={handleSignOut} credits={credits} />;

      case 'dashboard':
        return analysisData ? <AnnotationDashboard onNavigate={navigateToScreen} data={analysisData} session={session} onSignOut={handleSignOut} /> : <LandingPage onNavigate={navigateToScreen} />;

      case 'report':
        return analysisData ? <ReportPage onNavigate={navigateToScreen} data={analysisData} /> : <LandingPage onNavigate={navigateToScreen} />;
      case 'influencer-library':
        return <InfluencerLibrary onNavigate={navigateToScreen} data={analysisData} />;
      case 'chat':
        return <InfluencerChat onNavigate={navigateToScreen} initialPersonaId={analysisData?.selectedPersona} />;
      case 'auth':
        return <AuthPage onNavigate={navigateToScreen} />;
      case 'complete-profile':
        return <CompleteProfilePage onNavigate={navigateToScreen} />;
      case 'pricing':
        return <PricingPage onNavigate={navigateToScreen} session={session} />;
      default:
        return <LandingPage onNavigate={navigateToScreen} />;
    }
  };

  return (
    <HelmetProvider>
      <div className="min-h-screen bg-background">
        <SEO title={getPageTitle(currentScreen)} />
        <Toaster position="bottom-right" richColors />
        {renderScreen()}
      </div>
    </HelmetProvider>
  );
}