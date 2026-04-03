'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, MessageCircle, ArrowRight, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useApp } from '@/context/AppContext';

// ─── Login ───────────────────────────────────────────────────────────────────

export function LoginPage() {
  const { login, loginWithOAuth, setAuthView } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await login(email, password);
    setLoading(false);
    if (!res.success) {
      setError(res.error || 'Check your credentials and try again.');
    }
  };

  return (
    <div className="flex flex-col h-full items-center justify-center px-6 py-12 bg-background">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        {/* Logo */}
        <div className="flex flex-col items-center gap-3 mb-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg">
            <MessageCircle size={32} className="text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-bold gradient-text">NexusChat</h1>
            <p className="text-sm text-muted-foreground mt-1">Connect with anyone, anywhere</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-destructive/10 text-destructive text-xs font-medium border border-destructive/20 animate-fade-in text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-border bg-accent/30 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Password</label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-border bg-accent/30 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all pr-12"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <div className="flex justify-end mt-1.5">
              <button type="button" className="text-xs text-primary hover:underline">Forgot password?</button>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold text-sm transition-all hover:shadow-lg disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {loading ? (
              <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Signing in...</>
            ) : (
              <>Sign in <ArrowRight size={16} /></>
            )}
          </motion.button>
        </form>

        <div className="mt-4 flex items-center gap-3">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground">or</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        <button 
          onClick={() => loginWithOAuth('google')}
          className="mt-4 w-full py-3 rounded-xl border border-border bg-card hover:bg-accent/50 transition-colors text-sm font-medium flex items-center justify-center gap-2"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          <span className="text-foreground">Continue with Google</span>
        </button>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Don't have an account?{' '}
          <button onClick={() => setAuthView('register')} className="text-primary font-semibold hover:underline">
            Sign up
          </button>
        </p>
      </motion.div>
    </div>
  );
}

// ─── Register ─────────────────────────────────────────────────────────────────

export function RegisterPage() {
  const { register, setAuthView } = useApp();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await register(email, password, name);
    setLoading(false);
    if (!res.success) {
      setError(res.error || 'Registration failed.');
    }
  };

  return (
    <div className="flex flex-col h-full items-center justify-center px-6 py-12 bg-background">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg">
            <MessageCircle size={28} className="text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold">Create Account</h1>
            <p className="text-sm text-muted-foreground mt-1">Join NexusChat today</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-destructive/10 text-destructive text-xs font-medium border border-destructive/20 animate-fade-in text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          {[
            { label: 'Full Name', value: name, onChange: setName, type: 'text', placeholder: 'John Doe' },
            { label: 'Email', value: email, onChange: setEmail, type: 'email', placeholder: 'you@example.com' },
            { label: 'Password', value: password, onChange: setPassword, type: 'password', placeholder: '••••••••' },
          ].map(({ label, value, onChange, type, placeholder }) => (
            <div key={label}>
              <label className="block text-sm font-medium mb-1.5">{label}</label>
              <input
                type={type}
                value={value}
                onChange={e => onChange(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-border bg-accent/30 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
                placeholder={placeholder}
                required
              />
            </div>
          ))}

          <motion.button
            whileTap={{ scale: 0.99 }}
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold text-sm mt-2 flex items-center justify-center gap-2"
          >
            {loading ? (
              <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating...</>
            ) : (
              <>Create Account <ArrowRight size={16} /></>
            )}
          </motion.button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Already have an account?{' '}
          <button onClick={() => setAuthView('login')} className="text-primary font-semibold hover:underline">Sign in</button>
        </p>
      </motion.div>
    </div>
  );
}

// ─── Verification ─────────────────────────────────────────────────────────────

export function VerifyPage() {
  const { verifyEmail, setAuthView, lastUsedEmail } = useApp();
  const [email, setEmail] = useState(lastUsedEmail || '');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await verifyEmail(email, otp);
    setLoading(false);
    if (!res.success) {
      setError(res.error || 'Invalid code. Please try again.');
    }
  };

  return (
    <div className="flex flex-col h-full items-center justify-center px-6 py-12 bg-background">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg">
            <Check size={28} className="text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold">Verify Email</h1>
            <p className="text-sm text-muted-foreground mt-1">Enter the 6-digit code sent to your email</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-destructive/10 text-destructive text-xs font-medium border border-destructive/20 animate-fade-in text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Email (confirm your email)</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-border bg-accent/30 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Verification Code</label>
            <input
              type="text"
              maxLength={6}
              value={otp}
              onChange={e => setOtp(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-border bg-accent/30 text-sm text-center tracking-[0.5em] font-mono focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all font-bold"
              placeholder="000000"
              required
            />
          </div>

          <motion.button
            whileTap={{ scale: 0.99 }}
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold text-sm mt-4 flex items-center justify-center gap-2"
          >
            {loading ? (
              <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Verifying...</>
            ) : (
              <>Verify & Continue <ArrowRight size={16} /></>
            )}
          </motion.button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Didn't receive a code?{' '}
          <button type="button" className="text-primary font-semibold hover:underline">Resend</button>
        </p>
        <button type="button" onClick={() => setAuthView('login')} className="w-full text-xs text-muted-foreground mt-4 hover:underline">Back to Sign In</button>
      </motion.div>
    </div>
  );
}

// ─── Onboarding ───────────────────────────────────────────────────────────────

const STEPS = [
  {
    emoji: '💬',
    title: 'Chat with anyone',
    desc: 'Send messages to friends, family, and colleagues in real time. One-on-one or in groups.',
  },
  {
    emoji: '🤖',
    title: 'Meet Nexus AI',
    desc: 'Your built-in AI assistant. Ask questions, get code help, brainstorm ideas — all in one place.',
  },
  {
    emoji: '📱',
    title: 'Stories & Calls',
    desc: 'Share moments with stories, make crystal-clear audio and video calls.',
  },
  {
    emoji: '🔒',
    title: 'Private & Secure',
    desc: 'Your conversations are safe. Control who sees your last seen, read receipts, and more.',
  },
];

export function OnboardingPage() {
  const { setIsAuthView, updateProfile, user } = useApp();
  const [step, setStep] = useState(0);
  const [username, setUsername] = useState('');

  const finishOnboarding = async () => {
    if (username && user) {
      await updateProfile({ username });
    }
    setIsAuthView(false);
  };

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="flex-1 flex flex-col items-center justify-center px-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            className="flex flex-col items-center gap-6 text-center max-w-xs"
          >
            <div className="text-7xl">{STEPS[step].emoji}</div>
            <div>
              <h2 className="text-2xl font-bold mb-2">{STEPS[step].title}</h2>
              <p className="text-muted-foreground text-sm leading-relaxed">{STEPS[step].desc}</p>
            </div>
            {step === 0 && (
              <div className="w-full mt-2 animate-slide-up">
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-accent/30 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all text-center"
                  placeholder="Choose a username..."
                />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Dots */}
      <div className="flex justify-center gap-2 mb-8">
        {STEPS.map((_, i) => (
          <button
            key={i}
            onClick={() => setStep(i)}
            className={cn(
              'rounded-full transition-all',
              i === step ? 'w-6 h-2 bg-primary' : 'w-2 h-2 bg-muted'
            )}
          />
        ))}
      </div>

      <div className="px-8 pb-10">
        {step < STEPS.length - 1 ? (
          <div className="flex gap-3">
            <button
              onClick={() => setIsAuthView(false)}
              className="flex-1 py-3 rounded-xl border border-border text-sm font-medium hover:bg-accent/50 transition-colors"
            >
              Skip
            </button>
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => setStep(step + 1)}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold text-sm flex items-center justify-center gap-2"
            >
              Next <ArrowRight size={16} />
            </motion.button>
          </div>
        ) : (
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={finishOnboarding}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold text-sm flex items-center justify-center gap-2"
          >
            <Check size={18} /> Get Started
          </motion.button>
        )}
      </div>
    </div>
  );
}
