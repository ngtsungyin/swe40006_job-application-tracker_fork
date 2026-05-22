'use client';

export const dynamic = 'force-dynamic'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.replace('/dashboard');
    });
  }, [router]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (mode === 'signin') {
        const { error: err } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (err) throw err;
        router.push('/dashboard');
      } else {
        const { error: err } = await supabase.auth.signUp({ email, password });
        if (err) throw err;
        setMessage('Sign up successful. Please check your email to confirm.');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-8 dark:bg-slate-950">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="grid w-full max-w-5xl overflow-hidden rounded-[32px] border border-slate-100 bg-white shadow-[-16px_0_50px_-12px_rgba(15,23,42,0.18),0_25px_50px_-12px_rgba(15,23,42,0.15)] md:grid-cols-2 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none"
      >
        {/* Left Side: Form */}
        <div className="flex flex-col p-10 sm:p-12 lg:p-14">
          <div className="mb-6 flex-1">
            <h2 className="text-4xl font-bold tracking-tight text-slate-900 mb-4 dark:text-slate-100">
              Welcome to your job application tracker.
            </h2>
            <p className="max-w-xs text-slate-500 text-sm leading-relaxed mb-8 dark:text-slate-400">
              {mode === 'signin'
                ? 'Sign in to review your application pipeline and next deadlines.'
                : 'Create an account and start tracking every role from day one.'}
            </p>

            {/* Mode Switcher */}
            <div className="inline-flex w-full p-1 bg-slate-100 rounded-xl mb-8 dark:bg-slate-800">
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  setError(null);
                  setMessage(null);
                }}
                className={cn(
                  'flex-1 py-2.5 text-sm font-semibold rounded-l-lg transition-all duration-200',
                  mode === 'signin'
                    ? 'bg-white shadow-sm text-slate-900 dark:bg-slate-700 dark:text-slate-100'
                    : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                )}
              >
                Sign in
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setError(null);
                  setMessage(null);
                }}
                className={cn(
                  'flex-1 py-2.5 text-sm font-semibold rounded-r-lg transition-all duration-200',
                  mode === 'signup'
                    ? 'bg-white shadow-sm text-slate-900 dark:bg-slate-700 dark:text-slate-100'
                    : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                )}
              >
                Create account
              </button>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                    Email
                  </label>
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="you@email.com"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      type={showPassword ? 'text' : 'password'}
                      autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                      minLength={6}
                      required
                      placeholder="At least 6 characters"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-sky-600 hover:text-sky-700 transition-colors"
                    >
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>
              </div>

              <AnimatePresence mode="wait">
                {error && (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-700 dark:border-red-900/30 dark:bg-red-950/20 dark:text-red-400"
                  >
                    {error}
                  </motion.div>
                )}

                {message && (
                  <motion.div
                    key="message"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-medium text-emerald-700 dark:border-emerald-900/30 dark:bg-emerald-950/20 dark:text-emerald-400"
                  >
                    {message}
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                type="submit"
                disabled={loading}
                className="w-full md:w-auto px-10 py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-full font-semibold text-sm shadow-lg shadow-slate-200 transition-all active:scale-95 disabled:opacity-70 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200 dark:shadow-none"
              >
                {loading ? 'Working...' : mode === 'signin' ? 'Sign in' : 'Create account'}
              </button>
            </form>
          </div>

        </div>

        {/* Right Side: Decorative Panel */}
        <div className="relative hidden md:flex h-full bg-slate-900 items-center justify-center p-12 overflow-hidden">
          <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-sky-500/20 rounded-full blur-[80px]"></div>
          <div className="absolute bottom-[-5%] left-[-5%] w-48 h-48 bg-indigo-500/20 rounded-full blur-[60px]"></div>

          <div className="glass-dark w-full max-w-sm rounded-[24px] p-8 z-10 border border-white/10 backdrop-blur-xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-sky-500 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-sky-500/20">
                T
              </div>
              <div>
                <p className="text-sm font-bold text-white">Your pipeline overview</p>
                <p className="text-[11px] text-slate-400">A quick snapshot of progress.</p>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <PipelineStat label="Wishlist" value="12" progress="60%" color="bg-slate-500" />
              <PipelineStat label="Applied" value="8" progress="45%" color="bg-sky-400" />
              <PipelineStat label="Interview" value="3" progress="20%" color="bg-amber-400" />
              <PipelineStat label="Offer" value="1" progress="10%" color="bg-emerald-400" isOffer />
            </div>

            <div className="flex items-center gap-2 px-4 py-3 bg-white/5 rounded-xl border border-white/10">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.5)]"></div>
              <p className="text-[10px] text-slate-300 font-medium">You have 2 interviews this week</p>
            </div>
          </div>

          <div className="absolute bottom-8 right-8 flex gap-2">
            <div className="w-1 h-1 bg-slate-700 rounded-full"></div>
            <div className="w-1 h-1 bg-slate-700 rounded-full"></div>
            <div className="w-1 h-1 bg-slate-700 rounded-full"></div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function PipelineStat({
  label,
  value,
  progress,
  color,
  isOffer = false,
}: {
  label: string;
  value: string;
  progress: string;
  color: string;
  isOffer?: boolean;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-300">{label}</span>
        <span className={cn('text-xs font-bold', isOffer ? 'text-emerald-400' : 'text-white')}>{value}</span>
      </div>
      <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: progress }}
          transition={{ duration: 1, delay: 0.8 }}
          className={cn('h-full rounded-full', color)}
        />
      </div>
    </div>
  );
}
