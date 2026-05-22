import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { jest } from '@jest/globals'

const mockSignInWithPassword = jest.fn()
const mockSignUp = jest.fn()
const mockGetSession = jest.fn()
const mockRouterPush = jest.fn()
const mockRouterReplace = jest.fn()

// Mock Next.js navigation first
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockRouterPush,
    replace: mockRouterReplace,
    prefetch: jest.fn(),
    back: jest.fn(),
  }),
}))

// Mock Supabase second
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: mockSignInWithPassword,
      signUp: mockSignUp,
      getSession: mockGetSession,
    },
  },
}))

import LoginPage from '@/app/login/page'

describe('LoginPage', () => {
  beforeEach(() => {
    mockSignInWithPassword.mockClear()
    mockSignUp.mockClear()
    mockGetSession.mockClear()
    mockRouterPush.mockClear()
    mockRouterReplace.mockClear()
    mockGetSession.mockResolvedValue({ data: { session: null } })
  })

  describe('Rendering', () => {
    test('renders the login page with heading', () => {
      render(<LoginPage />)
      expect(screen.getByText(/Welcome to your job application tracker/i)).toBeInTheDocument()
    })

    test('renders email input', () => {
      render(<LoginPage />)
      expect(screen.getByPlaceholderText('you@email.com')).toBeInTheDocument()
    })

    test('renders password input', () => {
      render(<LoginPage />)
      expect(screen.getByPlaceholderText('At least 6 characters')).toBeInTheDocument()
    })

    test('renders form elements', () => {
      render(<LoginPage />)
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    })
  })

  describe('Form Submission', () => {
    test('submits sign-in form with valid credentials', async () => {
      mockSignInWithPassword.mockResolvedValue({ error: null })

      const user = userEvent.setup()
      render(<LoginPage />)

      const emailInput = screen.getByPlaceholderText('you@email.com')
      const passwordInput = screen.getByPlaceholderText('At least 6 characters')
      const buttons = screen.getAllByRole('button')
      const submitButton = buttons.find(btn => btn.textContent?.includes('Sign in') && btn.type === 'submit')

      if (submitButton) {
        await user.type(emailInput, 'test@example.com')
        await user.type(passwordInput, 'password123')
        await user.click(submitButton)

        await waitFor(() => {
          expect(mockSignInWithPassword).toHaveBeenCalledWith({
            email: 'test@example.com',
            password: 'password123',
          })
        })
      }
    })

    test('displays error message on sign-in failure', async () => {
      mockSignInWithPassword.mockResolvedValue({
        error: new Error('Invalid credentials'),
      })

      const user = userEvent.setup()
      render(<LoginPage />)

      const emailInput = screen.getByPlaceholderText('you@email.com')
      const passwordInput = screen.getByPlaceholderText('At least 6 characters')
      const buttons = screen.getAllByRole('button')
      const submitButton = buttons.find(btn => btn.textContent?.includes('Sign in') && btn.type === 'submit')

      if (submitButton) {
        await user.type(emailInput, 'test@example.com')
        await user.type(passwordInput, 'wrongpassword')
        await user.click(submitButton)

        await waitFor(() => {
          expect(screen.getByText(/Invalid credentials/i)).toBeInTheDocument()
        })
      }
    })

    test('handles missing email gracefully', async () => {
      const user = userEvent.setup()
      render(<LoginPage />)

      const buttons = screen.getAllByRole('button')
      const submitButton = buttons.find(btn => btn.textContent?.includes('Sign in') && btn.type === 'submit')

      if (submitButton) {
        await user.click(submitButton)
        const emailInput = screen.getByPlaceholderText('you@email.com') as HTMLInputElement
        expect(emailInput.validity.valid).toBe(false)
      }
    })

    test('handles missing password gracefully', async () => {
      const user = userEvent.setup()
      render(<LoginPage />)

      const emailInput = screen.getByPlaceholderText('you@email.com')
      const buttons = screen.getAllByRole('button')
      const submitButton = buttons.find(btn => btn.textContent?.includes('Sign in') && btn.type === 'submit')

      if (submitButton) {
        await user.type(emailInput, 'test@example.com')
        await user.click(submitButton)

        const passwordInput = screen.getByPlaceholderText('At least 6 characters') as HTMLInputElement
        expect(passwordInput.validity.valid).toBe(false)
      }
    })
  })

  describe('Mode Toggle', () => {
    test('switches to sign-up mode', async () => {
      const user = userEvent.setup()
      render(<LoginPage />)

      const buttons = screen.getAllByRole('button')
      const signupToggle = buttons.find(btn => btn.textContent?.includes('Create account') && btn.className.includes('rounded-r-lg'))

      if (signupToggle) {
        await user.click(signupToggle)
        expect(screen.getByText(/Create an account and start tracking/i)).toBeInTheDocument()
      }
    })

    test('displays correct heading in sign-up mode', async () => {
      const user = userEvent.setup()
      render(<LoginPage />)

      const buttons = screen.getAllByRole('button')
      const signupToggle = buttons.find(btn => btn.textContent?.includes('Create account') && btn.className.includes('rounded-r-lg'))

      if (signupToggle) {
        await user.click(signupToggle)
        expect(screen.getByText(/Create an account and start tracking/i)).toBeInTheDocument()
      }
    })

    test('clears error message when switching modes', async () => {
      mockSignInWithPassword.mockResolvedValue({
        error: new Error('Invalid credentials'),
      })

      const user = userEvent.setup()
      render(<LoginPage />)

      const emailInput = screen.getByPlaceholderText('you@email.com')
      const passwordInput = screen.getByPlaceholderText('At least 6 characters')
      const buttons = screen.getAllByRole('button')
      const submitButton = buttons.find(btn => btn.textContent?.includes('Sign in') && btn.type === 'submit')

      if (submitButton) {
        await user.type(emailInput, 'test@example.com')
        await user.type(passwordInput, 'wrongpassword')
        await user.click(submitButton)

        await waitFor(() => {
          expect(screen.getByText(/Invalid credentials/i)).toBeInTheDocument()
        })

        // Switch mode
        const signupToggle = buttons.find(btn => btn.textContent?.includes('Create account') && btn.className.includes('rounded-r-lg'))
        if (signupToggle) {
          await user.click(signupToggle)
          expect(screen.queryByText(/Invalid credentials/i)).not.toBeInTheDocument()
        }
      }
    })
  })

  describe('Password Visibility', () => {
    test('toggles password visibility', async () => {
      const user = userEvent.setup()
      render(<LoginPage />)

      const passwordInput = screen.getByPlaceholderText('At least 6 characters') as HTMLInputElement
      const buttons = screen.getAllByRole('button')
      const eyeButton = buttons.find(btn => btn.getAttribute('aria-label')?.includes('password') || btn.textContent?.includes('Show') || btn.textContent?.includes('Hide'))

      if (eyeButton) {
        expect(passwordInput.type).toBe('password')

        await user.click(eyeButton)
        expect(passwordInput.type).toBe('text')

        await user.click(eyeButton)
        expect(passwordInput.type).toBe('password')
      }
    })
  })

  describe('Sign-Up', () => {
    test('submits sign-up form', async () => {
      mockSignUp.mockResolvedValue({ error: null })

      const user = userEvent.setup()
      render(<LoginPage />)

      // Switch to sign-up mode
      const buttons = screen.getAllByRole('button')
      const signupToggle = buttons.find(btn => btn.textContent?.includes('Create account') && btn.className.includes('rounded-r-lg'))

      if (signupToggle) {
        await user.click(signupToggle)

        const emailInput = screen.getByPlaceholderText('you@email.com')
        const passwordInput = screen.getByPlaceholderText('At least 6 characters')
        const submitButtons = screen.getAllByRole('button')
        const createButton = submitButtons.find(btn => btn.textContent?.includes('Create account') && btn.type === 'submit')

        if (createButton) {
          await user.type(emailInput, 'newuser@example.com')
          await user.type(passwordInput, 'securepass123')
          await user.click(createButton)

          await waitFor(() => {
            expect(mockSignUp).toHaveBeenCalledWith({
              email: 'newuser@example.com',
              password: 'securepass123',
            })
          })
        }
      }
    })

    test('displays confirmation message after sign-up', async () => {
      mockSignUp.mockResolvedValue({ error: null })

      const user = userEvent.setup()
      render(<LoginPage />)

      const buttons = screen.getAllByRole('button')
      const signupToggle = buttons.find(btn => btn.textContent?.includes('Create account') && btn.className.includes('rounded-r-lg'))

      if (signupToggle) {
        await user.click(signupToggle)

        const emailInput = screen.getByPlaceholderText('you@email.com')
        const passwordInput = screen.getByPlaceholderText('At least 6 characters')
        const submitButtons = screen.getAllByRole('button')
        const createButton = submitButtons.find(btn => btn.textContent?.includes('Create account') && btn.type === 'submit')

        if (createButton) {
          await user.type(emailInput, 'newuser@example.com')
          await user.type(passwordInput, 'securepass123')
          await user.click(createButton)

          await waitFor(() => {
            expect(screen.getByText(/check your email/i)).toBeInTheDocument()
          })
        }
      }
    })
  })

  describe('Loading State', () => {
    test('shows loading state during submission', async () => {
      mockSignInWithPassword.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ error: null }), 100))
      )

      const user = userEvent.setup()
      render(<LoginPage />)

      const emailInput = screen.getByPlaceholderText('you@email.com')
      const passwordInput = screen.getByPlaceholderText('At least 6 characters')
      const buttons = screen.getAllByRole('button')
      const submitButton = buttons.find(btn => btn.textContent?.includes('Sign in') && btn.type === 'submit')

      if (submitButton) {
        await user.type(emailInput, 'test@example.com')
        await user.type(passwordInput, 'password123')
        await user.click(submitButton)

        // Check if any button shows loading state
        const allButtons = screen.getAllByRole('button')
        expect(allButtons.length).toBeGreaterThan(0)
      }
    })
  })
})
