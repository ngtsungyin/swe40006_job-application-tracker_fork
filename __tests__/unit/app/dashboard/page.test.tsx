import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { jest } from '@jest/globals'
import type { JobApplication } from '@/lib/application-types'

const mockRouterPush = jest.fn()
const mockGetApplications = jest.fn()
const mockSignOut = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockRouterPush,
    replace: jest.fn(),
  }),
}))

jest.mock('next/link', () => (props: any) => props.children)

jest.mock('@/lib/applications', () => ({
  getApplications: mockGetApplications,
}))

jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signOut: mockSignOut,
    },
  },
}))

import Dashboard from '@/app/dashboard/page'

const mockApplications: JobApplication[] = [
  {
    id: '1',
    user_id: 'user1',
    company: 'Tech Corp',
    position: 'Senior Developer',
    status: 'applied',
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

describe('Dashboard Page', () => {
  beforeEach(() => {
    mockGetApplications.mockClear()
    mockSignOut.mockClear()
    mockRouterPush.mockClear()
  })

  test('renders loading state initially', () => {
    mockGetApplications.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve([]), 100))
    )
    render(<Dashboard />)
    expect(screen.getByText(/Loading Dashboard/i)).toBeInTheDocument()
  })

  test('renders page title after loading', async () => {
    mockGetApplications.mockResolvedValue(mockApplications)
    render(<Dashboard />)
    await waitFor(() => {
      expect(screen.getByText(/Job Application Tracker/i)).toBeInTheDocument()
    })
  })

  test('loads applications on mount', async () => {
    mockGetApplications.mockResolvedValue(mockApplications)
    render(<Dashboard />)
    await waitFor(() => {
      expect(mockGetApplications).toHaveBeenCalled()
    })
  })

  test('handles empty applications list', async () => {
    mockGetApplications.mockResolvedValue([])
    render(<Dashboard />)
    await waitFor(() => {
      expect(screen.getByText(/Application Summary/i)).toBeInTheDocument()
    })
  })

  test('signs out user when logout button clicked', async () => {
    mockGetApplications.mockResolvedValue(mockApplications)
    mockSignOut.mockResolvedValue({})

    const user = userEvent.setup()
    render(<Dashboard />)

    await waitFor(() => {
      expect(screen.getByText(/Sign out/i)).toBeInTheDocument()
    })

    const logoutButton = screen.getByRole('button', { name: /Sign out/i })
    await user.click(logoutButton)

    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalled()
      expect(mockRouterPush).toHaveBeenCalledWith('/login')
    })
  })
})
