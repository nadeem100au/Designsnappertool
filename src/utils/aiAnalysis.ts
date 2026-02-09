import { projectId, publicAnonKey } from './supabase/info';
import { supabase } from './supabase/client';

interface AnalysisAnnotation {
  id: number;
  x: number;
  y: number;
  type: 'contrast' | 'usability' | 'consistency' | 'visual' | 'marketing';
  severity: 'critical' | 'minor';
  title: string;
  description: string;
  fix: string;
}

export interface InfluencerReview {
  persona: string;
  overallImpression: string;
  strategicFeedback: string[];
  philosophicalAdvice: string;
  actionableTips: string[];
}

interface AnalysisResult {
  annotations: AnalysisAnnotation[];
  designType: string;
  mode?: string;
  influencerReview?: InfluencerReview;
}

export async function analyzeScreenshotWithAI(
  imageDataUrl: string,
  context?: string,
  options?: {
    mode: 'technical-only' | 'with-influencer';
    influencerPersona?: string;
    testCriteria?: {
      visual: string[];
      business: string[];
      heuristic: string[];
    };
  }
): Promise<AnalysisResult> {
  console.log('Starting AI analysis...');
  
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token || publicAnonKey;

    const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-cdc57b20/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ 
        image: imageDataUrl, 
        context,
        mode: options?.mode,
        influencerPersona: options?.influencerPersona,
        testCriteria: options?.testCriteria
      })
    });

    const result = await response.json();

    if (!response.ok || result.error) {
      console.error('Server error response:', result.error || 'Unknown error');
      throw new Error(result.error || `Server returned ${response.status}`);
    }
    
    return {
      annotations: result.annotations || [],
      designType: result.designType || 'UX',
      mode: result.mode,
      influencerReview: result.influencerReview
    };

  } catch (error: any) {
    console.error('AI Analysis request failed:', error);
    // No mock fallback as per user request to ensure 100% AI generated results.
    throw error;
  }
}
