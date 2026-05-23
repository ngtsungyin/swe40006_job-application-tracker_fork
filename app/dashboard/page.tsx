'use client'

export const dynamic = 'force-dynamic'

import React, { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip
} from 'recharts'
import {
  Clock, Send, Zap, Mail, Plus, AlertCircle, Briefcase, LogOut
} from 'lucide-react'
import { getApplications } from '@/lib/applications'
import { supabase } from '@/lib/supabase'
import type { JobApplication, ApplicationStatus } from '@/lib/application-types'
import { cn } from '@/src/lib/utils'
import { format, parseISO, differenceInDays } from 'date-fns'

const STATUS_CONFIG: Record<ApplicationStatus, { label: string; color: string; icon: React.ElementType }> = {
  wishlist: { label: 'Wishlist', color: '#3b82f6', icon: Clock }, // Blue
  applied: { label: 'Applied', color: '#8b5cf6', icon: Send }, // Purple
  interview: { label: 'Interview', color: '#f59e0b', icon: Zap }, // Amber
  offer: { label: 'Offer', color: '#10b981', icon: Mail }, // Emerald
  rejected: { label: 'Rejected', color: '#f43f5e', icon: AlertCircle },
}

export default function Dashboard() {
  const router = useRouter()
  const [items, setItems] = useState<JobApplication[]>([])
  const [loading, setLoading] = useState(true)

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  useEffect(() => {
    async function load() {
      try {
        const data = await getApplications()
        setItems((data ?? []) as JobApplication[])
      } catch {
        setItems([])
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [])

  const chartData = useMemo(() => {
    const counts = items.reduce((acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return Object.entries(STATUS_CONFIG)
      .filter(([key]) => key !== 'rejected')
      .map(([key, config]) => ({
        name: config.label,
        value: counts[key] || 0,
        color: config.color,
        status: key,
      }))
  }, [items])

  const upcomingDeadlines = useMemo(() => {
    const todayStart = new Date(new Date().toDateString())
    return items
      .filter((item) => !!item.deadline && new Date(item.deadline) >= todayStart)
      .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime())
      .slice(0, 4)
  }, [items])

  const overdueJobs = useMemo(() => {
    const todayStart = new Date(new Date().toDateString())
    return items.filter(
      (item) => !!item.deadline && new Date(item.deadline) < todayStart
    )
  }, [items])

  const statusBoards = useMemo(() => {
    return (['wishlist', 'applied', 'interview', 'offer'] as ApplicationStatus[]).map((status) => ({
      status,
      jobs: items.filter((item) => item.status === status).slice(0, 3),
    }))
  }, [items])

  if (loading) return <div className="p-10 text-center text-zinc-500">Loading Dashboard...</div>

  return (
    <div className="min-h-screen bg-zinc-50 text-slate-900">
      {/* HEADER */}
      <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/60 shadow-[0_4px_30px_rgb(0,0,0,0.03)] backdrop-blur-2xl">
        <div className="mx-auto max-w-[1400px] px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-lg shadow-slate-900/20">
                <Briefcase size={20} strokeWidth={2.4} />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-slate-900">
                  Job Application Tracker
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/applications"
                className="px-2 text-sm font-semibold text-slate-900 underline underline-offset-4 transition-colors hover:text-slate-600"
              >
                Saved Job List
              </Link>

              <button
                onClick={() => void handleLogout()}
                className="flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition-all duration-200 hover:border-zinc-300 hover:text-slate-900"
                title="Sign out"
              >
                <LogOut size={16} />
                <span>Sign out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1400px] p-6 lg:p-10">
        <div className="mb-8">
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900">Application Summary</h2>
          <p className="text-sm text-zinc-500">Overview of your current job search progress</p>
        </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Left Panel */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
          {/* Analytics Chart */}
          <section className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm">
            <h3 className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-6">Status Overview</h3>
            <div className="flex items-center justify-between gap-4">
              <div className="h-[144px] w-[144px] shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={60}
                      paddingAngle={4}
                      dataKey="value"
                      onClick={() => router.push('/applications')}
                      className="cursor-pointer"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip cursor={{ fill: 'transparent' }} content={() => null} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-2">
                {chartData.map((data) => (
                  <div
                    key={data.status}
                    onClick={() => router.push('/applications')}
                    className="flex items-center justify-between text-xs cursor-pointer hover:bg-zinc-50 p-1 rounded transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: data.color }} />
                      <span className="text-zinc-600">{data.name}</span>
                    </div>
                    <span className="font-semibold">{data.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Overdue Alerts */}
          <section className={cn(
            'rounded-3xl p-6 flex flex-col min-h-[300px]',
            overdueJobs.length > 0 ? 'bg-red-50/50 border border-red-100' : 'bg-white border border-zinc-200'
          )}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={cn(
                'text-[11px] font-bold uppercase tracking-wider',
                overdueJobs.length > 0 ? 'text-red-800' : 'text-zinc-400'
              )}>Overdue</h3>
              {overdueJobs.length > 0 && (
                <span className="bg-red-100 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {overdueJobs.length} ALERT
                </span>
              )}
            </div>

            <div className="space-y-3 overflow-y-auto pr-1">
              {overdueJobs.length > 0 ? (
                overdueJobs.map((job) => (
                  <div key={job.id} className="bg-white border border-red-100 p-3 rounded-xl flex flex-col gap-1 shadow-sm">
                    <span className="text-xs font-bold text-zinc-900">{job.company_name}</span>
                    <span className="text-[11px] text-zinc-500">{job.job_title}</span>
                    <div className="flex items-center gap-1.5 mt-1 text-[10px] font-medium text-red-600">
                      <Clock size={12} />
                      Missed {format(parseISO(job.deadline!), 'MMM d')}
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex-1 flex items-center justify-center text-center p-8">
                  <p className="text-xs text-zinc-400">All clear! No overdue tasks.</p>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Right Panel */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
          {/* Upcoming Deadlines */}
          <section className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm">
            <h3 className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-6">Upcoming Deadlines</h3>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {upcomingDeadlines.length > 0 ? (
                upcomingDeadlines.map((job) => {
                  const daysLeft = differenceInDays(parseISO(job.deadline!), new Date())
                  return (
                    <div key={job.id} className="flex-shrink-0 w-52 bg-zinc-50 border border-zinc-200 rounded-2xl p-4 transition-colors hover:border-zinc-300">
                      <div className="flex justify-between items-start">
                        <span className="text-xs font-bold text-zinc-800 truncate pr-2">{job.company_name}</span>
                        <span className={cn(
                          'text-[9px] px-2 py-0.5 rounded-full font-bold',
                          daysLeft <= 3 ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                        )}>
                          {daysLeft === 0 ? 'TODAY' : `${daysLeft} DAYS`}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-500 mt-1 truncate">{job.job_title}</p>
                      <p className="text-[10px] text-zinc-400 mt-4">Deadline: {format(parseISO(job.deadline!), 'MMM d, yyyy')}</p>
                    </div>
                  )
                })
              ) : (
                <div className="w-full flex items-center justify-center h-24 border border-dashed border-zinc-200 rounded-2xl">
                  <p className="text-xs text-zinc-400">No imminent deadlines found.</p>
                </div>
              )}
            </div>
          </section>

          {/* Kanban Columns */}
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {statusBoards.map(({ status, jobs }) => (
              <div key={status} className="flex flex-col gap-3">
                <div className="flex items-center justify-between px-2">
                  <span className="text-[11px] font-bold text-zinc-500 uppercase">{STATUS_CONFIG[status].label}</span>
                  <span className="text-[10px] font-bold bg-zinc-200 text-zinc-600 px-2 py-0.5 rounded-full">
                    {items.filter((i) => i.status === status).length}
                  </span>
                </div>

                <div className="flex flex-col gap-2">
                  {jobs.map((job) => (
                    <div
                      key={job.id}
                      className={cn(
                        'bg-white border border-zinc-200 p-3 rounded-2xl shadow-sm transition-all hover:border-zinc-400 cursor-pointer',
                        status === 'applied' && 'border-l-4 border-l-purple-500',
                        status === 'interview' && 'border-l-4 border-l-amber-500',
                        status === 'offer' && 'border-l-4 border-l-emerald-500',
                      )}
                      onClick={() => router.push(`/applications/${job.id}/edit`)}
                    >
                      <p className="text-xs font-bold text-zinc-900">{job.company_name}</p>
                      <p className="text-[10px] text-zinc-500 truncate">{job.job_title}</p>
                    </div>
                  ))}

                  <Link
                    href="/applications"
                    className="flex w-full items-center justify-center py-2 text-[10px] font-bold text-zinc-400 hover:text-zinc-800 transition-colors"
                  >
                    View all
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Job Shortcut */}
      <section className="mt-12 rounded-3xl border-2 border-dashed border-zinc-200 p-12 text-center bg-white/50">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-400">
          <Briefcase size={32} />
        </div>
        <h2 className="mb-2 text-2xl font-bold text-zinc-900">
          {items.length === 0 ? 'Add your first job' : 'Add a new job'}
        </h2>
        <p className="mb-8 text-zinc-500">
          {items.length === 0
            ? "Right now it's a bit empty. Find a job that you like and track it here."
            : 'Found a job you like? Add it and keep tracking your applications.'}
        </p>
        <Link
          href="/applications/new"
          className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-8 py-3 text-sm font-semibold text-white transition-all hover:bg-zinc-800 active:scale-95 shadow-sm"
        >
          <Plus size={20} />
          Add Job
        </Link>
      </section>

      </main>
    </div>
  )
}
