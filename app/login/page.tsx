'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { supabase } from '@/lib/supabase';

type AuthMode = 'signin' | 'signup';

export default function LoginPage() {
  const router = useRouter();

  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    void supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.replace('/dashboard');
      }
    });
  }, [router]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (mode === 'signin') {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          throw signInError;
        }

        router.push('/dashboard');
        return;
      }

      const checkRes = await fetch('/api/auth/check-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const checkData: { exists?: boolean; error?: string } = await checkRes.json();

      if (!checkRes.ok) {
        throw new Error(checkData.error || 'Failed to check email');
      }

      if (checkData.exists) {
        setMode('signin');
        setError('Account already exists. Please sign in instead.');
        return;
      }

      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) {
        throw signUpError;
      }

      setMessage('Sign up successful. Please check your email to confirm.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
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
        <div className="flex flex-col p-10 sm:p-12 lg:p-14">
          <div className="mb-6 flex-1">
            <h2 className="mb-4 text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Welcome to your job application tracker.
            </h2>

            <p className="mb-8 max-w-xs text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              {mode === 'signin'
                ? 'Sign in to review your application pipeline and next deadlines.'
                : 'Create an account and start tracking every role from day one.'}
            </p>

            <div className="mb-8 inline-flex w-full rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  setError(null);
                  setMessage(null);
                }}
                className={cn(
                  'flex-1 rounded-l-lg py-2.5 text-sm font-semibold transition-all duration-200',
                  mode === 'signin'
                    ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-slate-100'
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
                  'flex-1 rounded-r-lg py-2.5 text-sm font-semibold transition-all duration-200',
                  mode === 'signup'
                    ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-slate-100'
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
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition-all focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
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
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition-all focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-sky-600 transition-colors hover:text-sky-700"
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
                className="w-full rounded-full bg-slate-900 px-10 py-3.5 text-sm font-semibold text-white shadow-lg shadow-slate-200 transition-all hover:bg-slate-800 active:scale-95 disabled:opacity-70 md:w-auto dark:bg-slate-100 dark:text-slate-900 dark:shadow-none dark:hover:bg-slate-200"
              >
                {loading ? 'Working...' : mode === 'signin' ? 'Sign in' : 'Create account'}
              </button>
            </form>
          </div>
        </div>

        <div className="relative hidden h-full items-center justify-center overflow-hidden bg-slate-900 p-12 md:flex">
          <div className="absolute right-[-10%] top-[-10%] h-64 w-64 rounded-full bg-sky-500/20 blur-[80px]" />
          <div className="absolute bottom-[-5%] left-[-5%] h-48 w-48 rounded-full bg-indigo-500/20 blur-[60px]" />

          <div className="z-10 w-full max-w-sm rounded-[24px] border border-white/10 p-8 backdrop-blur-xl">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500 font-bold text-white shadow-lg shadow-sky-500/20">
                T
              </div>
              <div>
                <p className="text-sm font-bold text-white">Your pipeline overview</p>
                <p className="text-[11px] text-slate-400">A quick snapshot of progress.</p>
              </div>
            </div>

            <div className="mb-8 space-y-4">
              <PipelineStat label="Wishlist" value="12" progress="60%" color="bg-slate-500" />
              <PipelineStat label="Applied" value="8" progress="45%" color="bg-sky-400" />
              <PipelineStat label="Interview" value="3" progress="20%" color="bg-amber-400" />
              <PipelineStat
                label="Offer"
                value="1"
                progress="10%"
                color="bg-emerald-400"
                isOffer
              />
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
              <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
              <p className="text-[10px] font-medium text-slate-300">
                You have 2 interviews this week
              </p>
            </div>
          </div>

          <div className="absolute bottom-8 right-8 flex gap-2">
            <div className="h-1 w-1 rounded-full bg-slate-700" />
            <div className="h-1 w-1 rounded-full bg-slate-700" />
            <div className="h-1 w-1 rounded-full bg-slate-700" />
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
        <span className={cn('text-xs font-bold', isOffer ? 'text-emerald-400' : 'text-white')}>
          {value}
        </span>
      </div>

      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
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