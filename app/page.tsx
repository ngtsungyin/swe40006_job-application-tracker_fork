import Link from 'next/link'

export default function HomePage() {
  return (
    <main style={{ maxWidth: 700, margin: '80px auto', padding: '24px' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '16px' }}>
        Job Application Tracker
      </h1>

      <p style={{ marginBottom: '24px' }}>
        A simple web application for managing job applications with authentication,
        CRUD features, and a DevOps deployment pipeline.
      </p>

      <div style={{ display: 'flex', gap: '12px' }}>
        <Link
          href="/login"
          style={{
            padding: '10px 14px',
            border: '1px solid #ccc',
            borderRadius: '8px',
            textDecoration: 'none',
          }}
        >
          Go to Login
        </Link>

        <Link
          href="/dashboard"
          style={{
            padding: '10px 14px',
            border: '1px solid #ccc',
            borderRadius: '8px',
            textDecoration: 'none',
          }}
        >
          Go to Dashboard
        </Link>
      </div>
    </main>
  )
}