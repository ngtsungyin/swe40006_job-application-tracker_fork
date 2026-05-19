'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser, signOut } from '@/lib/auth'
import { getApplications, deleteApplication } from '@/lib/applications'
import type { JobApplication } from '@/lib/application-types'

export default function DashboardPage() {
  const router = useRouter()

  const [userEmail, setUserEmail] = useState('')
  const [applications, setApplications] = useState<JobApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)

  async function loadApplications() {
    try {
      const user = await getCurrentUser()

      if (!user) {
        router.push('/login')
        return
      }

      setUserEmail(user.email ?? '')

      const data = await getApplications()
      setApplications(data ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadApplications()
  }, [])

  async function handleLogout() {
    try {
      await signOut()
      router.push('/login')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to log out')
    }
  }

  async function handleDelete(appId: string) {
    const confirmed = window.confirm(
      'Are you sure you want to delete this application?'
    )

    if (!confirmed) return

    try {
      setError('')
      setActionLoadingId(appId)

      await deleteApplication(appId)
      await loadApplications()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete application')
    } finally {
      setActionLoadingId(null)
    }
  }

  if (loading) {
    return <main style={{ padding: '24px' }}>Loading...</main>
  }

  return (
    <main style={{ padding: '24px' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '20px',
          alignItems: 'center',
        }}
      >
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>Dashboard</h1>
          <p>Logged in as: {userEmail}</p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <Link
            href="/dashboard/add"
            style={{
              height: '40px',
              padding: '10px 14px',
              borderRadius: '8px',
              border: '1px solid #ccc',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              color: 'inherit',
            }}
          >
            Add Application
          </Link>

          <button
            onClick={handleLogout}
            style={{
              height: '40px',
              padding: '0 14px',
              borderRadius: '8px',
              border: '1px solid #ccc',
              cursor: 'pointer',
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {error && <p style={{ color: 'red', marginBottom: '12px' }}>{error}</p>}

      <h2 style={{ marginBottom: '12px' }}>Applications</h2>

      {applications.length === 0 ? (
        <p>No applications found.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={thStyle}>Company</th>
              <th style={thStyle}>Job Title</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Applied Date</th>
              <th style={thStyle}>Location</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((app) => (
              <tr key={app.id}>
                <td style={tdStyle}>{app.company_name}</td>
                <td style={tdStyle}>{app.job_title}</td>
                <td style={tdStyle}>{app.status}</td>
                <td style={tdStyle}>{app.applied_date ?? '-'}</td>
                <td style={tdStyle}>{app.location ?? '-'}</td>
                <td style={tdStyle}>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <Link
                      href={`/dashboard/edit/${app.id}`}
                      style={{
                        padding: '6px 10px',
                        borderRadius: '6px',
                        border: '1px solid #ccc',
                        textDecoration: 'none',
                        color: 'inherit',
                      }}
                    >
                      Edit
                    </Link>

                    <button
                      onClick={() => handleDelete(app.id)}
                      disabled={actionLoadingId === app.id}
                      style={deleteButtonStyle}
                    >
                      {actionLoadingId === app.id ? 'Working...' : 'Delete'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  )
}

const thStyle: React.CSSProperties = {
  textAlign: 'left',
  borderBottom: '1px solid #ccc',
  padding: '10px',
}

const tdStyle: React.CSSProperties = {
  borderBottom: '1px solid #eee',
  padding: '10px',
  verticalAlign: 'top',
}

const deleteButtonStyle: React.CSSProperties = {
  padding: '6px 10px',
  borderRadius: '6px',
  border: '1px solid #d33',
  cursor: 'pointer',
  background: 'white',
  color: '#d33',
}