'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { getApplicationById, updateApplication } from '@/lib/applications'
import type { ApplicationStatus } from '@/lib/application-types'

export default function EditApplicationPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [companyName, setCompanyName] = useState('')
  const [jobTitle, setJobTitle] = useState('')
  const [jobUrl, setJobUrl] = useState('')
  const [location, setLocation] = useState('')
  const [status, setStatus] = useState<ApplicationStatus>('wishlist')
  const [appliedDate, setAppliedDate] = useState('')
  const [deadline, setDeadline] = useState('')
  const [notes, setNotes] = useState('')

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadApplication() {
      try {
        const app = await getApplicationById(id)

        setCompanyName(app.company_name ?? '')
        setJobTitle(app.job_title ?? '')
        setJobUrl(app.job_url ?? '')
        setLocation(app.location ?? '')
        setStatus(app.status ?? 'wishlist')
        setAppliedDate(app.applied_date ?? '')
        setDeadline(app.deadline ?? '')
        setNotes(app.notes ?? '')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load application')
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      loadApplication()
    }
  }, [id])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setSaving(true)

    try {
      await updateApplication(id, {
        company_name: companyName,
        job_title: jobTitle,
        job_url: jobUrl,
        location,
        status,
        applied_date: appliedDate,
        deadline,
        notes,
      })

      router.push('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update application')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <main style={{ padding: '24px' }}>Loading application...</main>
  }

  return (
    <main style={{ maxWidth: '700px', margin: '40px auto', padding: '24px' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '20px' }}>Edit Job Application</h1>

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '14px' }}>
        <div>
          <label>Company Name *</label>
          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            required
            style={inputStyle}
          />
        </div>

        <div>
          <label>Job Title *</label>
          <input
            type="text"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            required
            style={inputStyle}
          />
        </div>

        <div>
          <label>Job URL</label>
          <input
            type="text"
            value={jobUrl}
            onChange={(e) => setJobUrl(e.target.value)}
            style={inputStyle}
          />
        </div>

        <div>
          <label>Location</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            style={inputStyle}
          />
        </div>

        <div>
          <label>Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as ApplicationStatus)}
            style={inputStyle}
          >
            <option value="wishlist">wishlist</option>
            <option value="applied">applied</option>
            <option value="interview">interview</option>
            <option value="offer">offer</option>
            <option value="rejected">rejected</option>
          </select>
        </div>

        <div>
          <label>Applied Date</label>
          <input
            type="date"
            value={appliedDate}
            onChange={(e) => setAppliedDate(e.target.value)}
            style={inputStyle}
          />
        </div>

        <div>
          <label>Deadline</label>
          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            style={inputStyle}
          />
        </div>

        <div>
          <label>Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            style={{ ...inputStyle, resize: 'vertical' }}
          />
        </div>

        {error && <p style={{ color: 'red' }}>{error}</p>}

        <div style={{ display: 'flex', gap: '12px' }}>
          <button type="submit" disabled={saving} style={buttonStyle}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>

          <button
            type="button"
            onClick={() => router.push('/dashboard')}
            style={secondaryButtonStyle}
          >
            Cancel
          </button>
        </div>
      </form>
    </main>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  marginTop: '6px',
  padding: '10px',
  border: '1px solid #ccc',
  borderRadius: '8px',
}

const buttonStyle: React.CSSProperties = {
  padding: '10px 14px',
  borderRadius: '8px',
  border: 'none',
  cursor: 'pointer',
}

const secondaryButtonStyle: React.CSSProperties = {
  padding: '10px 14px',
  borderRadius: '8px',
  border: '1px solid #ccc',
  cursor: 'pointer',
  background: 'white',
}