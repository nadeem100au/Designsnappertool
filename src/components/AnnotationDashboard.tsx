import { useState, useMemo, useRef, useEffect } from 'react';
import { Resizable } from 're-resizable';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import { 
  ArrowLeft, 
  Download, 
  Share2, 
  AlertTriangle, 
  Info, 
  CheckCircle2,
  Eye,
  Accessibility,
  Layout,
  Palette,
  Megaphone,
  Sparkles,
  Flame,
  MousePointer2,
  Loader2,
  Copy,
  Check,
  X,
  Printer,
  Crown,
  Lightbulb,
  MessageSquare,
  Send,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { HeatmapCanvas } from './HeatmapCanvas';
import { AnnotationPin } from './AnnotationPin';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { toast } from "sonner@2.0.3";

interface Annotation {
  id: number;
  x: number;
  y: number;
  category: 'visual' | 'business' | 'heuristic' | 'contrast';
  tag: string;
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

interface AnnotationDashboardProps {
  onNavigate: (screen: string, data?: any) => void;
  data: {
    screenshot: string;
    images?: string[];
    imageHeights?: number[];
    imageWidths?: number[];
    stitchedWidth?: number;
    annotations: Annotation[];
    designType: string;
    analysisMode?: string;
    influencerReview?: InfluencerReview;
  };
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string | Array<{ type: string; text?: string; source?: any }>;
}

export function AnnotationDashboard({ onNavigate, data }: AnnotationDashboardProps) {
  const [selectedAnnotation, setSelectedAnnotation] = useState<number | null>(null);
  const [learningAnnotation, setLearningAnnotation] = useState<Annotation | null>(null);
  const [modalTab, setModalTab] = useState('analysis');
  const [activeTab, setActiveTab] = useState('all');
  const [viewMode, setViewMode] = useState<'annotations' | 'heatmap'>('annotations');
  const [sidebarMode, setSidebarMode] = useState<'technical' | 'influencer'>('technical');
  const [influencerView, setInfluencerView] = useState<'review' | 'chat'>('review');
  const [isSharing, setIsSharing] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);

  const images = data.images || [data.screenshot];
  const heights = data.imageHeights || [];
  const widths = data.imageWidths || [];
  const stitchedWidth = data.stitchedWidth || 0;
  const totalStitchedHeight = heights.reduce((a, b) => a + b, 0);

  useEffect(() => {
    if (data.influencerReview) {
      setSidebarMode('influencer');
    }
  }, [data.influencerReview]);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages, influencerView]);

  const updateDimensions = () => {
    const currentSlideElement = scrollContainerRef.current?.children[currentSlide] as HTMLElement;
    if (currentSlideElement) {
      const img = currentSlideElement.querySelector('img');
      if (img) {
        const { width, height } = img.getBoundingClientRect();
        setDimensions({ width, height });
      }
    }
  };

  useEffect(() => {
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [currentSlide, viewMode]);

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const scrollLeft = scrollContainerRef.current.scrollLeft;
      const width = scrollContainerRef.current.offsetWidth;
      const newSlide = Math.round(scrollLeft / width);
      if (newSlide !== currentSlide && width > 0) {
        setCurrentSlide(newSlide);
      }
    }
  };

  const scrollToSlide = (index: number) => {
    if (scrollContainerRef.current) {
      const width = scrollContainerRef.current.offsetWidth;
      scrollContainerRef.current.scrollTo({
        left: index * width,
        behavior: 'smooth'
      });
    }
  };

  const nextSlide = () => scrollToSlide(Math.min(currentSlide + 1, images.length - 1));
  const prevSlide = () => scrollToSlide(Math.max(currentSlide - 1, 0));

  const mappedAnnotations = useMemo(() => {
    if (!heights.length || heights.length === 1) {
      return data.annotations.map(a => ({ ...a, slideIndex: 0 }));
    }
    const offsets: number[] = [0];
    for (let i = 0; i < heights.length; i++) {
      offsets.push(offsets[i] + heights[i]);
    }
    return data.annotations.map(a => {
      // 1. Find the slide index based on Y coordinate in stitched image
      const yAbs = (a.y * totalStitchedHeight) / 100;
      let slideIndex = 0;
      for (let i = 0; i < heights.length; i++) {
        if (yAbs >= offsets[i] && yAbs < (offsets[i + 1] || Infinity)) {
          slideIndex = i;
          break;
        }
      }
      
      // Handle edge case for last pixel
      if (yAbs >= totalStitchedHeight - 1) slideIndex = heights.length - 1;

      // 2. Map Y back to the individual image's coordinate space
      const relativeY = ((yAbs - offsets[slideIndex]) / heights[slideIndex]) * 100;
      
      // 3. Map X back to the individual image's coordinate space
      // In UploadPage.tsx, images are drawn centered: x_offset = (maxWidth - img.width) / 2
      let relativeX = a.x;
      if (widths[slideIndex] && stitchedWidth) {
        const xOffset = (stitchedWidth - widths[slideIndex]) / 2;
        const xAbs = (a.x * stitchedWidth) / 100;
        relativeX = ((xAbs - xOffset) / widths[slideIndex]) * 100;
      }

      return { ...a, slideIndex, x: relativeX, y: relativeY };
    });
  }, [data.annotations, heights, widths, totalStitchedHeight, stitchedWidth]);

  const filteredAnnotations = useMemo(() => {
    const slideFiltered = mappedAnnotations.filter(a => a.slideIndex === currentSlide);
    if (activeTab === 'all') return slideFiltered;
    return slideFiltered.filter(a => a.category === activeTab);
  }, [mappedAnnotations, currentSlide, activeTab]);

  const allFilteredAnnotations = useMemo(() => {
    if (activeTab === 'all') return mappedAnnotations;
    return mappedAnnotations.filter(a => a.category === activeTab);
  }, [mappedAnnotations, activeTab]);

  const stats = useMemo(() => {
    const ann = data?.annotations || [];
    return {
      total: ann.length,
      critical: ann.filter(a => a.severity === 'critical').length,
      minor: ann.filter(a => a.severity === 'minor').length,
    };
  }, [data?.annotations]);

  useEffect(() => {
    if (selectedAnnotation !== null) {
      const ann = mappedAnnotations.find(a => a.id === selectedAnnotation);
      if (ann && ann.slideIndex !== currentSlide) {
        scrollToSlide(ann.slideIndex);
      }
      const element = document.getElementById(`annotation-${selectedAnnotation}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [selectedAnnotation, mappedAnnotations]);

  const handleShare = async () => {
    setIsSharing(true);
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-cdc57b20/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${publicAnonKey}` },
        body: JSON.stringify({ ...data })
      });
      if (!response.ok) throw new Error('Failed to share');
      const { shareId } = await response.json();
      setShareUrl(`${window.location.origin}${window.location.pathname}?reportId=${shareId}`);
      setShowShareModal(true);
      toast.success("Sharable link ready!");
    } catch (err) {
      toast.error("Could not generate share link.");
    } finally {
      setIsSharing(false);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;
    const newMessage: ChatMessage = { role: 'user', content: chatInput };
    setChatMessages(prev => [...prev, newMessage]);
    setChatInput('');
    setIsChatLoading(true);
    try {
      let personaKey = 'chris-do';
      if (data.influencerReview?.persona.includes('Don')) personaKey = 'don-norman';
      if (data.influencerReview?.persona.includes('Ansh')) personaKey = 'ansh-mehra';
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-cdc57b20/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${publicAnonKey}` },
        body: JSON.stringify({ messages: [...chatMessages, newMessage], persona: personaKey, context: { annotations: data.annotations, influencerReview: data.influencerReview } })
      });
      const result = await response.json();
      setChatMessages(prev => [...prev, { role: 'assistant', content: result.message }]);
    } catch (error) {
      toast.error("Chat failed.");
    } finally {
      setIsChatLoading(false);
    }
  };

  const getSeverityStyles = (severity: 'critical' | 'minor', isSelected: boolean) => {
    return isSelected 
      ? 'border-blue-400 bg-blue-50/50 shadow-sm' 
      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/40';
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'accessibility': return <Accessibility className="w-3 h-3" />;
      case 'usability': return <MousePointer2 className="w-3 h-3" />;
      case 'visual': return <Palette className="w-3 h-3" />;
      case 'marketing': return <Megaphone className="w-3 h-3" />;
      default: return <Layout className="w-3 h-3" />;
    }
  };

  const getTypeBadgeStyles = (type: string) => {
    switch (type) {
      case 'accessibility': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'usability': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'visual': return 'bg-pink-100 text-pink-700 border-pink-200';
      case 'marketing': return 'bg-orange-100 text-orange-700 border-orange-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground relative" onClick={() => setSelectedAnnotation(null)}>
      {showShareModal && shareUrl && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <Card className="w-full max-w-md p-6 relative">
            <button onClick={() => setShowShareModal(false)} className="absolute right-4 top-4 text-muted-foreground"><X className="w-5 h-5" /></button>
            <h3 className="text-xl font-bold mb-2 flex items-center gap-2"><Share2 className="w-5 h-5 text-primary" />Report Ready</h3>
            <div className="flex gap-2 mb-6">
              <div className="flex-1 bg-muted p-3 rounded-lg border overflow-hidden"><code className="text-[11px] break-all text-primary font-mono">{shareUrl}</code></div>
              <Button size="icon" onClick={() => { navigator.clipboard.writeText(shareUrl); toast.success("Copied!"); }}><Copy className="w-4 h-4" /></Button>
            </div>
            <Button className="w-full bg-slate-900" onClick={() => setShowShareModal(false)}>Close</Button>
          </Card>
        </div>
      )}

      <nav className="border-b border-slate-200 bg-background sticky top-0 z-50" onClick={(e) => e.stopPropagation()}>
        <div className="max-w-full px-6 py-4 flex justify-between items-center">
          <Button variant="ghost" onClick={() => onNavigate('upload')} className="flex items-center gap-2"><ArrowLeft className="w-4 h-4" />New</Button>
          <div className="flex items-center gap-4">
            {data.influencerReview && <Badge variant="outline" className="bg-amber-50 text-amber-600 gap-1 border-amber-200/50"><Crown className="w-3 h-3" />{data.influencerReview.persona}</Badge>}
            
            <div className="flex bg-muted p-1 rounded-lg border border-slate-300">
              <Button variant={viewMode === 'annotations' ? 'default' : 'ghost'} size="sm" className="h-8 text-[11px] font-bold px-3" onClick={() => setViewMode('annotations')}>
                <MousePointer2 className="w-3.5 h-3.5 mr-1.5" />
                Pins
              </Button>
              <Button variant={viewMode === 'heatmap' ? 'default' : 'ghost'} size="sm" className="h-8 text-[11px] font-bold px-3" onClick={() => setViewMode('heatmap')}>
                <Flame className="w-3.5 h-3.5 mr-1.5" />
                Heatmap
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button 
                className="h-9 font-bold text-xs px-4 bg-slate-900 hover:bg-slate-800 text-white shadow-sm" 
                onClick={() => onNavigate('report', data)}
              >
                <Eye className="w-3.5 h-3.5 mr-2" />
                View Full Report
              </Button>
              <Button variant="outline" className="h-9 font-bold text-xs px-4" onClick={handleShare} disabled={isSharing}>
                {isSharing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Share2 className="w-3.5 h-3.5 mr-2" />}
                Share
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex h-[calc(100vh-73px)]">
        <div className="flex-1 p-6 bg-muted/20 relative group">
          {images.length > 1 && (
            <>
              <Button variant="outline" size="icon" className={`absolute left-4 top-1/2 -translate-y-1/2 z-30 rounded-full bg-white/80 transition-opacity ${currentSlide === 0 ? 'opacity-0' : 'opacity-100'}`} onClick={(e) => { e.stopPropagation(); prevSlide(); }}><ChevronLeft className="w-6 h-6" /></Button>
              <Button variant="outline" size="icon" className={`absolute right-4 top-1/2 -translate-y-1/2 z-30 rounded-full bg-white/80 transition-opacity ${currentSlide === images.length - 1 ? 'opacity-0' : 'opacity-100'}`} onClick={(e) => { e.stopPropagation(); nextSlide(); }}><ChevronRight className="w-6 h-6" /></Button>
            </>
          )}

          <div className="max-w-4xl mx-auto h-full flex flex-col">
                <div className="mb-6 flex justify-between items-end">
                  <div>
                    <h1 className="text-2xl font-semibold mb-2">{viewMode === 'annotations' ? 'Audit Results' : 'Heatmap'} {images.length > 1 && <span className="text-sm text-muted-foreground ml-3">Screen {currentSlide + 1}/{images.length}</span>}</h1>
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1.5 px-2.5 py-1 bg-red-50 text-red-700 rounded-md border border-red-100"><span className="font-semibold">{stats.critical} Critical</span></span>
                      <span className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md border border-blue-100"><span className="font-semibold">{stats.minor} Minor</span></span>
                    </div>
                  </div>
                </div>
            
            <Card className={`flex-1 p-8 shadow-xl border-slate-200 relative transition-colors ${viewMode === 'heatmap' ? 'bg-slate-900' : 'bg-white'}`}>
              <div className="absolute inset-0 bg-grid-slate-100 opacity-10 pointer-events-none" />
              
              <div 
                ref={scrollContainerRef}
                onScroll={handleScroll}
                className="h-full flex overflow-x-auto snap-x snap-mandatory scrollbar-hide gap-8"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {images.map((img, index) => (
                  <div key={index} className="min-w-full h-full snap-center flex justify-center items-start overflow-visible">
                    <div className="relative max-w-full" style={{ lineHeight: 0 }}>
                      <ImageWithFallback src={img} alt={`Screen ${index + 1}`} className={`max-w-full w-auto h-auto rounded-lg shadow-sm border transition-all duration-700 block ${viewMode === 'heatmap' ? 'opacity-80' : ''}`} onLoad={updateDimensions} />
                      
                      {viewMode === 'heatmap' && currentSlide === index && dimensions.width > 0 && (
                        <HeatmapCanvas annotations={filteredAnnotations} width={dimensions.width} height={dimensions.height} className="absolute inset-0 pointer-events-none rounded-lg transition-opacity animate-in fade-in" />
                      )}

                      {/* Annotation pin overlay - absolutely positioned on top of the image */}
                      {viewMode === 'annotations' && currentSlide === index && (
                        <div className="absolute inset-0 overflow-visible" style={{ pointerEvents: 'none' }}>
                          {filteredAnnotations.map((annotation) => (
                            <div key={annotation.id} style={{ pointerEvents: 'auto' }}>
                              <AnnotationPin
                                annotation={annotation}
                                isSelected={selectedAnnotation === annotation.id}
                                onSelect={(id) => {
                                  setSelectedAnnotation(id);
                                  setSidebarMode('technical');
                                }}
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>

        <Resizable defaultSize={{ width: 384, height: '100%' }} minWidth={320} maxWidth={800} enable={{ left: true }} className="border-l border-slate-200 bg-background shadow-2xl z-40 flex flex-col relative" onClick={(e) => e.stopPropagation()}>
          <div className="flex border-b">
            <button onClick={() => setSidebarMode('technical')} className={`flex-1 py-3 text-xs font-black uppercase tracking-widest ${sidebarMode === 'technical' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'}`}>Technical</button>
            {data.influencerReview && <button onClick={() => setSidebarMode('influencer')} className={`flex-1 py-3 text-xs font-black uppercase tracking-widest ${sidebarMode === 'influencer' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'}`}>Expert</button>}
          </div>

          <div className="flex-1 overflow-hidden flex flex-col">
            {sidebarMode === 'technical' ? (
              <div className="flex-1 flex flex-col h-full">
                <div className="p-6 pb-0">
                  <h2 className="text-lg font-semibold mb-4">Issue Log</h2>
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mb-4">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="all" className="text-[9px] uppercase font-bold">All</TabsTrigger>
                      <TabsTrigger value="visual" className="text-[9px] uppercase font-bold">Visual</TabsTrigger>
                      <TabsTrigger value="business" className="text-[9px] uppercase font-bold">Business</TabsTrigger>
                      <TabsTrigger value="heuristic" className="text-[9px] uppercase font-bold">Heuristic</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
                <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-3">
                  {allFilteredAnnotations.length > 0 ? (
                    allFilteredAnnotations.map((annotation) => (
                      <div
                        key={annotation.id}
                        id={`annotation-${annotation.id}`}
                        className={`group p-4 cursor-pointer rounded-xl border transition-all duration-200 ${getSeverityStyles(annotation.severity, selectedAnnotation === annotation.id)}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedAnnotation(selectedAnnotation === annotation.id ? null : annotation.id);
                          setViewMode('annotations');
                        }}
                      >
                        <div className="flex gap-4">
                          {/* Indicator Column */}
                          <div className="flex flex-col items-center shrink-0">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black text-white shadow-sm ${annotation.severity === 'critical' ? 'bg-red-500' : 'bg-blue-500'}`}>
                              {annotation.id}
                            </div>
                            {selectedAnnotation === annotation.id && (
                              <div className="w-0.5 h-full mt-2 bg-blue-400 rounded-full animate-in fade-in duration-500" />
                            )}
                          </div>

                          {/* Content Column */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/5 px-2 py-0.5 rounded border border-primary/10">
                                {annotation.tag}
                              </span>
                            </div>
                            <h3 className="font-bold text-[14px] text-slate-900 leading-tight mb-3">
                              {annotation.title}
                            </h3>

                            <div className="space-y-3">
                              <div>
                                <span className="block text-[12px] text-slate-400 mb-0.5 lowercase font-medium">issue</span>
                                <p className="text-[12px] text-slate-600 leading-normal">{annotation.current}</p>
                              </div>
                              
                              <div>
                                <span className="block text-[12px] text-green-500/80 mb-0.5 lowercase font-medium text-[rgba(3,107,45,0.8)] font-bold">solution</span>
                                <p className="text-[12px] text-[rgb(0,0,0)] font-bold leading-normal">{annotation.suggested}</p>
                              </div>

                              <div className="pt-2 border-t border-slate-100/50 mt-2 flex justify-end">
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setLearningAnnotation(annotation);
                                  }}
                                  className="text-[12px] text-[rgb(0,102,255)] hover:text-primary transition-colors flex items-center gap-1 group/btn font-[Inter] font-bold"
                                >
                                  learn more
                                  <Sparkles className="w-2.5 h-2.5 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center h-40 text-slate-300">
                      <p className="text-[10px] font-medium uppercase tracking-widest">No issues</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              data.influencerReview && (
                <div className="flex-1 flex flex-col h-full bg-slate-50/50">
                   <div className="px-6 pt-4 pb-2 flex items-center justify-center gap-2">
                     <div className="flex p-1 bg-white border rounded-lg">
                       <button onClick={() => setInfluencerView('review')} className={`px-4 py-1.5 text-xs font-bold rounded-md ${influencerView === 'review' ? 'bg-slate-900 text-white' : 'text-slate-500'}`}>Review</button>
                       <button onClick={() => setInfluencerView('chat')} className={`px-4 py-1.5 text-xs font-bold rounded-md ${influencerView === 'chat' ? 'bg-slate-900 text-white' : 'text-slate-500'}`}>Chat</button>
                     </div>
                   </div>
                   {influencerView === 'review' ? (
                     <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
                        <div className="space-y-4">
                           <h2 className="text-lg font-black">{data.influencerReview.persona}</h2>
                           <div className="bg-white p-5 rounded-2xl border border-slate-100"><p className="text-sm italic">"{data.influencerReview.overallImpression}"</p></div>
                        </div>
                        <div className="space-y-3">
                           <h3 className="text-xs font-black uppercase text-slate-400">Strategic Feedback</h3>
                           {data.influencerReview.strategicFeedback.map((point, i) => (<p key={i} className="text-sm">{point}</p>))}
                        </div>
                     </div>
                   ) : (
                     <div className="flex-1 flex flex-col min-h-0">
                       <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4" ref={chatScrollRef}>
                         {chatMessages.map((msg, i) => (
                           <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                             <div className={`p-3 rounded-2xl max-w-[80%] text-sm ${msg.role === 'user' ? 'bg-slate-900 text-white' : 'bg-white border shadow-sm'}`}>{msg.content as string}</div>
                           </div>
                         ))}
                       </div>
                       <div className="p-4 border-t bg-white flex gap-2">
                         <Input placeholder="Ask..." className="rounded-xl h-10" value={chatInput} onChange={(e) => setChatInput(e.target.value)} disabled={isChatLoading} />
                         <Button size="icon" className="h-10 w-10 bg-slate-900" onClick={handleSendMessage} disabled={!chatInput.trim() || isChatLoading}><Send className="w-4 h-4" /></Button>
                       </div>
                     </div>
                   )}
                </div>
              )
            )}
            <div className="p-6 pt-4 border-t bg-background">
              <Button className="w-full h-11 bg-slate-900 font-bold" onClick={() => onNavigate('report', data)}>
                <Download className="w-4 h-4 mr-2" />
                Download PDF Report
              </Button>
            </div>
          </div>
        </Resizable>
      </div>
      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* Learn More Modal */}
      {learningAnnotation && (
        <div 
          className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/40 backdrop-blur-[2px] p-4 animate-in fade-in duration-300"
          onClick={() => setLearningAnnotation(null)}
        >
          <div 
            className="bg-white flex flex-col items-center overflow-clip relative rounded-[16px] shadow-[0px_20px_24px_-4px_rgba(10,13,18,0.08),0px_8px_8px_-4px_rgba(10,13,18,0.03),0px_3px_3px_-1.5px_rgba(10,13,18,0.04)] w-full max-w-[640px] animate-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Background Pattern Decorative */}
            <div className="absolute left-[-120px] size-[336px] top-[-120px] pointer-events-none opacity-50" data-name="Background pattern decorative">
              <div className="-translate-x-1/2 absolute left-1/2 size-[336px] top-0">
                 <div className="-translate-x-1/2 -translate-y-1/2 absolute left-1/2 size-[336px] top-1/2" style={{ backgroundImage: "url('data:image/svg+xml;utf8,<svg viewBox=\'0 0 336 336\' xmlns=\'http://www.w3.org/2000/svg\' preserveAspectRatio=\'none\'><rect x=\'0\' y=\'0\' height=\'100%\' width=\'100%\' fill=\'url(%23grad)\' opacity=\'1\'/><defs><radialGradient id=\'grad\' gradientUnits=\'userSpaceOnUse\' cx=\'0\' cy=\'0\' r=\'10\' gradientTransform=\'matrix(-0.0000017664 16.8 -16.8 -0.0000027601 168 168)\'><stop stop-color=\'rgba(0,0,0,1)\' offset=\'0\'/><stop stop-color=\'rgba(0,0,0,0)\' offset=\'1\'/></radialGradient></defs></svg>')" }} />
              </div>
              <div className="-translate-x-1/2 absolute left-1/2 size-[336px] top-0">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 336 336">
                  <g opacity="0.4">
                    <circle cx="168" cy="168" r="47.5" stroke="#E9EAEB" />
                    <circle cx="168" cy="168" r="71.5" stroke="#E9EAEB" />
                    <circle cx="168" cy="168" r="95.5" stroke="#E9EAEB" />
                    <circle cx="168" cy="168" r="119.5" stroke="#E9EAEB" />
                    <circle cx="168" cy="168" r="143.5" stroke="#E9EAEB" />
                    <circle cx="168" cy="168" r="167.5" stroke="#E9EAEB" />
                  </g>
                </svg>
              </div>
            </div>

            <div className="w-full relative">
              {/* Header */}
              <div className="pt-6 px-6 relative flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <div className="relative size-[48px] shrink-0">
                    <div className="bg-[#f9f5ff] rounded-[9999px] size-full flex items-center justify-center">
                       <svg className="size-[24px]" fill="none" preserveAspectRatio="none" viewBox="0 0 44 44">
                        <g>
                          <path d="M13.7646 2.75C17.4097 2.75027 20.8665 6.41699 24.5116 6.41699H31.2002C35.6805 6.41699 37.9206 6.41713 39.6318 7.28906C41.1371 8.05605 42.361 9.2799 43.1279 10.7852C43.9997 12.4964 44 14.7366 44 19.2168V28.4502C44 32.9305 43.9999 35.1706 43.1279 36.8818C42.3609 38.3871 41.1371 39.6109 39.6318 40.3779C37.9206 41.2499 35.6805 41.25 31.2002 41.25H12.7998C8.31953 41.25 6.07943 41.2499 4.36816 40.3779C2.86287 39.6109 1.63906 38.3871 0.87207 36.8818C0.000145069 35.1706 1.84194e-10 32.9305 0 28.4502V19.2168C0 18.8255 0.000395523 18.4511 0.000976562 18.0928C0.000647059 18.0743 0 18.0556 0 18.0371V10.75C2.38773e-07 6.33172 3.58172 2.75 8 2.75H13.7646Z" fill="#7F56D9" />
                          <path d="M3 14C3 11.7909 4.79086 10 7 10H37C39.2091 10 41 11.7909 41 14V34C41 36.2091 39.2091 38 37 38H7C4.79086 38 3 36.2091 3 34V14Z" fill="white" />
                        </g>
                      </svg>
                    </div>
                  </div>
                  <button onClick={() => setLearningAnnotation(null)} className="p-2 rounded-lg hover:bg-slate-50 text-slate-400 transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex flex-col gap-[2px]">
                  <p className="font-semibold text-[#181d27] text-[18px]">{learningAnnotation.title}</p>
                  <p className="text-[#535862] text-[14px]">Comprehensive analysis for design audit #snap-{learningAnnotation.id}</p>
                </div>

                {/* Horizontal Tabs */}
                <div className="relative mt-2">
                  <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-[#e9eaeb]" />
                  <div className="flex gap-4 relative">
                    <button 
                      onClick={() => setModalTab('analysis')}
                      className={`h-[36px] px-1 relative transition-all ${modalTab === 'analysis' ? 'text-black font-bold' : 'text-[#717680] font-semibold'}`}
                    >
                      Analysis
                      {modalTab === 'analysis' && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-black" />}
                    </button>
                    <button 
                      onClick={() => setModalTab('insights')}
                      className={`h-[36px] px-1 relative transition-all ${modalTab === 'insights' ? 'text-black font-bold' : 'text-[#717680] font-semibold'}`}
                    >
                      Insights
                      {modalTab === 'insights' && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-black" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Content Container */}
              <div className="p-6">
                <div className="bg-[#f8f8f8] rounded-[15px] p-6 flex flex-col gap-6 min-h-[300px] overflow-y-auto max-h-[50vh] scrollbar-hide">
                  {modalTab === 'analysis' ? (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <div className="flex flex-col gap-6">
                        <div className="flex flex-col gap-2">
                           <p className="text-[#181d27] font-semibold text-[15px]">Detailed Observation</p>
                           <p className="text-[14px] text-[#535862] leading-[24px] font-normal">
                             {learningAnnotation.current} This observation was flagged due to its potential impact on the overall user experience and interface consistency. Our analysis indicates that users may encounter friction when interacting with this specific component in its current state.
                           </p>
                        </div>
                        
                        <div className="flex flex-col gap-2 p-5 bg-[#DCFAE6]/30 border border-[#DCFAE6] rounded-2xl">
                           <p className="text-[#079455] font-bold text-[15px] flex items-center gap-2">
                             <Check className="size-4" />
                             Expert Recommendation
                           </p>
                           <p className="text-[14px] text-[rgb(18,18,18)] leading-[24px] font-semibold">
                             {learningAnnotation.suggested} By implementing this fix, you align the interface with industry-standard patterns, thereby reducing cognitive load and improving task completion efficiency for all user segments.
                           </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <div className="flex flex-col gap-8">
                        <div className="flex flex-col gap-3">
                           <p className="text-[#181d27] font-semibold text-[15px] flex items-center gap-2">
                             <Sparkles className="size-4 text-purple-600" />
                             Strategic Business Impact
                           </p>
                           <p className="text-[14px] text-[#535862] leading-[24px] font-normal italic">
                             "{learningAnnotation.impact || "Addressing this specific friction point is critical for maintaining session momentum and preventing user drop-off at key decision stages. Historically, improvements in this area lead to a 12-15% increase in conversion through these specific user flows."}"
                           </p>
                        </div>

                        <div className="flex flex-col gap-3 p-5 bg-white border border-slate-200 rounded-2xl shadow-sm">
                           <p className="text-[#181d27] font-semibold text-[15px] flex items-center gap-2">
                             <Lightbulb className="size-4 text-blue-600" />
                             Behavioral Psychology
                           </p>
                           <p className="text-[14px] text-[#535862] leading-[24px] font-normal">
                             {getPsychologyInfo(learningAnnotation.type)} This psychological principle is fundamental to how humans process visual information and make rapid decisions. Neglecting this often leads to "frustration clicks" and premature session termination.
                           </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const getPsychologyInfo = (type: string) => {
  switch (type) {
    case 'accessibility':
      return "Users with disabilities often rely on consistent patterns. Violating these causes immediate cognitive overload and exclusion, damaging trust in the brand's inclusivity.";
    case 'usability':
      return "Hick's Law suggests that complexity increases reaction time. By simplifying this interaction, you reduce the mental effort required, making the user feel more in control.";
    case 'visual':
      return "The Von Restorff effect predicts that distinct items are more easily remembered. However, lack of hierarchy causes 'visual noise' where the user cannot prioritize information.";
    case 'marketing':
      return "Social proof and urgency triggers act on the amygdala. Without clear value propositions, users default to skepticism and are less likely to commit to an action.";
    default:
      return "Consistency creates comfort. When elements behave as expected, users develop muscle memory, which leads to a more 'invisible' and seamless product experience.";
  }
}