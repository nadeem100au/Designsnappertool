import { useState, useCallback, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Progress } from './ui/progress';
import {
  Plus,
  ArrowLeft,
  FileImage,
  Loader2,
  AlertCircle,
  Sparkles,
  X,
  Zap,
  Layout,
  MousePointer2,
  CheckCircle2,
  Crown,
  Trash2,
  ArrowUp,
  ArrowDown,
  GripVertical,
  ChevronRight,
  Target,
  Search,
  Check
} from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { analyzeScreenshotWithAI } from '../utils/aiAnalysis';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { toast } from 'sonner@2.0.3';
import { projectId, publicAnonKey } from '../utils/supabase/info';

import chrisDoImg from 'figma:asset/f06118d2873dad45c5862ba420d01cbfc1b6e927.png';
import donNormanImg from 'figma:asset/2c130bc4e84408a24324181660b0d33e0e461f40.png';
import anshMehraImg from 'figma:asset/0b0022503fc01a7977e278727191af5710a70b00.png';

// Persona Images
const PERSONA_IMAGES = {
  'chris-do': chrisDoImg,
  'don-norman': donNormanImg,
  'ansh-mehra': anshMehraImg
};

interface UploadPageProps {
  onNavigate: (screen: string, data?: any) => void;
  data?: any;
  session?: any; // strict typing would be Session | null but let's use any for now or import Session
  onSignOut?: () => void;
}

const ItemType = {
  IMAGE: 'image',
};

interface DraggableImageProps {
  id: string;
  img: string;
  index: number;
  moveImage: (dragIndex: number, hoverIndex: number) => void;
  removeImage: (index: number) => void;
}

function DraggableImage({ id, img, index, moveImage, removeImage }: DraggableImageProps) {
  const ref = useRef<HTMLDivElement>(null);

  const [, drop] = useDrop({
    accept: ItemType.IMAGE,
    hover(item: { index: number }, monitor) {
      if (!ref.current) return;
      const dragIndex = item.index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) return;

      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = clientOffset!.y - hoverBoundingRect.top;

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;

      moveImage(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: ItemType.IMAGE,
    item: { id, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  drag(drop(ref));

  return (
    <div
      ref={ref}
      style={{ opacity: isDragging ? 0.4 : 1 }}
      className="group relative flex items-center gap-4 p-3 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-white hover:shadow-md transition-all cursor-move"
    >
      <div className="flex items-center gap-2">
        <GripVertical className="w-4 h-4 text-slate-300 group-hover:text-slate-500" />
        <div className="w-8 h-8 flex items-center justify-center bg-white rounded-lg border border-slate-200 font-bold text-slate-400 text-xs shadow-sm">
          {index + 1}
        </div>
      </div>

      <div className="w-20 h-14 rounded-lg overflow-hidden border border-slate-200 bg-white relative">
        <ImageWithFallback src={img} alt={`Screen ${index + 1}`} className="w-full h-full object-cover" />
      </div>

      <div className="flex-1">
        <p className="text-sm font-bold text-slate-700">Screen {index + 1}</p>
        <p className="text-xs text-slate-400 font-medium">Drag to reorder</p>
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-red-300 hover:text-red-600 hover:bg-red-50"
          onClick={() => removeImage(index)}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

const CRITERIA_FRAMEWORK = {
  visual: {
    title: 'Visual UI Design',
    icon: <Layout className="w-4 h-4" />,
    items: ['Hierarchy', 'Consistency', 'Spacing', 'Contrast', 'Balance']
  },
  business: {
    title: 'Business Impact',
    icon: <Target className="w-4 h-4" />,
    items: ['Conversion', 'Clarity (Value Prop)', 'Trust', 'Efficiency (Flow)', 'Differentiation']
  },
  heuristic: {
    title: 'Heuristic Evaluation',
    icon: <Search className="w-4 h-4" />,
    items: ['Visibility (Status)', 'Prevention (Errors)', 'Control (Freedom)', 'Recognition', 'Feedback']
  }
};

import { UserProfileMenu } from './UserProfileMenu';

export function UploadPage({ onNavigate, data, session, onSignOut }: UploadPageProps) {
  const [currentStep, setCurrentStep] = useState<'upload' | 'criteria'>('upload');
  const [isDragOver, setIsDragOver] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadedImages, setUploadedImages] = useState<string[]>(
    data?.image ? [data.image] : (data?.images || [])
  );
  const [analysisContext, setAnalysisContext] = useState<string>(data?.context || '');
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisMode, setAnalysisMode] = useState<'technical-only' | 'with-influencer'>(data?.mode || 'technical-only');
  const [selectedPersona, setSelectedPersona] = useState<string>(data?.selectedPersona || 'chris-do');

  const [selectedCriteria, setSelectedCriteria] = useState<{
    visual: string[];
    business: string[];
    heuristic: string[];
  }>({
    visual: ['Hierarchy', 'Consistency', 'Spacing', 'Contrast', 'Balance'],
    business: ['Conversion', 'Clarity', 'Trust', 'Efficiency', 'Differentiation'],
    heuristic: ['Visibility', 'Prevention', 'Control', 'Recognition', 'Feedback']
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleCriterion = (category: 'visual' | 'business' | 'heuristic', criterion: string) => {
    setSelectedCriteria(prev => {
      const current = prev[category];
      const next = current.includes(criterion)
        ? current.filter(c => c !== criterion)
        : [...current, criterion];
      return { ...prev, [category]: next };
    });
  };

  const processFiles = useCallback((files: File[]) => {
    const validFiles = files.filter(file => file.type.startsWith('image/'));

    if (validFiles.length > 0) {
      setIsImageLoading(true);

      const filePromises = validFiles.map(file => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.onerror = () => resolve('');
          reader.readAsDataURL(file);
        });
      });

      Promise.all(filePromises).then(newImages => {
        setUploadedImages(prev => [...prev, ...newImages.filter(img => img !== '')]);
        setIsImageLoading(false);
        toast.success(`Successfully added ${newImages.length} design frame${newImages.length > 1 ? 's' : ''}`);
      });
    }
  }, []);

  const handlePaste = useCallback((e: ClipboardEvent) => {
    const items = e.clipboardData?.items;
    const files = e.clipboardData?.files;

    if (files && files.length > 0) {
      processFiles(Array.from(files));
      return;
    }

    if (!items) return;

    const imageFiles: File[] = [];
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) imageFiles.push(file);
      }
    }

    if (imageFiles.length > 0) {
      processFiles(imageFiles);
      return;
    }

    // Handle Figma Plugin specific cases: Data URLs in text or HTML
    const text = e.clipboardData?.getData('text/plain');
    if (text && (text.startsWith('data:image/') || text.startsWith('http'))) {
      if (text.startsWith('data:image/')) {
        setUploadedImages(prev => [...prev, text]);
        toast.success("Design frame pasted from clipboard");
        return;
      }
    }

    const html = e.clipboardData?.getData('text/html');
    if (html && html.includes('<img')) {
      const match = html.match(/src="([^"]+)"/);
      if (match && (match[1].startsWith('data:image/') || match[1].startsWith('http'))) {
        setUploadedImages(prev => [...prev, match[1]]);
        toast.success("Design frame pasted from clipboard");
      }
    }
  }, [processFiles]);

  useEffect(() => {
    const checkPluginUpload = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const uploadId = urlParams.get('uploadId');
      const imageUrl = urlParams.get('imageUrl');

      if (imageUrl) {
        setIsImageLoading(true);
        try {
          // Fetch the S3 image and convert to data URL to avoid cross-origin canvas taint
          const response = await fetch(imageUrl);
          const blob = await response.blob();
          const dataUrl = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
          setUploadedImages(prev => [...prev, dataUrl]);
          toast.success("Design imported from Figma plugin");

          // Clean URL
          const newUrl = window.location.pathname;
          window.history.replaceState({}, '', newUrl);
        } catch (e) {
          console.error("Failed to load image from URL:", e);
          toast.error("Failed to load image from Figma. Please try uploading manually.");
        } finally {
          setIsImageLoading(false);
        }
      } else if (uploadId) {
        setIsImageLoading(true);
        try {
          const response = await fetch(
            `https://${projectId}.supabase.co/functions/v1/make-server-cdc57b20/plugin-upload/${uploadId}`,
            {
              headers: {
                'Authorization': `Bearer ${publicAnonKey}`
              }
            }
          );

          if (response.ok) {
            const data = await response.json();
            if (data.image) {
              setUploadedImages(prev => [...prev, data.image]);
              toast.success("Design imported from Figma plugin");

              // Clean URL
              const newUrl = window.location.pathname;
              window.history.replaceState({}, '', newUrl);
            }
          }
        } catch (e) {
          console.error("Failed to fetch plugin upload:", e);
        } finally {
          setIsImageLoading(false);
        }
      }
    };
    useEffect(() => {
      checkPluginUpload();
    }, []);

    const onPaste = (e: any) => handlePaste(e);
    document.addEventListener('paste', onPaste);
    return () => document.removeEventListener('paste', onPaste);
  }, [handlePaste]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
  }, [processFiles]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      processFiles(files);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const moveImageDnd = useCallback((dragIndex: number, hoverIndex: number) => {
    setUploadedImages((prev) => {
      const newImages = [...prev];
      const dragItem = newImages[dragIndex];
      newImages.splice(dragIndex, 1);
      newImages.splice(hoverIndex, 0, dragItem);
      return newImages;
    });
  }, []);

  const stitchImages = async (images: string[]): Promise<{ dataUrl: string; heights: number[]; widths: number[]; width: number }> => {
    if (images.length === 0) return { dataUrl: '', heights: [], widths: [], width: 0 };

    // Load all images
    const imageObjects = await Promise.all(images.map(src => {
      return new Promise<HTMLImageElement>((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.src = src;
      });
    }));

    // Calculate dimensions
    const heights = imageObjects.map(img => img.height);
    const widths = imageObjects.map(img => img.width);
    const totalHeight = heights.reduce((sum, h) => sum + h, 0);
    const maxWidth = Math.max(...widths);

    // Create canvas
    const canvas = document.createElement('canvas');
    canvas.width = maxWidth;
    canvas.height = totalHeight;
    const ctx = canvas.getContext('2d');

    if (!ctx) return { dataUrl: images[0], heights, widths, width: maxWidth };

    // Fill white background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw images
    let currentY = 0;
    imageObjects.forEach(img => {
      const x = (maxWidth - img.width) / 2;
      ctx.drawImage(img, x, currentY);
      currentY += img.height;
    });

    return {
      dataUrl: canvas.toDataURL('image/jpeg', 0.85),
      heights,
      widths,
      width: maxWidth
    };
  };

  const downsampleImage = (dataUrl: string, maxWidth: number, maxHeight: number = 7500): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Scale by width
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        // Scale by height (important for long stitched flows)
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);
        }
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    });
  };

  const startAnalysis = async () => {
    if (uploadedImages.length === 0) return;

    setIsAnalyzing(true);
    setProgress(0);
    setError(null);

    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) return 95;
        const increment = Math.random() * 8;
        return Math.min(95, prev + increment);
      });
    }, 500);

    try {
      // 1. Stitch images
      const { dataUrl: stitchedImage, heights, widths, width: stitchedWidth } = await stitchImages(uploadedImages);

      // 2. Downsample for AI processing
      const processedImage = await downsampleImage(stitchedImage, 1200, 7500);

      const result = await analyzeScreenshotWithAI(
        processedImage,
        analysisContext,
        {
          mode: analysisMode,
          influencerPersona: analysisMode === 'with-influencer' ? selectedPersona : undefined,
          testCriteria: selectedCriteria
        }
      );

      clearInterval(progressInterval);
      setProgress(100);

      const analysisData = {
        screenshot: stitchedImage,
        images: uploadedImages,
        imageHeights: heights,
        imageWidths: widths,
        stitchedWidth: stitchedWidth,
        annotations: result.annotations,
        designType: result.designType,
        analysisMode: result.mode,
        influencerReview: result.influencerReview
      };

      setTimeout(() => {
        setIsAnalyzing(false);
        onNavigate('dashboard', analysisData);
      }, 800);

    } catch (error: any) {
      console.error('Analysis error:', error);
      clearInterval(progressInterval);
      setProgress(0);
      setIsAnalyzing(false);
      setError(error.message || 'The analysis failed. Please check your API key and try again.');
    }
  };

  const handleContinue = () => {
    if (uploadedImages.length > 0) {
      setCurrentStep('criteria');
    }
  };

  const isCriteriaValid = () => {
    return selectedCriteria.visual.length > 0 ||
      selectedCriteria.business.length > 0 ||
      selectedCriteria.heuristic.length > 0;
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-[#FDFDFD] selection:bg-primary/10">
        <nav className="border-b border-slate-100 bg-white/80 backdrop-blur-xl sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
            <Button
              variant="ghost"
              onClick={() => {
                if (currentStep === 'criteria') setCurrentStep('upload');
                else onNavigate('landing');
              }}
              className="flex items-center gap-2 text-slate-500 hover:text-slate-900"
            >
              <ArrowLeft className="w-4 h-4" />
              {currentStep === 'criteria' ? 'Back to Upload' : 'Back to Home'}
            </Button>
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2">
                <div className="w-8 h-8 bg-slate-900 rounded-[10px] flex items-center justify-center shadow-lg">
                  <Zap className="w-4.5 h-4.5 text-white" />
                </div>
                <span className="font-black text-lg tracking-tighter uppercase italic">Snapper.</span>
              </div>
              <UserProfileMenu session={session} onSignOut={onSignOut} onNavigate={onNavigate} />
            </div>
          </div>
        </nav>

        <div className="max-w-4xl mx-auto px-6 py-16">
          {!isAnalyzing ? (
            <div className="flex flex-col items-center">
              {currentStep === 'upload' ? (
                <>
                  <div className="text-center mb-12 space-y-4">
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                      New Design Audit
                    </h1>
                    <p className="text-lg text-slate-500 font-medium max-w-xl mx-auto">
                      Attach your design flow (one or more screens) and select your audit engine.
                    </p>
                  </div>

                  <div
                    className={`w-full max-w-2xl bg-white border-2 rounded-[32px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] transition-all duration-300 p-8 flex flex-col gap-8 ${isDragOver ? 'border-primary border-dashed bg-primary/[0.02]' : 'border-slate-100'
                      }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">1. Upload Design Flow</h3>
                        {uploadedImages.length > 0 && (
                          <span className="text-xs font-bold text-green-600 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            {uploadedImages.length} Screen{uploadedImages.length !== 1 ? 's' : ''}
                          </span>
                        )}
                      </div>

                      {uploadedImages.length > 0 ? (
                        <div className="space-y-3">
                          <div className="grid grid-cols-1 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                            {uploadedImages.map((img, index) => (
                              <DraggableImage
                                key={`img-${index}`}
                                id={`img-${index}`}
                                img={img}
                                index={index}
                                moveImage={moveImageDnd}
                                removeImage={removeImage}
                              />
                            ))}
                          </div>

                          <Button
                            variant="outline"
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full h-12 border-dashed border-2 border-slate-200 text-slate-500 hover:text-slate-700 hover:border-slate-300 gap-2"
                          >
                            <Plus className="w-4 h-4" />
                            Add Another Screen
                          </Button>
                        </div>
                      ) : (
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          className="border-2 border-dashed border-slate-200 rounded-2xl p-10 flex flex-col items-center justify-center gap-4 hover:border-slate-400 hover:bg-slate-50 transition-all cursor-pointer group"
                        >
                          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Plus className="w-6 h-6 text-slate-400" />
                          </div>
                          <p className="text-sm font-medium text-slate-500">Click or drag screenshots here</p>
                          <p className="text-xs text-slate-400">Supports single images or full user flows</p>
                        </div>
                      )}
                      <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        multiple
                        onChange={handleFileSelect}
                      />
                    </div>

                    <div className="h-px bg-slate-100 w-full" />

                    <div className="space-y-6">
                      <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">2. Select Analysis Mode</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div
                          onClick={() => setAnalysisMode('technical-only')}
                          className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${analysisMode === 'technical-only' ? 'border-slate-900 bg-slate-50' : 'border-slate-100 hover:border-slate-300'
                            }`}
                        >
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 rounded-lg bg-slate-200 flex items-center justify-center">
                              <Zap className="w-4 h-4 text-slate-700" />
                            </div>
                            <span className="font-bold text-slate-900">Technical Audit</span>
                          </div>
                          <p className="text-xs text-slate-500 leading-relaxed pl-11">
                            Objective WCAG & UX best practices check. Fast and precise.
                          </p>
                        </div>

                        <div
                          onClick={() => setAnalysisMode('with-influencer')}
                          className={`p-4 rounded-xl border-2 cursor-pointer transition-all relative overflow-hidden ${analysisMode === 'with-influencer' ? 'border-primary bg-primary/5' : 'border-slate-100 hover:border-slate-300'
                            }`}
                        >
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center text-white">
                              <Crown className="w-4 h-4" />
                            </div>
                            <span className="font-bold text-slate-900">Influencer Review</span>
                          </div>
                          <p className="text-xs text-slate-500 leading-relaxed pl-11">
                            Technical audit + strategic feedback from an AI persona.
                          </p>
                        </div>
                      </div>
                    </div>

                    {analysisMode === 'with-influencer' && (
                      <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">3. Choose Your Expert</h3>
                          <Button variant="ghost" size="sm" className="text-xs font-bold text-slate-500 hover:text-primary" onClick={() => onNavigate('influencer-library', { image: uploadedImages[0], images: uploadedImages, mode: analysisMode, context: analysisContext, selectedPersona })}>
                            View All
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          {[
                            { id: 'chris-do', name: 'Chris Do', role: 'Business Strategy', image: PERSONA_IMAGES['chris-do'] },
                            { id: 'don-norman', name: 'Don Norman', role: 'Cognitive Science', image: PERSONA_IMAGES['don-norman'] },
                            { id: 'ansh-mehra', name: 'Ansh Mehra', role: 'Visual Storytelling', image: PERSONA_IMAGES['ansh-mehra'] }
                          ].map((persona) => (
                            <div key={persona.id} onClick={() => setSelectedPersona(persona.id)} className={`relative p-3 rounded-xl border-2 cursor-pointer transition-all flex flex-col gap-3 ${selectedPersona === persona.id ? 'border-primary bg-primary/5 shadow-md scale-[1.02]' : 'border-slate-100 hover:border-slate-200 bg-white'}`}>
                              <div className="w-full aspect-[4/3] rounded-lg overflow-hidden bg-slate-100 relative">
                                <ImageWithFallback src={persona.image} alt={persona.name} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                <span className="absolute bottom-2 left-2 text-white font-bold text-sm">{persona.name}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">{persona.role}</span>
                                {selectedPersona === persona.id && <CheckCircle2 className="w-4 h-4 text-primary" />}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <Button
                      disabled={uploadedImages.length === 0 || isImageLoading}
                      onClick={handleContinue}
                      className={`h-14 w-full rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3 ${uploadedImages.length > 0 ? 'bg-slate-900 text-white hover:bg-slate-800' : 'bg-slate-100 text-slate-300'}`}
                    >
                      Continue
                      <ChevronRight className="w-5 h-5" />
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-center mb-12 space-y-4">
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                      Custom Test Criteria
                    </h1>
                    <p className="text-lg text-slate-500 font-medium max-w-xl mx-auto">
                      Select the specific dimensions you want the AI to analyze.
                    </p>
                  </div>

                  <div className="w-full max-w-2xl bg-white border-2 border-slate-100 rounded-[32px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] p-8 flex flex-col gap-8">
                    <div className="grid grid-cols-1 gap-8">
                      {Object.entries(CRITERIA_FRAMEWORK).map(([key, section]) => (
                        <div key={key} className="space-y-4">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
                              {section.icon}
                            </div>
                            <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">
                              {section.title}
                            </h3>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {section.items.map((item) => {
                              const isSelected = selectedCriteria[key as keyof typeof selectedCriteria].includes(item);
                              return (
                                <button
                                  key={item}
                                  onClick={() => toggleCriterion(key as any, item)}
                                  className={`relative px-[12px] py-[6px] rounded-[16px] text-[14px] font-medium transition-all flex items-center gap-1.5 bg-white ${isSelected
                                    ? 'text-blue-600 border-[1.5px] border-blue-600 shadow-[0px_1px_2px_0px_rgba(0,102,255,0.05)]'
                                    : 'text-[#535862] border border-[#d5d7da] shadow-[inset_0px_0px_0px_1px_rgba(10,13,18,0.18),inset_0px_-2px_0px_0px_rgba(10,13,18,0.05),0px_1px_2px_0px_rgba(10,13,18,0.05)] hover:border-slate-300'
                                    }`}
                                >
                                  {isSelected && <Check className="w-3.5 h-3.5 stroke-[2.5px]" />}
                                  {item}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="h-px bg-slate-100 w-full" />

                    <div className="space-y-3">
                      <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">
                        Additional Context (Optional)
                      </h3>
                      <textarea
                        className="w-full h-24 p-4 text-sm font-medium text-slate-900 placeholder:text-slate-400 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                        placeholder="Any specific goals or concerns?"
                        value={analysisContext}
                        onChange={(e) => setAnalysisContext(e.target.value)}
                      />
                    </div>

                    <div className="flex gap-4">
                      <Button
                        variant="outline"
                        onClick={() => setCurrentStep('upload')}
                        className="h-14 flex-1 rounded-2xl font-black uppercase tracking-widest text-sm border-2"
                      >
                        Back
                      </Button>
                      <Button
                        disabled={!isCriteriaValid()}
                        onClick={startAnalysis}
                        className={`h-14 flex-[2] rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3 ${isCriteriaValid() ? 'bg-slate-900 text-white hover:bg-slate-800' : 'bg-slate-100 text-slate-300'}`}
                      >
                        <Zap className="w-5 h-5 fill-current" />
                        Run Audit
                      </Button>
                    </div>
                  </div>
                </>
              )}

              {error && (
                <div className="mt-6 w-full max-w-2xl animate-in fade-in zoom-in duration-300">
                  <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    <p className="text-sm font-bold text-red-600">{error}</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center min-h-[400px] animate-in fade-in duration-700">
              <div className="w-full max-w-xl space-y-12">
                <div className="text-center space-y-4">
                  <div className="relative w-24 h-24 mx-auto mb-8">
                    <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
                    <div className="relative w-full h-full bg-white border-2 border-slate-100 rounded-3xl flex items-center justify-center shadow-2xl overflow-hidden">
                      <ImageWithFallback src={uploadedImages[0]} alt="Analyzing" className="w-full h-full object-cover opacity-20" />
                      <Loader2 className="absolute w-8 h-8 animate-spin text-primary" />
                    </div>
                  </div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight">Vision Engine Analysis</h2>
                  <p className="text-slate-500 font-medium">Scanning based on {Object.values(selectedCriteria).flat().length} criteria...</p>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-end mb-1">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Processing</span>
                    <span className="text-sm font-black text-slate-900">{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }} />
                  </Progress>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DndProvider>
  );
}
