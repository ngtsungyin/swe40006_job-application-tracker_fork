'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import {
  Search,
  Plus,
  Trash2,
  ExternalLink,
  MapPin,
  Calendar,
  Briefcase,
  Zap,
  ChevronRight,
  TrendingUp,
  LayoutGrid,
  List,
  Clock,
  Send,
  LogOut,
  Mail,
} from 'lucide-react'

import { getApplications, deleteApplication } from '@/lib/applications'
import type { ApplicationStatus, JobApplication } from '@/lib/application-types'
import { supabase } from '@/lib/supabase'

const STATUS_STYLE: Record<
  ApplicationStatus,
  {
    container: string
    dot: string
  }
> = {
  wishlist: {
    container: 'bg-slate-100 text-slate-600 border-zinc-200',
    dot: 'bg-slate-400',
  },

  applied: {
    container: 'bg-sky-50 text-sky-700 border-sky-100',
    dot: 'bg-sky-500',
  },

  interview: {
    container: 'bg-amber-50 text-amber-700 border-amber-100',
    dot: 'bg-amber-500',
  },

  offer: {
    container: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    dot: 'bg-emerald-500',
  },

  rejected: {
    container: 'bg-rose-50 text-rose-700 border-rose-100',
    dot: 'bg-rose-500',
  },
}

const STATUS_LABEL: Record<ApplicationStatus, string> = {
  wishlist: 'Wishlist',
  applied: 'Applied',
  interview: 'Interview',
  offer: 'Offer',
  rejected: 'Rejected',
}

const AVATAR_COLORS = [
  'from-indigo-500 to-indigo-600',
  'from-violet-500 to-violet-600',
  'from-cyan-500 to-cyan-600',
  'from-emerald-500 to-emerald-600',
  'from-pink-500 to-pink-600',
  'from-blue-500 to-blue-600',
]

function avatarColor(name: string): string {
  let hash = 0

  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }

  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—'

  const d = new Date(dateStr)

  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

type FilterStatus = 'all' | ApplicationStatus

export default function ApplicationsPage() {
  const router = useRouter()
  const [items, setItems] = useState<JobApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<FilterStatus>('all')

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  async function loadApplications() {
    try {
      setLoading(true)
      setError(null)

      const data = await getApplications()

      setItems((data ?? []) as JobApplication[])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load applications')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadApplications()
  }, [])

  async function handleDelete(id: string) {
    if (!window.confirm('Delete this application?')) return

    try {
      await deleteApplication(id)

      setItems((prev) => prev.filter((item) => item.id !== id))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete application')
    }
  }

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const q = search.toLowerCase()

      const matchesSearch =
        !q ||
        item.company_name.toLowerCase().includes(q) ||
        item.job_title.toLowerCase().includes(q) ||
        (item.location?.toLowerCase().includes(q) ?? false)

      const matchesFilter = filter === 'all' || item.status === filter

      return matchesSearch && matchesFilter
    })
  }, [items, search, filter])

  const stats = useMemo(() => {
    const interviewCount = items.filter(
      (i) => i.status === 'interview'
    ).length

    const offerCount = items.filter(
      (i) => i.status === 'offer'
    ).length

    const respondedCount = items.filter(
      (i) =>
        i.status === 'interview' ||
        i.status === 'offer' ||
        i.status === 'rejected'
    ).length

    const responseRate =
      items.length > 0
        ? Math.round((respondedCount / items.length) * 100)
        : 0

    return {
      interviewCount,
      offerCount,
      responseRate,
    }
  }, [items])

  const filters: {
    key: FilterStatus
    label: string
    icon: React.ReactNode
  }[] = [
    {
      key: 'all',
      label: 'All Applications',
      icon: <LayoutGrid size={14} />,
    },

    {
      key: 'wishlist',
      label: 'Wishlist',
      icon: <Clock size={14} />,
    },

    {
      key: 'applied',
      label: 'Applied',
      icon: <Send size={14} />,
    },

    {
      key: 'interview',
      label: 'Interviews',
      icon: <Zap size={14} />,
    },

    {
      key: 'offer',
      label: 'Offers',
      icon: <Mail size={14} />,
    },
  ]

  return (
    <div className="min-h-screen bg-zinc-50 text-slate-900">
      {/* HEADER */}

      <header
        className="
          sticky top-0 z-30
          border-b border-zinc-200
          bg-white/60
          shadow-[0_4px_30px_rgb(0,0,0,0.03)]
          backdrop-blur-2xl
        "
      >
        <div className="mx-auto max-w-[1400px] px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                title="Back to Dashboard"
                className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-lg shadow-slate-900/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-800"
              >
                <Briefcase size={20} strokeWidth={2.4} />
              </Link>

              <div>
                <h1 className="text-xl font-bold tracking-tight text-slate-900">
                  Job Application Tracker
                </h1>


              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/applications/new"
                className="
                  group flex items-center gap-2
                  rounded-full
                  bg-slate-900
                  px-5 py-2.5
                  text-sm font-semibold text-white
                  shadow-lg shadow-slate-200/50
                  transition-all duration-200
                  hover:-translate-y-0.5
                  hover:bg-slate-800
                "
              >
                <Plus
                  size={18}
                  className="transition-transform group-hover:rotate-90"
                />

                <span>New Application</span>
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

      <motion.main
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="mx-auto max-w-[1400px] px-6 py-8"
      >
        {/* ERROR */}

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* STATS */}

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            value={items.length}
            label="Total Applications"
            icon={<List size={24} />}
            color="bg-sky-500"
          />

          <StatCard
            value={stats.interviewCount}
            label="Interviews"
            icon={<Zap size={24} />}
            color="bg-amber-500"
          />

          <StatCard
            value={stats.offerCount}
            label="Offers Received"
            icon={<Mail size={24} />}
            color="bg-emerald-500"
          />

          <StatCard
            value={`${stats.responseRate}%`}
            label="Employer Responses"
            icon={<TrendingUp size={24} />}
            color="bg-sky-400"
          />
        </div>

        {/* CONTROLS */}

        <div className="mt-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            {filters.map(({ key, label, icon }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`
                  flex items-center gap-2
                  rounded-full
                  border
                  px-5 py-2.5
                  text-sm font-semibold
                  transition-all duration-200
                  ${
                    filter === key
                      ? 'border-slate-900 bg-slate-900 text-white shadow-lg shadow-slate-900/10'
                      : 'border-zinc-200 bg-white text-slate-600 backdrop-blur-xl hover:border-zinc-300 hover:bg-white'
                  }
                `}
              >
                {icon}

                <span>{label}</span>
              </button>
            ))}
          </div>

          <div className="relative w-full lg:w-96">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />

            <input
              type="text"
              placeholder="Search companies, positions, or locations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="
                w-full
                rounded-2xl
                border border-zinc-200
                bg-white
                py-3 pl-12 pr-4
                text-sm text-slate-900
                placeholder:text-slate-400
                shadow-sm
                backdrop-blur-xl
                transition-all
                focus:border-sky-500
                focus:outline-none
                focus:ring-4
                focus:ring-sky-500/20
                focus:shadow-[0_0_0_6px_rgba(14,165,233,0.08)]
              "
            />
          </div>
        </div>

        {/* TABLE */}

        <div className="mt-8 overflow-hidden rounded-3xl border border-zinc-200 bg-white backdrop-blur-xl">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  {[
                    'Company',
                    'Position',
                    'Status',
                    'Location',
                    'URL',
                    'Timeline',
                    'Notes',
                    '',
                  ].map((col) => (
                    <th
                      key={col}
                      className={`
                        px-6 py-5
                        text-[11px]
                        font-bold uppercase
                        tracking-[0.15em]
                        text-slate-400
                        ${col === '' ? 'text-right' : ''}
                      `}
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                <AnimatePresence mode="popLayout">
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-24 text-center">
                        <div className="flex flex-col items-center gap-4">
                          <div className="relative h-10 w-10">
                            <div className="absolute inset-0 rounded-full border-2 border-sky-200" />

                            <div className="absolute inset-0 animate-spin rounded-full border-2 border-sky-500 border-t-transparent" />
                          </div>

                          <p className="font-medium text-slate-500">
                            Loading applications...
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-28 text-center">
                        <div className="mx-auto flex max-w-xs flex-col items-center">
                          <div
                            className="
                              relative mb-6
                              rounded-[28px]
                              bg-gradient-to-br from-sky-50 to-slate-50
                              p-6
                              text-sky-500
                              shadow-inner
                            "
                          >
                            <div className="absolute inset-0 rounded-[28px] border border-zinc-200" />

                            <Search size={34} className="relative z-10" />
                          </div>

                          <h4 className="text-lg font-semibold text-slate-900">
                            No applications found
                          </h4>

                          <p className="mt-2 text-sm text-slate-500">
                            {items.length === 0
                              ? 'Start tracking your first application.'
                              : 'Try adjusting your search or filters.'}
                          </p>

                          {items.length > 0 && (
                            <button
                              onClick={() => {
                                setSearch('')
                                setFilter('all')
                              }}
                              className="mt-6 text-sm font-semibold text-sky-600 hover:text-sky-700"
                            >
                              Clear all filters
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filtered.map((item, idx) => {
                      const color = avatarColor(item.company_name)

                      const status =
                        STATUS_STYLE[item.status] ??
                        STATUS_STYLE.wishlist

                      return (
                        <motion.tr
                          key={item.id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.98 }}
                          whileHover={{
                            scale: 1.004,
                            backgroundColor: 'rgba(255,255,255,0.95)',
                            boxShadow:
                              '0 20px 25px -5px rgb(0 0 0 / 0.04), 0 10px 10px -5px rgb(0 0 0 / 0.03)',
                          }}
                          transition={{ delay: idx * 0.02 }}
                          className="
                            group
                            transition-all duration-200
                          "
                        >
                          {/* COMPANY */}

                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              <div
                                className={`
                                  flex h-11 w-11 shrink-0 items-center justify-center
                                  rounded-2xl
                                  bg-gradient-to-br
                                  ${color}
                                  text-sm font-bold text-white
                                  shadow-md
                                `}
                              >
                                {item.company_name.charAt(0).toUpperCase()}
                              </div>

                              <div>
                                <p className="font-semibold text-slate-900">
                                  {item.company_name}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* POSITION */}

                          <td className="px-6 py-5">
                            <p className="font-medium text-slate-700">
                              {item.job_title}
                            </p>
                          </td>

                          {/* STATUS */}

                          <td className="px-6 py-5">
                            <div
                              className={`
                                inline-flex items-center gap-2
                                rounded-full border
                                px-3 py-1
                                text-xs font-bold
                                ${status.container}
                              `}
                            >
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${status.dot}`}
                              />

                              {STATUS_LABEL[item.status]}
                            </div>
                          </td>

                          {/* LOCATION */}

                          <td className="px-6 py-5">
                            <div className="flex items-center gap-2 text-sm text-slate-500">
                              <MapPin size={14} className="text-slate-400" />

                              <span>{item.location ?? '—'}</span>
                            </div>
                          </td>

                          {/* URL */}

                          <td className="px-6 py-5">
                            {item.job_url ? (
                              <a
                                href={item.job_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="
                                  inline-flex items-center gap-1.5
                                  rounded-xl
                                  border border-zinc-200
                                  bg-white
                                  px-3 py-2
                                  text-xs font-semibold text-slate-700
                                  transition-all
                                  hover:border-sky-200
                                  hover:text-sky-600
                                "
                              >
                                <span>View Job</span>

                                <ExternalLink size={12} />
                              </a>
                            ) : (
                              <span className="text-slate-300">—</span>
                            )}
                          </td>

                          {/* TIMELINE */}

                          <td className="px-6 py-5">
                            <div className="space-y-3">
                              <div>
                                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                  Applied
                                </p>

                                <div className="mt-1 flex items-center gap-2 text-xs font-medium text-sky-600">
                                  <Calendar
                                    size={14}
                                    className="text-sky-400"
                                  />

                                  <span>
                                    {formatDate(item.applied_date)}
                                  </span>
                                </div>
                              </div>

                              <div>
                                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                  Deadline
                                </p>

                                {(() => {
                                  const isOverdue = item.deadline
                                    ? new Date(item.deadline) < new Date(new Date().toDateString())
                                    : false
                                  return (
                                    <div className={`mt-1 flex items-center gap-2 text-xs font-medium ${isOverdue ? 'text-rose-600' : 'text-amber-600'}`}>
                                      <Clock
                                        size={14}
                                        className={isOverdue ? 'text-rose-400' : 'text-amber-400'}
                                      />
                                      <span>{formatDate(item.deadline)}</span>
                                      {isOverdue && (
                                        <span className="rounded-full bg-rose-100 px-1.5 py-0.5 text-[10px] font-bold text-rose-600">
                                          Overdue
                                        </span>
                                      )}
                                    </div>
                                  )
                                })()}
                              </div>
                            </div>
                          </td>

                          {/* NOTES */}

                          <td className="px-6 py-5">
                            <span
                              className="block text-sm text-slate-500 whitespace-pre-wrap break-words max-w-[240px]"
                            >
                              {item.notes ?? '—'}
                            </span>
                          </td>

                          {/* ACTIONS */}

                          <td className="px-6 py-5 text-right">
                            <div className="flex items-center justify-end gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                              <button
                                onClick={() => void handleDelete(item.id)}
                                className="
                                  flex h-9 w-9 items-center justify-center
                                  rounded-xl
                                  text-slate-400
                                  transition-colors
                                  hover:bg-rose-50
                                  hover:text-rose-600
                                "
                                title="Delete"
                              >
                                <Trash2 size={16} />
                              </button>

                              <Link
                                href={`/applications/${item.id}/edit`}
                                className="
                                  flex h-9 w-9 items-center justify-center
                                  rounded-xl
                                  text-slate-400
                                  transition-colors
                                  hover:bg-slate-100
                                  hover:text-slate-900
                                "
                                title="Edit"
                              >
                                <ChevronRight size={18} />
                              </Link>
                            </div>
                          </td>
                        </motion.tr>
                      )
                    })
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {/* FOOTER */}

          <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/40 px-6 py-4">
            <p className="text-sm text-slate-500">
              Showing{' '}
              <span className="font-semibold text-slate-900">
                {filtered.length}
              </span>{' '}
              of{' '}
              <span className="font-semibold text-slate-900">
                {items.length}
              </span>{' '}
              applications
            </p>
          </div>
        </div>
      </motion.main>
    </div>
  )
}

interface StatCardProps {
  value: string | number
  label: string
  icon: React.ReactNode
  color: string
}

function StatCard({
  value,
  label,
  icon,
  color,
}: StatCardProps) {
  const glowMap: Record<string, string> = {
    'bg-sky-500': 'bg-sky-500/10 text-sky-600',

    'bg-amber-500': 'bg-amber-500/10 text-amber-600',

    'bg-emerald-500': 'bg-emerald-500/10 text-emerald-600',

    'bg-sky-400': 'bg-sky-400/10 text-sky-500',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className="
        relative overflow-hidden
        rounded-3xl
        border border-zinc-200
        bg-white
        p-6
        backdrop-blur-xl
      "
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
            {label}
          </p>

          <h3 className="mt-3 text-4xl font-bold tracking-tight text-slate-900">
            {value}
          </h3>
        </div>

        <div
          className={`
            flex h-14 w-14 items-center justify-center
            rounded-2xl
            ${glowMap[color]}
          `}
        >
          {icon}
        </div>
      </div>

      <div
        className={`
          absolute bottom-0 left-0 h-[3px] w-full
          opacity-70
          ${color}
        `}
      />
    </motion.div>
  )
}
