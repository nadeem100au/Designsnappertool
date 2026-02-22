import { projectId, publicAnonKey } from './supabase/info';

interface AnalysisAnnotation {
  id: number;
  x: number;
  y: number;
  type: 'accessibility' | 'usability' | 'consistency' | 'visual' | 'marketing';
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

export interface AuditUsage {
  inputTokens: number;
  outputTokens: number;
  costUSD: number;
  creditsDeducted: number;
  creditsRemaining: number | null;
}

interface AnalysisResult {
  annotations: AnalysisAnnotation[];
  designType: string;
  mode?: string;
  influencerReview?: InfluencerReview;
  usage?: AuditUsage;
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
    accessToken?: string;
  }
): Promise<AnalysisResult> {
  console.log('Starting AI analysis...');

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${publicAnonKey}`,
    };

    const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-cdc57b20/analyze`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        image: imageDataUrl,
        context,
        mode: options?.mode,
        influencerPersona: options?.influencerPersona,
        testCriteria: options?.testCriteria,
        accessToken: options?.accessToken,
      })
    });

    const result = await response.json();

    if (!response.ok || result.error) {
      console.error('Server error response:', result.error || 'Unknown error');
      // Throw with specific error codes so UploadPage can handle upgrade/exhaustion
      const err = new Error(result.message || result.error || `Server returned ${response.status}`);
      (err as any).code = result.error; // e.g. 'upgrade_required' or 'credits_exhausted'
      throw err;
    }

    return {
      annotations: result.annotations || [],
      designType: result.designType || 'UX',
      mode: result.mode,
      influencerReview: result.influencerReview,
      usage: result.usage,
    };

  } catch (error: any) {
    console.error('AI Analysis request failed:', error);
    throw error;
  }
}

