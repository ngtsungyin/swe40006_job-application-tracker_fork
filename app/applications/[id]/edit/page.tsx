'use client'

export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState, type ReactNode, type SyntheticEvent } from 'react'
import { Building2, Briefcase, AlignLeft, MapPin, ExternalLink, Calendar, AlignJustify, Trash2 } from 'lucide-react'
import { deleteApplication, getApplicationById, updateApplication } from '@/lib/applications'
import type { ApplicationStatus, JobApplication, UpdateApplicationInput } from '@/lib/application-types'

const STATUS_OPTIONS: { value: ApplicationStatus; label: string }[] = [
  { value: 'wishlist', label: 'Wishlist' },
  { value: 'applied', label: 'Applied' },
  { value: 'interview', label: 'Interview' },
  { value: 'offer', label: 'Offer' },
  { value: 'rejected', label: 'Rejected' },
]

const INPUT =
  'h-10 w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-3 text-sm text-zinc-800 transition-all focus:border-zinc-900 focus:bg-white focus:outline-none focus:ring-4 focus:ring-zinc-900/5 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-100 dark:focus:border-zinc-100 dark:focus:bg-zinc-900'

export default function EditApplicationPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const id = params.id

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState<UpdateApplicationInput>({
    company_name: '',
    job_title: '',
    status: 'wishlist',
    job_url: '',
    location: '',
    applied_date: '',
    deadline: '',
    notes: '',
  })

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        setError(null)
        const item = (await getApplicationById(id)) as JobApplication
        setForm({
          company_name: item.company_name ?? '',
          job_title: item.job_title ?? '',
          status: item.status ?? 'wishlist',
          job_url: item.job_url ?? '',
          location: item.location ?? '',
          applied_date: item.applied_date ?? '',
          deadline: item.deadline ?? '',
          notes: item.notes ?? '',
        })
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load application')
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [id])

  async function handleSubmit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      if (!form.company_name?.trim() || !form.job_title?.trim()) {
        throw new Error('Company name and job title are required')
      }
      await updateApplication(id, {
        company_name: form.company_name.trim(),
        job_title: form.job_title.trim(),
        status: form.status,
        job_url: form.job_url?.trim() || undefined,
        location: form.location?.trim() || undefined,
        applied_date: form.applied_date?.trim() || undefined,
        deadline: form.deadline?.trim() || undefined,
        notes: form.notes?.trim() || undefined,
      })
      router.push('/applications')
    } catch (e2) {
      setError(e2 instanceof Error ? e2.message : 'Failed to update application')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!window.confirm('Delete this application?')) return
    setSaving(true)
    setError(null)
    try {
      await deleteApplication(id)
      router.push('/applications')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete application')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
        <p className="text-sm text-zinc-400">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-8 dark:bg-black sm:px-6 lg:py-12">
      <div className="mx-auto max-w-2xl">
        <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-xl shadow-zinc-200/50 dark:border-zinc-800 dark:bg-zinc-950 dark:shadow-none">

          {/* Header */}
          <div className="border-b border-zinc-100 p-8 dark:border-zinc-900">
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
              Edit application
            </h1>
            <p className="mt-1 text-sm text-zinc-500">
              Update the details of your job application
              {form.company_name ? ` at ${form.company_name}.` : '.'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8">
            <div className="grid gap-6">

              {/* Company + Position */}
              <div className="grid gap-6 sm:grid-cols-2">
                <Field label="Company" icon={<Building2 className="h-4 w-4" />}>
                  <input
                    className={INPUT}
                    placeholder="e.g. Acme Inc"
                    value={form.company_name ?? ''}
                    onChange={(e) => setForm((p) => ({ ...p, company_name: e.target.value }))}
                    required
                  />
                </Field>
                <Field label="Position" icon={<Briefcase className="h-4 w-4" />}>
                  <input
                    className={INPUT}
                    placeholder="e.g. Senior Developer"
                    value={form.job_title ?? ''}
                    onChange={(e) => setForm((p) => ({ ...p, job_title: e.target.value }))}
                    required
                  />
                </Field>
              </div>

              {/* Status + Location */}
              <div className="grid gap-6 sm:grid-cols-2">
                <Field label="Status" icon={<AlignLeft className="h-4 w-4" />}>
                  <select
                    className={INPUT + ' appearance-none cursor-pointer'}
                    value={form.status ?? 'wishlist'}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, status: e.target.value as ApplicationStatus }))
                    }
                  >
                    {STATUS_OPTIONS.map(({ value, label }) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Location" icon={<MapPin className="h-4 w-4" />}>
                  <input
                    className={INPUT}
                    placeholder="e.g. Remote / New York"
                    value={form.location ?? ''}
                    onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
                  />
                </Field>
              </div>

              {/* URL */}
              <Field label="URL" icon={<ExternalLink className="h-4 w-4" />}>
                <input
                  className={INPUT}
                  placeholder="https://company.com/careers/..."
                  value={form.job_url ?? ''}
                  onChange={(e) => setForm((p) => ({ ...p, job_url: e.target.value }))}
                />
              </Field>

              {/* Applied + Deadline */}
              <div className="grid gap-6 sm:grid-cols-2">
                <Field label="Applied" icon={<Calendar className="h-4 w-4" />}>
                  <input
                    type="date"
                    className={INPUT}
                    value={form.applied_date ?? ''}
                    onChange={(e) => setForm((p) => ({ ...p, applied_date: e.target.value }))}
                  />
                </Field>
                <Field label="Deadline" icon={<Calendar className="h-4 w-4" />}>
                  <input
                    type="date"
                    className={INPUT}
                    value={form.deadline ?? ''}
                    onChange={(e) => setForm((p) => ({ ...p, deadline: e.target.value }))}
                  />
                </Field>
              </div>

              {/* Notes */}
              <Field label="Notes" icon={<AlignJustify className="h-4 w-4" />}>
                <textarea
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-3 py-2 text-sm text-zinc-800 transition-all focus:border-zinc-900 focus:bg-white focus:outline-none focus:ring-4 focus:ring-zinc-900/5 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-100 dark:focus:border-zinc-100 dark:focus:bg-zinc-900"
                  placeholder="Keep track of interviews, contacts, or follow-ups..."
                  value={form.notes ?? ''}
                  onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                  rows={4}
                />
              </Field>

              {/* Error */}
              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-200">
                  {error}
                </div>
              )}

              {/* Actions */}
              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  onClick={() => void handleDelete()}
                  disabled={saving}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-5 text-sm font-medium text-red-600 transition-all hover:bg-red-50 disabled:opacity-50 dark:border-red-900/50 dark:bg-zinc-950 dark:text-red-400 dark:hover:bg-red-950/30"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Application
                </button>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <Link
                    href="/applications"
                    className="inline-flex h-11 items-center justify-center rounded-xl border border-zinc-200 bg-white px-5 text-sm font-medium text-zinc-600 transition-all hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-900"
                  >
                    Cancel
                  </Link>
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-zinc-900 px-8 text-sm font-semibold text-white shadow-lg shadow-zinc-900/20 transition-all hover:bg-zinc-800 active:scale-95 disabled:opacity-50 dark:bg-zinc-100 dark:text-black dark:shadow-none dark:hover:bg-zinc-200"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>

            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

function Field({
  label,
  icon,
  children,
}: {
  label: string
  icon?: ReactNode
  children: ReactNode
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 px-1">
        <div className="text-zinc-400 dark:text-zinc-500">{icon}</div>
        <label className="text-[13px] font-semibold text-zinc-700 dark:text-zinc-300">
          {label}
        </label>
      </div>
      {children}
    </div>
  )
}
