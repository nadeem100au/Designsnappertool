import { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Target, Loader2, ArrowRight, Chrome } from 'lucide-react';
import { supabase } from '../utils/supabase/client';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { toast } from 'sonner@2.0.3';

interface AuthPageProps {
  onAuthSuccess: () => void;
  onBack: () => void;
}

export function AuthPage({ onAuthSuccess, onBack }: AuthPageProps) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) throw error;
    } catch (err: any) {
      toast.error(err.message || 'Google authentication failed');
      setIsGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (mode === 'signup') {
        const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-cdc57b20/signup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${publicAnonKey}` },
          body: JSON.stringify({ email, password, name })
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Signup failed');
        
        // After signup, sign in automatically
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      
      toast.success(mode === 'signup' ? 'Account created successfully!' : 'Signed in successfully!');
      onAuthSuccess();
    } catch (err: any) {
      toast.error(err.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex flex-col items-center justify-center p-6">
      <div className="absolute top-8 left-8">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-colors font-bold uppercase text-[10px] tracking-widest">
          <ArrowRight className="w-4 h-4 rotate-180" />
          Back
        </button>
      </div>

      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-10">
          <div className="w-12 h-12 bg-slate-900 rounded-[14px] flex items-center justify-center shadow-xl rotate-[-2deg] mb-4">
            <Target className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase italic">Snapper.</h1>
        </div>

        <Card className="p-8 border-slate-100 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] rounded-[32px]">
          <h2 className="text-2xl font-black mb-2 text-slate-900">
            {mode === 'signin' ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-slate-500 text-sm mb-6 font-medium">
            {mode === 'signin' 
              ? 'Enter your credentials to access your audits.' 
              : 'Join the world\'s most precise design audit engine.'}
          </p>

          <Button 
            variant="outline"
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading}
            className="w-full h-12 border-slate-200 hover:bg-slate-50 text-slate-900 rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 mb-6 transition-all focus:ring-2 focus:ring-[#0066ff] focus:border-transparent outline-none"
          >
            {isGoogleLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Chrome className="w-4 h-4" />}
            Continue with Google
          </Button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-100"></span>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-black tracking-widest">
              <span className="bg-white px-4 text-slate-300">Or use email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {mode === 'signup' && (
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input 
                  id="name" 
                  type="text" 
                  placeholder="John Doe" 
                  required 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-12 rounded-xl border-slate-200 focus:ring-2 focus:ring-[#0066ff] focus:border-transparent transition-all"
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="name@company.com" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 rounded-xl border-slate-200 focus:ring-2 focus:ring-[#0066ff] focus:border-transparent transition-all"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                {mode === 'signin' && (
                  <button type="button" className="text-[10px] font-black uppercase text-slate-400 hover:text-[#0066ff] transition-colors">Forgot?</button>
                )}
              </div>
              <Input 
                id="password" 
                type="password" 
                placeholder="••••••••" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 rounded-xl border-slate-200 focus:ring-2 focus:ring-[#0066ff] focus:border-transparent transition-all"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 bg-slate-900 text-white hover:bg-slate-800 rounded-xl font-black uppercase tracking-widest text-xs mt-4 focus:ring-2 focus:ring-[#0066ff] focus:ring-offset-2 outline-none transition-all"
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : mode === 'signin' ? 'Sign In' : 'Create Account'}
            </Button>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-50 text-center">
            <p className="text-sm text-slate-500 font-medium">
              {mode === 'signin' ? "Don't have an account?" : "Already have an account?"}{' '}
              <button 
                onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
                className="text-slate-900 font-black hover:text-[#0066ff] hover:underline underline-offset-4 transition-all"
              >
                {mode === 'signin' ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          </div>
        </Card>

        <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-8">
          Secure Authentication • Design Snapper v4.0
        </p>
      </div>
    </div>
  );
}
