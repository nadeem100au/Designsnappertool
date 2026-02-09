import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Send, Bot, Crown, Sparkles, MessageSquare, ShieldCheck, Zap } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { toast } from "sonner@2.0.3";

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface InfluencerChatProps {
  onNavigate: (screen: string, data?: any) => void;
  initialPersonaId?: string;
}

export function InfluencerChat({ onNavigate, initialPersonaId = 'chris-do' }: InfluencerChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const personas: Record<string, { name: string; role: string; color: string }> = {
    'chris-do': { name: 'Chris Do', role: 'Business Strategy', color: 'bg-slate-900' },
    'don-norman': { name: 'Don Norman', role: 'Usability Expert', color: 'bg-blue-600' },
    'ansh-mehra': { name: 'Ansh Mehra', role: 'UX Storyteller', color: 'bg-violet-600' },
  };

  const persona = personas[initialPersonaId] || personas['chris-do'];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-cdc57b20/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({
          messages: [...messages, userMsg],
          persona: initialPersonaId,
          context: {
            mode: 'direct-chat',
            timestamp: new Date().toISOString()
          }
        })
      });

      if (!response.ok) throw new Error('Chat failed');
      const result = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', content: result.message }]);
    } catch (err) {
      toast.error("The influencer is currently busy. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => onNavigate('landing')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full ${persona.color} flex items-center justify-center text-white shadow-md`}>
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-sm font-black text-slate-900 leading-tight">{persona.name}</h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{persona.role}</p>
            </div>
          </div>
        </div>
        <Badge variant="outline" className="bg-green-50 text-green-600 border-green-100 gap-1.5 font-bold px-3 py-1">
          <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
          Live Session
        </Badge>
      </nav>

      <div className="flex-1 overflow-hidden relative">
        <div className="absolute inset-0 p-6 overflow-y-auto space-y-6" ref={scrollRef}>
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center max-w-sm mx-auto space-y-6">
              <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-xl border border-slate-100">
                <Bot className="w-10 h-10 text-slate-300" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-black text-slate-900 tracking-tight">Private consultation with {persona.name.split(' ')[0]}</h2>
                <p className="text-sm text-slate-500 font-medium">Ask anything about design strategy, usability, or the future of digital products.</p>
              </div>
              <div className="grid grid-cols-1 gap-2 w-full">
                {[
                  "How do I justify high design fees?",
                  "Explain the 10 heuristics of usability.",
                  "What makes a landing page high-converting?"
                ].map((q, i) => (
                  <button 
                    key={i} 
                    onClick={() => { setInput(q); }}
                    className="p-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:border-primary hover:text-primary transition-all text-left"
                  >
                    "{q}"
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
                msg.role === 'user' ? 'bg-slate-900 text-white' : persona.color + ' text-white'
              }`}>
                {msg.role === 'user' ? <Zap className="w-4 h-4" /> : <Crown className="w-4 h-4" />}
              </div>
              <div className={`p-4 rounded-2xl max-w-[80%] text-sm font-medium leading-relaxed shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-slate-900 text-white rounded-tr-sm' 
                  : 'bg-white border border-slate-200 text-slate-700 rounded-tl-sm'
              }`}>
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${persona.color} text-white`}>
                <Crown className="w-4 h-4" />
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

      <div className="p-6 bg-white border-t border-slate-200 shrink-0">
        <form onSubmit={handleSend} className="max-w-4xl mx-auto flex gap-3">
          <div className="relative flex-1">
            <Input 
              placeholder={`Ask ${persona.name}...`}
              className="h-14 rounded-2xl border-slate-200 focus-visible:ring-primary pl-6 pr-14 font-medium"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
            />
            <Button 
              type="submit" 
              size="icon" 
              className="absolute right-2 top-2 h-10 w-10 bg-slate-900 hover:bg-slate-800 rounded-xl"
              disabled={!input.trim() || isLoading}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </form>
        <p className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-widest mt-4">
          Powered by Claude 3.5 Sonnet • Design Snapper Vision Engine
        </p>
      </div>
    </div>
  );
}
