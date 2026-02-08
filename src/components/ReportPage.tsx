import { useState, useRef, useEffect, useMemo } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { 
  ArrowLeft, 
  Download, 
  Calendar,
  Info,
  Accessibility,
  Eye,
  Layout,
  Palette,
  Megaphone,
  Sparkles,
  Share2,
  Loader2,
  Flame,
  Printer,
  Crown,
  Quote,
  Lightbulb,
  Check
} from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { HeatmapCanvas } from './HeatmapCanvas';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { toast } from "sonner@2.0.3";

interface Annotation {
  id: number;
  x: number;
  y: number;
  type: 'accessibility' | 'usability' | 'consistency' | 'visual' | 'marketing';
  severity: 'critical' | 'minor';
  title: string;
  current: string;
  suggested: string;
  impact: string;
}

interface InfluencerReview {
  persona: string;
  overallImpression: string;
  strategicFeedback: string[];
  philosophicalAdvice: string;
  actionableTips: string[];
}

interface ReportPageProps {
  onNavigate: (screen: string, data?: any) => void;
  data: {
    screenshot: string;
    annotations: Annotation[];
    designType: string;
    analysisMode?: string;
    influencerReview?: InfluencerReview;
  };
}

export function ReportPage({ onNavigate, data }: ReportPageProps) {
  const [isSharing, setIsSharing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const annotations = useMemo(() => data?.annotations || [], [data]);

  useEffect(() => {
    if (containerRef.current) {
      const updateDimensions = () => {
        if (containerRef.current) {
          const { width, height } = containerRef.current.getBoundingClientRect();
          setDimensions({ width, height });
        }
      };
      updateDimensions();
      window.addEventListener('resize', updateDimensions);
      const img = containerRef.current.querySelector('img');
      if (img) {
        if (img.complete) updateDimensions();
        else img.onload = updateDimensions;
      }
      return () => window.removeEventListener('resize', updateDimensions);
    }
  }, [data.screenshot]);

  const handleShare = async () => {
    setIsSharing(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-cdc57b20/make-server-cdc57b20/share`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({
            screenshot: data.screenshot,
            annotations: annotations,
            designType: data.designType,
            analysisMode: data.analysisMode,
            influencerReview: data.influencerReview
          })
        }
      );
      if (!response.ok) throw new Error('Failed to share');
      const { shareId } = await response.json();
      const baseUrl = window.location.origin + window.location.pathname;
      const fullShareUrl = `${baseUrl}?reportId=${shareId}`;
      await navigator.clipboard.writeText(fullShareUrl);
      toast.success("Link copied!");
    } catch (err) {
      toast.error("Share failed");
    } finally {
      setIsSharing(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'accessibility': return <Accessibility className="w-3 h-3" />;
      case 'usability': return <Eye className="w-3 h-3" />;
      case 'consistency': return <Layout className="w-3 h-3" />;
      case 'visual': return <Palette className="w-3 h-3" />;
      case 'marketing': return <Megaphone className="w-3 h-3" />;
      default: return <Info className="w-3 h-3" />;
    }
  };

  const stats = {
    total: annotations.length,
    critical: annotations.filter(a => a.severity === 'critical').length,
    minor: annotations.filter(a => a.severity === 'minor').length,
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 overflow-x-hidden pb-12">
      {/* Navigation */}
      <nav className="border-b border-slate-200 bg-white print:hidden sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-3 flex justify-between items-center">
          <Button 
            variant="ghost" 
            onClick={() => onNavigate('dashboard', data)}
            className="flex items-center gap-2 text-slate-600"
          >
            <ArrowLeft className="w-4 h-4" />
            Dashboard
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleShare} disabled={isSharing}>
              {isSharing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Share2 className="w-4 h-4 mr-2" />}
              Copy Link
            </Button>
            <Button size="sm" onClick={() => window.print()} className="bg-slate-900 hover:bg-slate-800 text-white">
              <Printer className="w-4 h-4 mr-2" />
              Print Report
            </Button>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-12 space-y-12 print:space-y-0 print:p-0 print:max-w-none print:bg-white">
        
        {/* PAGE 1: VISUAL DIAGNOSTIC */}
        <section className="bg-white p-10 rounded-3xl shadow-2xl border border-slate-200 print:shadow-none print:border-none print:rounded-none print:p-12 print:h-[297mm] flex flex-col page-break">
          
          {/* Header Section */}
          <div className="flex justify-between items-center mb-10 border-b border-slate-100 pb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center shadow-xl">
                <Flame className="w-7 h-7 text-orange-500" />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight uppercase text-slate-900">Design Diagnostic Report</h1>
                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-[0.2em] leading-none">Automated Spectral Analysis</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="px-4 py-2 bg-red-50 rounded-xl border border-red-100 text-center min-w-[70px]">
                <div className="text-lg font-black text-red-600">{stats.critical}</div>
                <div className="text-[9px] text-red-400 uppercase font-black tracking-tighter leading-none">Critical</div>
              </div>
              <div className="px-4 py-2 bg-blue-50 rounded-xl border border-blue-100 text-center min-w-[70px]">
                <div className="text-lg font-black text-blue-600">{stats.minor}</div>
                <div className="text-[9px] text-blue-400 uppercase font-black tracking-tighter leading-none">Minor</div>
              </div>
            </div>
          </div>

          {/* Main Visual Content */}
          <div className="flex-1 space-y-8">
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-inner bg-slate-950 flex justify-center items-center" ref={containerRef}>
              <div className="relative inline-block w-full">
                <ImageWithFallback 
                  src={data.screenshot}
                  alt="Audit Preview"
                  className="w-full h-auto opacity-70 grayscale-[20%] blur-[0.5px] block"
                />
                
                {/* Spectral Heatmap Overlay */}
                {dimensions.width > 0 && (
                  <HeatmapCanvas 
                    annotations={annotations}
                    width={dimensions.width}
                    height={dimensions.height}
                    className="absolute inset-0 pointer-events-none mix-blend-screen opacity-90"
                  />
                )}

                {/* Annotation Pins */}
                {annotations.map((ann) => {
                  return (
                    <div
                      key={ann.id}
                      className={`absolute w-7 h-7 rounded-full border-2 border-white shadow-2xl flex items-center justify-center transition-all ${
                        ann.severity === 'critical' ? 'bg-red-500' : 'bg-blue-500'
                      }`}
                      style={{ left: `${ann.x}%`, top: `${ann.y}%`, transform: 'translate(-50%, -50%)' }}
                    >
                      <span className="text-[11px] text-white font-black">{ann.id}</span>
                    </div>
                  );
                })}
              </div>
              
              <div className="absolute top-4 right-4 px-3 py-1.5 bg-black/60 backdrop-blur-md rounded-full border border-white/10 shadow-lg">
                <span className="text-[9px] text-white/90 font-black uppercase tracking-[0.2em] flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                  Ocular Density Mapping
                </span>
              </div>
            </div>

            {/* Executive Summary Mini */}
            <div className="p-8 bg-slate-900 rounded-2xl text-white relative overflow-hidden shadow-xl border border-white/5">
              <div className="absolute top-0 right-0 w-48 h-48 bg-orange-500/10 rounded-full blur-[80px] -mr-24 -mt-24" />
              <div className="relative flex gap-6 items-start">
                <div className="shrink-0 p-3 bg-white/5 rounded-xl border border-white/10">
                  <Sparkles className="w-6 h-6 text-orange-400" />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-[0.3em] text-orange-500 mb-3">Diagnostic Analysis Roadmap</h3>
                  <p className="text-sm text-slate-300 leading-relaxed font-medium max-w-2xl">
                    The spectral map identifies major focal friction points. Immediate priority must be assigned to the <span className="text-white font-bold">{stats.critical} critical blockers</span> highlighted in red. These elements directly impede functional usability and require architectural adjustment before UI polishing.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Info Page 1 */}
          <div className="mt-auto pt-8 border-t border-slate-100 flex justify-between items-center text-[9px] text-slate-400 font-bold uppercase tracking-[0.2em]">
            <div>Design Snapper Pro • Ver 2.5.0 • Page 01/02</div>
            <div className="flex items-center gap-2">
              <Calendar className="w-3 h-3" />
              {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>
        </section>

        {/* PAGE 2: INFLUENCER REVIEW (CONDITIONAL) */}
        {data.influencerReview && (
          <section className="bg-white p-10 rounded-3xl shadow-2xl border border-slate-200 print:shadow-none print:border-none print:rounded-none print:p-12 print:h-[297mm] flex flex-col page-break">
             <div className="flex items-center justify-between mb-10 border-b border-slate-100 pb-8">
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center text-white shadow-md">
                   <Crown className="w-5 h-5" />
                 </div>
                 <h2 className="text-xl font-black uppercase tracking-tight text-slate-900">Strategic Expert Review</h2>
               </div>
               <Badge variant="outline" className="px-3 py-1 font-black text-[10px] uppercase tracking-widest border-slate-200 text-slate-500">
                 By {data.influencerReview.persona}
               </Badge>
             </div>

             <div className="flex-1 space-y-8 bg-slate-50/50 p-8 rounded-2xl border border-slate-100">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative">
                   <Quote className="w-10 h-10 text-slate-100 absolute top-4 left-4 -z-0" />
                   <p className="text-lg font-medium text-slate-700 italic leading-relaxed relative z-10 text-center px-8">
                      "{data.influencerReview.overallImpression}"
                   </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="space-y-4">
                      <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 border-b border-slate-200 pb-2">Strategic Feedback</h3>
                      {data.influencerReview.strategicFeedback.map((point, i) => (
                        <div key={i} className="flex gap-3">
                           <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                              <span className="text-[10px] font-black text-primary">{i + 1}</span>
                           </div>
                           <p className="text-sm text-slate-700">{point}</p>
                        </div>
                      ))}
                   </div>

                   <div className="space-y-4">
                      <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 border-b border-slate-200 pb-2">Actionable Steps</h3>
                      {data.influencerReview.actionableTips.map((tip, i) => (
                         <div key={i} className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-lg shadow-sm">
                            <Check className="w-4 h-4 text-green-600 shrink-0" />
                            <p className="text-xs font-bold text-slate-800">{tip}</p>
                         </div>
                      ))}
                   </div>
                </div>

                <div className="p-6 bg-slate-900 text-white rounded-xl shadow-lg mt-4">
                   <div className="flex items-center gap-2 mb-3">
                      <Lightbulb className="w-5 h-5 text-yellow-400" />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Core Philosophical Principle</span>
                   </div>
                   <p className="text-base font-medium leading-relaxed border-l-2 border-yellow-400 pl-4">
                      {data.influencerReview.philosophicalAdvice}
                   </p>
                </div>
             </div>

             <div className="mt-auto pt-8 border-t border-slate-100 flex justify-between items-center text-[9px] text-slate-400 font-bold uppercase tracking-[0.2em]">
               <div>Design Snapper Pro • Ver 2.5.0 • Page {data.influencerReview ? '02' : '02'}/03</div>
               <div className="text-slate-900 font-black">Exclusive Content</div>
             </div>
          </section>
        )}

        {/* PAGE 3: DETAILED FINDINGS & SUGGESTIONS */}
        <section className="bg-white p-10 rounded-3xl shadow-2xl border border-slate-200 print:shadow-none print:border-none print:rounded-none print:p-12 print:h-[297mm] flex flex-col page-break">
          
          <div className="flex items-center justify-between mb-10 border-b border-slate-100 pb-8">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                <Layout className="w-4 h-4 text-slate-900" />
              </div>
              <h2 className="text-xl font-black uppercase tracking-tight text-slate-900">Observation Log</h2>
            </div>
            <Badge variant="outline" className="px-3 py-1 font-black text-[10px] uppercase tracking-widest border-slate-200 text-slate-500">
              Audit Findings ({annotations.length})
            </Badge>
          </div>

          <div className="flex-1 space-y-6">
            <div className="grid grid-cols-1 gap-6">
              {annotations.map((ann) => {
                return (
                  <div key={ann.id} className="p-6 bg-slate-50 border border-slate-100 rounded-2xl flex gap-6 print:bg-white print:border-slate-200 transition-all hover:bg-slate-100/50">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
                      ann.severity === 'critical' ? 'bg-red-500' : 'bg-blue-500'
                    } text-white`}>
                      <span className="text-sm font-black">{ann.id}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-base font-bold text-slate-900 truncate leading-tight">{ann.title}</h4>
                        <div className="shrink-0 opacity-50">{getTypeIcon(ann.type)}</div>
                        <Badge variant={ann.severity === 'critical' ? 'destructive' : 'secondary'} className="text-[8px] h-4 uppercase font-black px-1.5 ml-auto tracking-tighter">
                          {ann.severity}
                        </Badge>
                      </div>
                      
                      <div className="space-y-3 mb-4">
                        <div>
                          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Observation</p>
                          <p className="text-xs text-slate-600 leading-relaxed">{ann.current}</p>
                        </div>
                        <div>
                          <p className="text-[9px] font-black uppercase tracking-widest text-blue-400 mb-1">Impact</p>
                          <p className="text-[11px] text-slate-500 font-medium italic">{ann.impact}</p>
                        </div>
                      </div>
                      
                      {/* Explicit Suggestion Box */}
                      <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                          <Sparkles className="w-3.5 h-3.5 text-green-600" />
                          <p className="text-[10px] font-black text-green-700 uppercase tracking-widest leading-none">Suggested Fix</p>
                        </div>
                        <p className="text-[13px] font-bold text-slate-800 leading-snug">{ann.suggested}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {annotations.length === 0 && (
                <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-3xl">
                  <Info className="w-10 h-10 text-slate-300 mx-auto mb-4" />
                  <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">No issues detected in current scan.</p>
                </div>
              )}
            </div>
          </div>

          {/* Footer Info Page 3 */}
          <div className="mt-auto pt-8 border-t border-slate-100 flex justify-between items-center text-[9px] text-slate-400 font-bold uppercase tracking-[0.2em]">
            <div>Design Snapper Pro • Ver 2.5.0 • Page {data.influencerReview ? '03' : '02'}/{data.influencerReview ? '03' : '02'}</div>
            <div className="text-slate-900 font-black">Audit complete</div>
          </div>
        </section>

      </div>

      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 0;
          }
          body {
            background: white !important;
            margin: 0;
            padding: 0;
          }
          nav {
            display: none !important;
          }
          .min-h-screen {
            min-height: auto !important;
          }
          .max-w-4xl {
            max-width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          section {
            width: 100% !important;
            height: 100vh !important;
            margin: 0 !important;
            padding: 12mm !important;
            box-shadow: none !important;
            border: none !important;
            border-radius: 0 !important;
            break-after: page !important;
            page-break-after: always !important;
          }
          .page-break {
            break-after: page !important;
            page-break-after: always !important;
          }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>
    </div>
  );
}
