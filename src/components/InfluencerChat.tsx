import { useState, useRef, useEffect, useCallback } from 'react';
import { ArrowLeft, Send, Sparkles, Zap, ImagePlus, X, ExternalLink, BookOpen, Youtube, Megaphone, Library, Plus, Trash2, Link, Globe } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { toast } from "sonner@2.0.3";
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Logo } from './Logo';

import chrisDoImg from 'figma:asset/f06118d2873dad45c5862ba420d01cbfc1b6e927.png';
import donNormanImg from 'figma:asset/2c130bc4e84408a24324181660b0d33e0e461f40.png';
import anshMehraImg from 'figma:asset/0b0022503fc01a7977e278727191af5710a70b00.png';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  image?: string;
}

interface InfluencerChatProps {
  onNavigate: (screen: string, data?: any) => void;
  initialPersonaId?: string;
  data?: any;
}

export interface KnowledgeItem {
  id: string;
  type: 'youtube' | 'linkedin' | 'article' | 'book' | 'twitter' | 'other';
  title: string;
  url: string;
  description?: string;
  isSeeded?: boolean; // true for pre-loaded content
}

// ── Pre-seeded real knowledge for each persona ────────────────────────
const SEEDED_KNOWLEDGE: Record<string, KnowledgeItem[]> = {
  'chris-do': [
    { id: 'cd-1', type: 'youtube', title: 'The Futur — Main Channel', url: 'https://www.youtube.com/@thefutur', description: '2M+ subscribers. Business strategy for creatives', isSeeded: true },
    { id: 'cd-2', type: 'youtube', title: 'Chris Do — Personal Channel', url: 'https://www.youtube.com/@thechrisdo', description: 'Personal insights, agency scaling, and mindset', isSeeded: true },
    { id: 'cd-3', type: 'linkedin', title: 'Chris Do on LinkedIn', url: 'https://www.linkedin.com/in/thechrisdo/', description: 'Daily business & branding insights', isSeeded: true },
    { id: 'cd-4', type: 'book', title: 'Pocket Full of Do', url: 'https://thefutur.com/pocket-full-of-do', description: 'Inspirational pocket book on creativity and hustle', isSeeded: true },
    { id: 'cd-5', type: 'twitter', title: '@theChrisDo on Twitter/X', url: 'https://twitter.com/theChrisDo', description: 'Quick design business tips and hot takes', isSeeded: true },
    { id: 'cd-6', type: 'article', title: 'The Futur Website', url: 'https://thefutur.com/', description: 'Courses and resources for creative professionals', isSeeded: true },
  ],
  'don-norman': [
    { id: 'dn-1', type: 'book', title: 'The Design of Everyday Things', url: 'https://www.amazon.com/Design-Everyday-Things-Revised-Expanded/dp/0465050654', description: 'The definitive guide to human-centered design', isSeeded: true },
    { id: 'dn-2', type: 'book', title: 'Emotional Design', url: 'https://www.amazon.com/Emotional-Design-Love-Everyday-Things/dp/0465051367', description: 'Why we love (or hate) everyday things', isSeeded: true },
    { id: 'dn-3', type: 'youtube', title: 'Nielsen Norman Group on YouTube', url: 'https://www.youtube.com/@NNgroup', description: 'Research-based UX guidance and insights', isSeeded: true },
    { id: 'dn-4', type: 'article', title: 'Nielsen Norman Group Website', url: 'https://www.nngroup.com/', description: 'World leaders in research-based UX', isSeeded: true },
    { id: 'dn-5', type: 'linkedin', title: 'Don Norman on LinkedIn', url: 'https://www.linkedin.com/in/donnorman/', description: 'Thoughts on design, technology, and cognition', isSeeded: true },
    { id: 'dn-6', type: 'article', title: 'JND.org - Don Norman\'s Website', url: 'https://jnd.org/', description: 'Articles, essays, and core principles', isSeeded: true },
  ],
  'ansh-mehra': [
    { id: 'am-1', type: 'youtube', title: 'The Cutting Edge School — YouTube', url: 'https://www.youtube.com/@CuttingEdgeSchool', description: 'UX/UI design tutorials and AI storytelling', isSeeded: true },
    { id: 'am-2', type: 'linkedin', title: 'Ansh Mehra on LinkedIn', url: 'https://www.linkedin.com/in/anshmehra24/', description: 'UX design insights and career tips', isSeeded: true },
    { id: 'am-3', type: 'article', title: 'Ansh Mehra Personal Website', url: 'https://anshmehra.com/', description: 'Portfolio, case studies, and resources', isSeeded: true },
    { id: 'am-4', type: 'article', title: 'How To Prompt', url: 'https://howtoprompt.in/', description: 'Free AI Prompting Masterclass & Guides', isSeeded: true },
    { id: 'am-5', type: 'other', title: 'Ansh Mehra on Instagram', url: 'https://www.instagram.com/anshmehra.in/', description: 'Behind the scenes and building in public', isSeeded: true },
  ],
};

const PERSONA_DATA: Record<string, {
  name: string;
  role: string;
  color: string;
  gradient: string;
  image: string;
  bio: string;
  starters: string[];
  promo: { type: 'book' | 'youtube' | 'campaign'; label: string; description: string; url: string };
}> = {
  'chris-do': {
    name: 'Chris Do',
    role: 'Business Strategy & Branding',
    color: 'bg-slate-900',
    gradient: 'from-slate-900 to-slate-700',
    image: chrisDoImg,
    bio: 'CEO of The Futur. World-renowned designer, business coach, and Emmy-award winning creative director.',
    starters: [
      "How do I price my design services?",
      "What makes this landing page sell?",
      "Is my value proposition clear enough?",
    ],
    promo: { type: 'youtube', label: 'The Futur on YouTube', description: '2M+ subscribers — Business strategy for creatives', url: 'https://www.youtube.com/@thefutur' }
  },
  'don-norman': {
    name: 'Don Norman',
    role: 'Cognitive Science & UX',
    color: 'bg-blue-700',
    gradient: 'from-blue-800 to-blue-600',
    image: donNormanImg,
    bio: 'Author of "The Design of Everyday Things." The founding father of user-centered design and cognitive engineering.',
    starters: [
      "What usability issues do you see here?",
      "Is this interface intuitive for new users?",
      "Apply your 7 design principles to my UI.",
    ],
    promo: { type: 'book', label: 'The Design of Everyday Things', description: 'The definitive guide to human-centered design', url: 'https://www.amazon.com/Design-Everyday-Things-Revised-Expanded/dp/0465050654' }
  },
  'ansh-mehra': {
    name: 'Ansh Mehra',
    role: 'UX Storytelling & Visual Design',
    color: 'bg-violet-600',
    gradient: 'from-violet-700 to-fuchsia-600',
    image: anshMehraImg,
    bio: 'Leading UX educator and storyteller. Known for teaching premium UI design, visual narratives, and portfolio excellence.',
    starters: [
      "Does my design tell a story?",
      "How can I make this feel more premium?",
      "Rate my visual hierarchy out of 10.",
    ],
    promo: { type: 'campaign', label: 'UX Design Masterclass', description: 'Learn premium UI design from scratch', url: 'https://www.youtube.com/@anshmehra' }
  }
};

// ── Helpers for localStorage persistence ──────────────────────────────
const getStorageKey = (personaId: string) => `ds_kb_${personaId}`;

const loadUserKnowledge = (personaId: string): KnowledgeItem[] => {
  try {
    const raw = localStorage.getItem(getStorageKey(personaId));
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
};

const saveUserKnowledge = (personaId: string, items: KnowledgeItem[]) => {
  localStorage.setItem(getStorageKey(personaId), JSON.stringify(items));
};

// ── Type icon helper ──────────────────────────────────────────────────
const TypeIcon = ({ type }: { type: string }) => {
  switch (type) {
    case 'youtube': return <Youtube className="w-4 h-4 text-red-500" />;
    case 'linkedin': return <Globe className="w-4 h-4 text-blue-600" />;
    case 'book': return <BookOpen className="w-4 h-4 text-amber-600" />;
    case 'twitter': return <Globe className="w-4 h-4 text-sky-500" />;
    case 'article': return <Globe className="w-4 h-4 text-green-600" />;
    default: return <Link className="w-4 h-4 text-slate-500" />;
  }
};

const TYPE_LABELS: Record<string, string> = {
  youtube: 'YouTube', linkedin: 'LinkedIn', book: 'Book', twitter: 'Twitter/X', article: 'Article', other: 'Link'
};

// ══════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════════

export function InfluencerChat({ onNavigate, initialPersonaId = 'chris-do', data }: InfluencerChatProps) {
  const [activePersona, setActivePersona] = useState(initialPersonaId);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [showKnowledgeBase, setShowKnowledgeBase] = useState(false);
  const [userKnowledge, setUserKnowledge] = useState<KnowledgeItem[]>([]);
  const [newUrl, setNewUrl] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<KnowledgeItem['type']>('youtube');
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const persona = PERSONA_DATA[activePersona] || PERSONA_DATA['chris-do'];
  const seededKnowledge = SEEDED_KNOWLEDGE[activePersona] || [];
  const allKnowledge = [...seededKnowledge, ...userKnowledge];

  // Load user knowledge on persona change
  useEffect(() => {
    setUserKnowledge(loadUserKnowledge(activePersona));
  }, [activePersona]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isLoading]);

  const switchPersona = (id: string) => {
    if (id === activePersona) return;
    setActivePersona(id);
    setMessages([]);
    setInput('');
    setAttachedImage(null);
    setShowKnowledgeBase(false);
  };

  const handleImageUpload = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => { setAttachedImage(e.target?.result as string); toast.success('Screenshot attached.'); };
    reader.readAsDataURL(file);
  }, []);

  const handlePaste = useCallback((e: ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith('image/')) {
        const file = items[i].getAsFile();
        if (file) {
          const reader = new FileReader();
          reader.onload = (ev) => { setAttachedImage(ev.target?.result as string); toast.success('Screenshot pasted.'); };
          reader.readAsDataURL(file);
        }
        break;
      }
    }
  }, []);

  useEffect(() => {
    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [handlePaste]);

  // ── Add knowledge item ──────────────────────────────────────────────
  const addKnowledgeItem = () => {
    if (!newUrl.trim() || !newTitle.trim()) { toast.error('Title and URL are required.'); return; }
    const item: KnowledgeItem = {
      id: `user-${Date.now()}`,
      type: newType,
      title: newTitle.trim(),
      url: newUrl.trim(),
      isSeeded: false,
    };
    const updated = [...userKnowledge, item];
    setUserKnowledge(updated);
    saveUserKnowledge(activePersona, updated);
    setNewUrl('');
    setNewTitle('');
    toast.success('Added to knowledge base!');
  };

  const removeKnowledgeItem = (id: string) => {
    const updated = userKnowledge.filter(k => k.id !== id);
    setUserKnowledge(updated);
    saveUserKnowledge(activePersona, updated);
  };

  // ── Send message ────────────────────────────────────────────────────
  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if ((!input.trim() && !attachedImage) || isLoading) return;

    const userMsg: ChatMessage = {
      role: 'user',
      content: input || (attachedImage ? 'Please analyze this design screenshot.' : ''),
      image: attachedImage || undefined,
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    const imageToSend = attachedImage;
    setAttachedImage(null);
    setIsLoading(true);

    try {
      const apiMessages = [...messages, userMsg].map(msg => {
        if (msg.image) {
          const base64 = msg.image.split(',')[1] || msg.image;
          const mediaType = msg.image.split(';')[0].split(':')[1] || 'image/png';
          return {
            role: msg.role, content: [
              { type: 'image', source: { type: 'base64', media_type: mediaType, data: base64 } },
              { type: 'text', text: msg.content || 'Please analyze this design.' }
            ]
          };
        }
        return { role: msg.role, content: msg.content };
      });

      // Build knowledge base context for the system prompt
      const knowledgeContext = allKnowledge.map(k => `- [${k.type.toUpperCase()}] "${k.title}" → ${k.url}${k.description ? ` (${k.description})` : ''}`).join('\n');

      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-cdc57b20/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${publicAnonKey}` },
        body: JSON.stringify({
          messages: apiMessages,
          persona: activePersona,
          context: {
            mode: 'direct-chat',
            hasImage: !!imageToSend,
            annotations: data?.annotations,
            influencerReview: data?.influencerReview,
            knowledgeBase: knowledgeContext,
            timestamp: new Date().toISOString()
          }
        })
      });

      if (!response.ok) throw new Error('Chat failed');
      const result = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', content: result.message }]);
    } catch {
      toast.error("Failed to get a response. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const PromoIcon = persona.promo.type === 'book' ? BookOpen : persona.promo.type === 'youtube' ? Youtube : Megaphone;

  return (
    <div className="flex h-screen bg-[#FDFDFD]">
      {/* ── Sidebar: Persona Selector ──────────────────────────────── */}
      <div className="w-[280px] bg-white border-r border-slate-100 flex flex-col shrink-0">
        <div className="p-5 border-b border-slate-100">
          <div className="flex items-center gap-2 mb-1 cursor-pointer" onClick={() => onNavigate('landing')}>
            <Logo size="sm" />
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">AI Design Mentors</p>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
          {Object.entries(PERSONA_DATA).map(([id, p]) => (
            <button key={id} onClick={() => switchPersona(id)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left ${activePersona === id ? 'bg-slate-900 text-white shadow-lg' : 'bg-white hover:bg-slate-50 text-slate-700 border border-transparent hover:border-slate-200'}`}>
              <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 ring-2 ring-white shadow-sm">
                <ImageWithFallback src={p.image} alt={p.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-bold truncate ${activePersona === id ? 'text-white' : 'text-slate-900'}`}>{p.name}</p>
                <p className={`text-[10px] font-medium truncate ${activePersona === id ? 'text-white/60' : 'text-slate-400'}`}>{p.role}</p>
              </div>
              {activePersona === id && <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse shrink-0" />}
            </button>
          ))}
        </div>

        {/* Promo Card */}
        <div className="p-3">
          <a href={persona.promo.url} target="_blank" rel="noopener noreferrer"
            className={`block p-4 rounded-xl bg-gradient-to-br ${persona.gradient} text-white transition-all hover:scale-[1.02] hover:shadow-lg`}>
            <div className="flex items-center gap-2 mb-2">
              <PromoIcon className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">
                {persona.promo.type === 'book' ? 'Featured Book' : persona.promo.type === 'youtube' ? 'YouTube' : 'Campaign'}
              </span>
            </div>
            <p className="text-sm font-bold leading-tight mb-1">{persona.promo.label}</p>
            <p className="text-[11px] opacity-70 leading-snug">{persona.promo.description}</p>
            <div className="flex items-center gap-1 mt-3 text-[10px] font-bold opacity-60"><ExternalLink className="w-3 h-3" /> Visit</div>
          </a>
        </div>
      </div>

      {/* ── Main Chat Area ─────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Nav */}
        <nav className="bg-white/80 backdrop-blur-xl border-b border-slate-100 px-6 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => onNavigate('landing')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="w-9 h-9 rounded-full overflow-hidden ring-2 ring-white shadow-md">
              <ImageWithFallback src={persona.image} alt={persona.name} className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="text-sm font-black text-slate-900 leading-tight flex items-center gap-2">
                {persona.name} <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              </h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{persona.role}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs font-bold" onClick={() => setShowKnowledgeBase(!showKnowledgeBase)}>
              <Library className="w-3.5 h-3.5" />
              Knowledge Base
              <Badge variant="secondary" className="ml-1 h-5 min-w-[20px] text-[10px] px-1.5 bg-slate-100">{allKnowledge.length}</Badge>
            </Button>
            <Badge variant="outline" className="bg-green-50 text-green-600 border-green-100 gap-1.5 font-bold px-3 py-1 text-[10px]">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /> Online
            </Badge>
          </div>
        </nav>

        <div className="flex-1 flex overflow-hidden">
          {/* ── Chat Messages ───────────────────────────────────────── */}
          <div className="flex-1 flex flex-col min-w-0">
            <div className="flex-1 overflow-hidden relative">
              <div className="absolute inset-0 p-6 overflow-y-auto space-y-5" ref={scrollRef}>
                {messages.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full text-center max-w-md mx-auto space-y-6">
                    <div className="w-24 h-24 rounded-full overflow-hidden shadow-xl ring-4 ring-white">
                      <ImageWithFallback src={persona.image} alt={persona.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="space-y-2">
                      <h2 className="text-xl font-black text-slate-900 tracking-tight">Chat with {persona.name}</h2>
                      <p className="text-sm text-slate-500 font-medium leading-relaxed">{persona.bio}</p>
                    </div>
                    <div className="grid grid-cols-1 gap-2 w-full max-w-sm">
                      {persona.starters.map((q, i) => (
                        <button key={i} onClick={() => setInput(q)} className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-medium text-slate-700 hover:border-slate-300 hover:bg-slate-50 hover:shadow-sm transition-all tracking-wide text-left">
                          "{q}"
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium">
                      <ImagePlus className="w-3.5 h-3.5" /> Paste or attach a screenshot for design feedback
                    </div>
                  </div>
                )}

                {messages.map((msg, i) => (
                  <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                    <div className={`w-8 h-8 rounded-full overflow-hidden shrink-0 shadow-sm ring-2 ring-white ${msg.role === 'user' ? 'bg-blue-100 flex items-center justify-center' : ''}`}>
                      {msg.role === 'user'
                        ? <Zap className="w-4 h-4 text-blue-600" />
                        : <ImageWithFallback src={persona.image} alt={persona.name} className="w-full h-full object-cover" />
                      }
                    </div>
                    <div className="max-w-[75%] space-y-2">
                      {msg.image && (
                        <div className="rounded-xl overflow-hidden border border-slate-200 shadow-sm max-w-[300px]">
                          <img src={msg.image} alt="Uploaded design" className="w-full h-auto" />
                        </div>
                      )}
                      {msg.content && (
                        <div className={`p-4 rounded-3xl max-w-[85%] shadow-sm overflow-hidden ${msg.role === 'user'
                          ? 'bg-blue-50 text-slate-800 rounded-tr-sm border border-blue-100'
                          : 'bg-white border border-slate-100 rounded-tl-sm'
                          }`}>
                          {msg.role === 'user' ? (
                            msg.content as string
                          ) : (
                            <div className="prose prose-sm prose-slate max-w-none prose-p:leading-relaxed prose-pre:bg-slate-50 prose-pre:border prose-pre:text-slate-800">
                              <ReactMarkdown>
                                {msg.content as string}
                              </ReactMarkdown>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 ring-2 ring-white shadow-sm">
                      <ImageWithFallback src={persona.image} alt={persona.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="bg-white border border-slate-200 p-4 rounded-2xl rounded-tl-sm shadow-sm flex gap-1.5 items-center">
                      <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Attached Image Preview */}
            {attachedImage && (
              <div className="px-6 pt-3 bg-white border-t border-slate-100">
                <div className="relative inline-block">
                  <img src={attachedImage} alt="Attached" className="h-20 rounded-lg border border-slate-200 shadow-sm" />
                  <button onClick={() => setAttachedImage(null)} className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center shadow-md hover:bg-red-600">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}

            {/* Input */}
            <div className="p-4 bg-white border-t border-slate-100 shrink-0">
              <form onSubmit={handleSend} className="max-w-4xl mx-auto flex gap-2 items-end">
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e.target.files)} />
                <Button type="button" variant="ghost" size="icon"
                  className="h-12 w-12 shrink-0 rounded-xl border border-slate-200 text-slate-400 hover:text-slate-700 hover:border-slate-300"
                  onClick={() => fileInputRef.current?.click()}>
                  <ImagePlus className="w-5 h-5" />
                </Button>
                <div className="relative flex-1">
                  <Input placeholder={`Ask ${persona.name} anything...`}
                    className="h-12 rounded-xl border-slate-200 focus-visible:ring-primary pl-4 pr-14 font-medium text-sm"
                    value={input} onChange={(e) => setInput(e.target.value)} disabled={isLoading} />
                  <Button type="submit" size="icon"
                    className={`absolute right-1.5 top-1.5 h-9 w-9 rounded-lg bg-gradient-to-br ${persona.gradient} hover:opacity-90`}
                    disabled={(!input.trim() && !attachedImage) || isLoading}>
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </form>
              <p className="text-[9px] text-center text-slate-300 font-bold uppercase tracking-widest mt-3">
                AI Persona • Responses are simulated • Design Snapper
              </p>
            </div>
          </div>

          {/* ── Knowledge Base Panel ─────────────────────────────────── */}
          {showKnowledgeBase && (
            <div className="w-[340px] border-l border-slate-100 bg-white flex flex-col shrink-0 animate-in slide-in-from-right-5 duration-300">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <Library className="w-4 h-4" /> Knowledge Base
                  </h2>
                  <p className="text-[10px] text-slate-400 font-medium mt-0.5">{persona.name}'s content & references</p>
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setShowKnowledgeBase(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-1">
                {allKnowledge.map(item => (
                  <a key={item.id} href={item.url} target="_blank" rel="noopener noreferrer"
                    className="group flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors relative">
                    <div className="mt-0.5 shrink-0"><TypeIcon type={item.type} /></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-800 leading-tight group-hover:text-primary transition-colors truncate">{item.title}</p>
                      {item.description && <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{item.description}</p>}
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-300">{TYPE_LABELS[item.type] || item.type}</span>
                        {item.isSeeded && <span className="text-[8px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-50 px-1.5 py-0.5 rounded">Official</span>}
                      </div>
                    </div>
                    <ExternalLink className="w-3 h-3 text-slate-300 group-hover:text-primary shrink-0 mt-1 transition-colors" />
                    {!item.isSeeded && (
                      <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); removeKnowledgeItem(item.id); }}
                        className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 w-5 h-5 bg-red-50 text-red-400 hover:text-red-600 rounded flex items-center justify-center transition-all">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </a>
                ))}
              </div>

              {/* Add new item */}
              <div className="p-3 border-t border-slate-100 space-y-2 bg-slate-50/50">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Add to Knowledge Base</p>
                <Input placeholder="Title (e.g. 'Latest YouTube video')" className="h-9 text-xs" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
                <Input placeholder="URL (YouTube, LinkedIn, etc.)" className="h-9 text-xs" value={newUrl} onChange={(e) => setNewUrl(e.target.value)} />
                <div className="flex gap-2">
                  <select value={newType} onChange={(e) => setNewType(e.target.value as KnowledgeItem['type'])}
                    className="flex-1 h-9 text-xs border border-slate-200 rounded-md px-2 bg-white text-slate-700 font-medium">
                    <option value="youtube">YouTube</option>
                    <option value="linkedin">LinkedIn</option>
                    <option value="article">Article</option>
                    <option value="book">Book</option>
                    <option value="twitter">Twitter/X</option>
                    <option value="other">Other</option>
                  </select>
                  <Button size="sm" className="h-9 bg-slate-900 text-white gap-1.5 font-bold text-xs" onClick={addKnowledgeItem} disabled={!newUrl.trim() || !newTitle.trim()}>
                    <Plus className="w-3.5 h-3.5" /> Add
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
