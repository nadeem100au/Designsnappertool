import { useState, FormEvent } from 'react';
import { supabase } from '../utils/supabase/client';
import { Loader2, ArrowLeft, Target, Mail, Eye, EyeOff } from 'lucide-react';

import { toast } from 'sonner';

interface AuthPageProps {
    onNavigate: (screen: string, data?: any) => void;
}

export function AuthPage({ onNavigate }: AuthPageProps) {
    const [isSignUp, setIsSignUp] = useState(false);
    const [useOtp, setUseOtp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const [otpCode, setOtpCode] = useState('');
    const [showOtpInput, setShowOtpInput] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleGoogleLogin = async () => {
        try {
            setLoading(true);
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/upload`,
                },
            });
            if (error) throw error;
        } catch (error: any) {
            toast.error(error.message || 'Error signing in with Google');
            setLoading(false);
        }
    };

    const handleEmailAuth = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (useOtp) {
                if (showOtpInput) {
                    // VERIFY OTP
                    // Identify token type based on length (6 digits = 'email' OTP, longer = 'magiclink' token)
                    const tokenType = otpCode.length === 6 ? 'email' : 'magiclink';

                    const { error } = await supabase.auth.verifyOtp({
                        email,
                        token: otpCode,
                        type: tokenType,
                    });

                    if (error) throw error;
                    toast.success('Successfully signed in!');
                    // App.tsx handles redirect via onAuthStateChange
                } else {
                    // SEND OTP
                    const { error } = await supabase.auth.signInWithOtp({
                        email,
                        options: {
                            // preventing magic link, force code
                            shouldCreateUser: true,
                        }
                    });
                    if (error) throw error;
                    setShowOtpInput(true);
                    toast.success('Check your email for the code!');
                }
            } else {
                // PASSWORD AUTH
                if (isSignUp) {
                    const { error } = await supabase.auth.signUp({ email, password });
                    if (error) throw error;
                    // Auto redirect after signup? Usually requires email verification.
                    // If no verification needed or if we want to show a success message first.
                    // But user asked for auto-redirect.
                    // However, signUp might return a session depending on config.
                    // Let's check for session and redirect if present, otherwise show toast.
                    const { data } = await supabase.auth.getSession();
                    if (data.session) {
                        toast.success('Account created! Redirecting...');
                        onNavigate('upload');
                    } else {
                        toast.success('Check your email for the confirmation link!');
                    }
                } else {
                    const { error } = await supabase.auth.signInWithPassword({ email, password });
                    if (error) throw error;
                    toast.success('Successfully signed in!');
                    onNavigate('upload');
                }
            }

        } catch (error: any) {
            toast.error(error.message || 'Authentication error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: '#FAFBFC',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
            position: 'relative',
            padding: '24px',
        }}>
            {/* Back Button */}
            <button
                onClick={() => onNavigate('landing')}
                style={{
                    position: 'absolute',
                    top: 32,
                    left: 32,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    fontSize: 11,
                    fontWeight: 700,
                    color: '#94a3b8',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'color 0.2s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#475569'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}
            >
                <ArrowLeft size={14} /> BACK
            </button>

            {/* Logo */}
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 12,
                marginBottom: 40,
            }}>
                <div style={{
                    width: 48,
                    height: 48,
                    background: '#0F172A',
                    borderRadius: 14,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 8px 24px rgba(15,23,42,0.25)',
                    transform: 'rotate(-2deg)',
                }}>
                    <Target size={24} color="white" />
                </div>
                <span style={{
                    fontWeight: 900,
                    fontSize: 20,
                    letterSpacing: '-0.03em',
                    color: '#0F172A',
                    textTransform: 'uppercase',
                    fontStyle: 'italic',
                }}>Snapper.</span>
            </div>

            {/* Auth Card */}
            <div style={{
                width: '100%',
                maxWidth: 440,
                background: 'white',
                borderRadius: 28,
                boxShadow: '0 24px 48px -12px rgba(0,0,0,0.08)',
                padding: '48px 44px',
                border: '1px solid rgba(226,232,240,0.6)',
            }}>
                {/* Header */}
                <div style={{ marginBottom: 36 }}>
                    <h1 style={{
                        fontSize: 26,
                        fontWeight: 700,
                        color: '#0F172A',
                        marginBottom: 8,
                        letterSpacing: '-0.02em',
                        lineHeight: 1.2,
                    }}>
                        {showOtpInput ? 'Enter Code' : (isSignUp ? 'Create Account' : 'Welcome Back')}
                    </h1>
                    <p style={{
                        fontSize: 14,
                        color: '#94a3b8',
                        fontWeight: 500,
                        lineHeight: 1.6,
                        margin: 0,
                    }}>
                        {showOtpInput
                            ? `We sent a code to ${email}`
                            : (useOtp
                                ? 'Sign in easily with a code sent to your email.'
                                : (isSignUp
                                    ? 'Enter your details to create your account.'
                                    : 'Enter your credentials to access your audits.'))}
                    </p>
                </div>

                {/* Google Button */}
                {!showOtpInput && (
                    <>
                        <button
                            onClick={handleGoogleLogin}
                            disabled={loading}
                            style={{
                                width: '100%',
                                height: 48,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 10,
                                background: 'white',
                                border: '1px solid #e2e8f0',
                                borderRadius: 12,
                                fontSize: 11,
                                fontWeight: 800,
                                color: '#0F172A',
                                textTransform: 'uppercase',
                                letterSpacing: '0.12em',
                                cursor: loading ? 'wait' : 'pointer',
                                transition: 'all 0.2s',
                                marginBottom: 20,
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#cbd5e1'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = 'white'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
                        >
                            {loading ? (
                                <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                            ) : (
                                <>
                                    <svg width="16" height="16" viewBox="0 0 24 24">
                                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                    </svg>
                                    Continue with Google
                                </>
                            )}
                        </button>

                        {/* Divider */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 16,
                            marginBottom: 20,
                        }}>
                            <div style={{ flex: 1, height: 1, background: '#f1f5f9' }} />
                            <span style={{
                                fontSize: 10,
                                fontWeight: 700,
                                color: '#cbd5e1',
                                textTransform: 'uppercase',
                                letterSpacing: '0.15em',
                            }}>Or use email</span>
                            <div style={{ flex: 1, height: 1, background: '#f1f5f9' }} />
                        </div>
                    </>
                )}

                {/* Form */}
                <form onSubmit={handleEmailAuth}>
                    {!showOtpInput && (
                        /* Email Field - Only show if not entering OTP code */
                        <div style={{ marginBottom: 20 }}>
                            <label style={{
                                display: 'block',
                                fontSize: 11,
                                fontWeight: 700,
                                color: '#334155',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                                marginBottom: 8,
                            }}>Email Address</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@company.com"
                                style={{
                                    width: '100%',
                                    height: 48,
                                    padding: '0 16px',
                                    background: '#f8fafc',
                                    border: '1px solid transparent',
                                    borderRadius: 12,
                                    fontSize: 14,
                                    color: '#0F172A',
                                    outline: 'none',
                                    transition: 'all 0.2s',
                                    boxSizing: 'border-box',
                                }}
                                onFocus={(e) => { e.currentTarget.style.background = 'white'; e.currentTarget.style.border = '1px solid #cbd5e1'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(15,23,42,0.05)'; }}
                                onBlur={(e) => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.border = '1px solid transparent'; e.currentTarget.style.boxShadow = 'none'; }}
                            />
                        </div>
                    )}

                    {useOtp ? (
                        /* OTP Code Input */
                        showOtpInput && (
                            <div style={{ marginBottom: 28 }}>
                                <label style={{
                                    display: 'block',
                                    fontSize: 11,
                                    fontWeight: 700,
                                    color: '#334155',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                    marginBottom: 8,
                                }}>Verification Code</label>
                                <input
                                    type="text"
                                    required
                                    value={otpCode}
                                    onChange={(e) => setOtpCode(e.target.value.trim())}
                                    placeholder="Enter code from email"
                                    style={{
                                        width: '100%',
                                        height: 48,
                                        padding: '0 16px',
                                        background: '#f8fafc',
                                        border: '1px solid transparent',
                                        borderRadius: 12,
                                        fontSize: 18,
                                        fontWeight: 'bold',
                                        color: '#0F172A',
                                        outline: 'none',
                                        transition: 'all 0.2s',
                                        boxSizing: 'border-box',
                                        letterSpacing: otpCode.length > 6 ? 'normal' : '0.5em',
                                        textAlign: 'center'
                                    }}
                                    onFocus={(e) => { e.currentTarget.style.background = 'white'; e.currentTarget.style.border = '1px solid #cbd5e1'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(15,23,42,0.05)'; }}
                                    onBlur={(e) => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.border = '1px solid transparent'; e.currentTarget.style.boxShadow = 'none'; }}
                                />
                            </div>
                        )
                    ) : (
                        /* Password Field */
                        !showOtpInput && (
                            <div style={{ marginBottom: 28 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                    <label style={{
                                        fontSize: 11,
                                        fontWeight: 700,
                                        color: '#334155',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.05em',
                                    }}>Password</label>
                                    <a href="#" style={{
                                        fontSize: 10,
                                        fontWeight: 800,
                                        color: '#94a3b8',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.12em',
                                        textDecoration: 'none',
                                    }}
                                        onMouseEnter={(e) => e.currentTarget.style.color = '#475569'}
                                        onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}
                                    >Forgot?</a>
                                </div>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        minLength={6}
                                        style={{
                                            width: '100%',
                                            height: 48,
                                            padding: '0 48px 0 16px',
                                            background: '#f8fafc',
                                            border: '1px solid transparent',
                                            borderRadius: 12,
                                            fontSize: 14,
                                            color: '#0F172A',
                                            outline: 'none',
                                            transition: 'all 0.2s',
                                            boxSizing: 'border-box',
                                            letterSpacing: '0.15em',
                                        }}
                                        onFocus={(e) => { e.currentTarget.style.background = 'white'; e.currentTarget.style.border = '1px solid #cbd5e1'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(15,23,42,0.05)'; }}
                                        onBlur={(e) => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.border = '1px solid transparent'; e.currentTarget.style.boxShadow = 'none'; }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        style={{
                                            position: 'absolute',
                                            right: 12,
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            background: 'none',
                                            border: 'none',
                                            padding: 4,
                                            cursor: 'pointer',
                                            color: '#94a3b8',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.color = '#64748b'}
                                        onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>

                            </div>
                        )
                    )}

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%',
                            height: 48,
                            background: '#0F172A',
                            color: 'white',
                            border: 'none',
                            borderRadius: 12,
                            fontSize: 11,
                            fontWeight: 900,
                            textTransform: 'uppercase',
                            letterSpacing: '0.2em',
                            cursor: loading ? 'wait' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 8,
                            transition: 'all 0.2s',
                            boxShadow: '0 4px 12px rgba(15,23,42,0.15)',
                            opacity: loading ? 0.7 : 1,
                        }}
                        onMouseEnter={(e) => { if (!loading) { e.currentTarget.style.background = '#1e293b'; e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(15,23,42,0.2)'; } }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = '#0F172A'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(15,23,42,0.15)'; }}
                    >
                        {loading && <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />}
                        {showOtpInput
                            ? 'Verify Code'
                            : (useOtp
                                ? 'Send Code'
                                : (isSignUp ? 'Sign Up' : 'Sign In'))}
                    </button>

                    {/* Back to Email input (if showing OTP) */}
                    {showOtpInput && (
                        <button
                            type="button"
                            onClick={() => setShowOtpInput(false)}
                            style={{
                                width: '100%',
                                marginTop: 12,
                                background: 'none',
                                border: 'none',
                                color: '#64748b',
                                fontSize: 12,
                                fontWeight: 600,
                                cursor: 'pointer',
                            }}
                        >
                            Change Email
                        </button>
                    )}
                </form>

                {/* Toggles */}
                {!showOtpInput && (
                    <div style={{
                        marginTop: 28,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 12,
                        alignItems: 'center',
                    }}>
                        {/* OTP vs Password Toggle - ONLY SHOW FOR SIGN IN */}
                        {!isSignUp && (
                            <button
                                onClick={() => setUseOtp(!useOtp)}
                                style={{
                                    background: 'white',
                                    border: '1px solid #e2e8f0',
                                    color: '#334155',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    fontSize: 12,
                                    padding: '8px 16px',
                                    borderRadius: 20,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 6,
                                    transition: 'all 0.2s',
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.background = '#f8fafc'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = 'white'; }}
                            >
                                {useOtp ? <Mail size={14} /> : <Mail size={14} />}
                                {useOtp ? 'Use Password instead' : 'Sign in with Email Code'}
                            </button>
                        )}

                        <div style={{
                            fontSize: 13,
                            color: '#94a3b8',
                            fontWeight: 500,
                        }}>
                            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                            <button
                                onClick={() => {
                                    const newIsSignUp = !isSignUp;
                                    setIsSignUp(newIsSignUp);
                                    // If switching to Sign Up, force OTP (true).
                                    // If switching to Sign In, force Password (false) by default.
                                    setUseOtp(newIsSignUp);
                                    setShowOtpInput(false);
                                    setEmail('');
                                    setPassword('');
                                    setOtpCode('');
                                }}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#0F172A',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    fontSize: 13,
                                    padding: 0,
                                    marginLeft: 4,
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                                onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                            >
                                {isSignUp ? 'Sign In' : 'Sign Up'}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div style={{
                position: 'absolute',
                bottom: 28,
                left: 0,
                right: 0,
                textAlign: 'center',
            }}>
                <p style={{
                    fontSize: 10,
                    fontWeight: 800,
                    color: '#cbd5e1',
                    textTransform: 'uppercase',
                    letterSpacing: '0.2em',
                    margin: 0,
                }}>
                    Secure Authentication · Design Snapper v4.0
                </p>
            </div>

            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
