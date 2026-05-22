import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { jest } from '@jest/globals'

const mockRouterReplace = jest.fn()
const mockGetUser = jest.fn()
const mockUnsubscribe = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: mockRouterReplace,
  }),
}))

jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: mockGetUser,
      onAuthStateChange: jest.fn(() => ({
        data: {
          subscription: {
            unsubscribe: mockUnsubscribe,
          },
        },
      })),
    },
  },
}))

import AuthGuard from '@/src/components/auth-guard'

describe('AuthGuard', () => {
  beforeEach(() => {
    mockGetUser.mockClear()
    mockRouterReplace.mockClear()
    mockUnsubscribe.mockClear()
  })

  test('shows loading state while checking session', () => {
    mockGetUser.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ data: { user: null } }), 100))
    )

    render(
      <AuthGuard>
        <div>Protected Content</div>
      </AuthGuard>
    )

    expect(screen.getByText(/Checking session/i)).toBeInTheDocument()
  })

  test('renders protected content when user is authenticated', async () => {
    mockGetUser.mockResolvedValue({
      data: {
        user: {
          id: 'user123',
          email: 'test@example.com',
        },
      },
    })

    render(
      <AuthGuard>
        <div>Protected Content</div>
      </AuthGuard>
    )

    await waitFor(() => {
      expect(screen.getByText(/Protected Content/i)).toBeInTheDocument()
    })
  })

  test('redirects to login when user is not authenticated', async () => {
    mockGetUser.mockResolvedValue({
      data: {
        user: null,
      },
    })

    render(
      <AuthGuard>
        <div>Protected Content</div>
      </AuthGuard>
    )

    await waitFor(() => {
      expect(mockRouterReplace).toHaveBeenCalledWith('/login')
    })
  })

  test('calls getUser to check authentication', async () => {
    mockGetUser.mockResolvedValue({
      data: {
        user: {
          id: 'user123',
          email: 'test@example.com',
        },
      },
    })

    render(
      <AuthGuard>
        <div>Protected Content</div>
      </AuthGuard>
    )

    await waitFor(() => {
      expect(mockGetUser).toHaveBeenCalled()
    })
  })
})
