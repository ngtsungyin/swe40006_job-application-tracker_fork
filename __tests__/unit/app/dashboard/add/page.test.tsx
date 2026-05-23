import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { jest } from '@jest/globals'

const mockRouterPush = jest.fn()
const mockCreateApplication = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockRouterPush,
  }),
}))

jest.mock('@/lib/applications', () => ({
  createApplication: mockCreateApplication,
}))

import AddApplicationPage from '@/app/dashboard/add/page'

describe('Add Application Form', () => {
  beforeEach(() => {
    mockRouterPush.mockClear()
    mockCreateApplication.mockClear()
  })

  test('renders form title', () => {
    render(<AddApplicationPage />)
    expect(screen.getByText(/Add Job Application/i)).toBeInTheDocument()
  })

  test('renders all required form fields', () => {
    render(<AddApplicationPage />)
    expect(screen.getByLabelText(/Company Name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Job Title/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Status/i)).toBeInTheDocument()
  })

  test('renders optional form fields', () => {
    render(<AddApplicationPage />)
    expect(screen.getByLabelText(/Job URL/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Location/i)).toBeInTheDocument()
  })

  test('renders submit button', () => {
    render(<AddApplicationPage />)
    expect(screen.getByRole('button', { name: /Save Application/i })).toBeInTheDocument()
  })

  test('submits form with all fields filled', async () => {
    mockCreateApplication.mockResolvedValue({ id: '1' })

    const user = userEvent.setup()
    render(<AddApplicationPage />)

    const companyInput = screen.getByLabelText(/Company Name/i)
    const jobTitleInput = screen.getByLabelText(/Job Title/i)
    const submitButton = screen.getByRole('button', { name: /Save Application/i })

    await user.type(companyInput, 'Tech Corp')
    await user.type(jobTitleInput, 'Senior Developer')
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockCreateApplication).toHaveBeenCalled()
    })
  })

  test('redirects to dashboard after successful submission', async () => {
    mockCreateApplication.mockResolvedValue({ id: '1' })

    const user = userEvent.setup()
    render(<AddApplicationPage />)

    const companyInput = screen.getByLabelText(/Company Name/i)
    const jobTitleInput = screen.getByLabelText(/Job Title/i)
    const submitButton = screen.getByRole('button', { name: /Save Application/i })

    await user.type(companyInput, 'Tech Corp')
    await user.type(jobTitleInput, 'Senior Developer')
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockRouterPush).toHaveBeenCalledWith('/dashboard')
    })
  })

  test('displays error message on submission failure', async () => {
    mockCreateApplication.mockRejectedValue(new Error('Failed to create'))

    const user = userEvent.setup()
    render(<AddApplicationPage />)

    const companyInput = screen.getByLabelText(/Company Name/i)
    const jobTitleInput = screen.getByLabelText(/Job Title/i)
    const submitButton = screen.getByRole('button', { name: /Save Application/i })

    await user.type(companyInput, 'Tech Corp')
    await user.type(jobTitleInput, 'Senior Developer')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/Failed to create/i)).toBeInTheDocument()
    })
  })

  test('shows loading state during submission', async () => {
    mockCreateApplication.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ id: '1' }), 100))
    )

    const user = userEvent.setup()
    render(<AddApplicationPage />)

    const companyInput = screen.getByLabelText(/Company Name/i)
    const jobTitleInput = screen.getByLabelText(/Job Title/i)
    const submitButton = screen.getByRole('button', { name: /Save Application/i })

    await user.type(companyInput, 'Tech Corp')
    await user.type(jobTitleInput, 'Senior Developer')
    await user.click(submitButton)

    expect(screen.getByRole('button', { name: /Saving/i })).toBeInTheDocument()
  })

  test('prevents submission with missing required fields', async () => {
    const user = userEvent.setup()
    render(<AddApplicationPage />)

    const submitButton = screen.getByRole('button', { name: /Save Application/i })
    await user.click(submitButton)

    const companyInput = screen.getByLabelText(/Company Name/i) as HTMLInputElement
    expect(companyInput.validity.valid).toBe(false)
  })

  test('updates form fields on input', async () => {
    const user = userEvent.setup()
    render(<AddApplicationPage />)

    const companyInput = screen.getByLabelText(/Company Name/i) as HTMLInputElement
    await user.type(companyInput, 'Tech Corp')

    expect(companyInput.value).toBe('Tech Corp')
  })

  test('updates status on selection', async () => {
    const user = userEvent.setup()
    render(<AddApplicationPage />)

    const statusSelect = screen.getByLabelText(/Status/i) as HTMLSelectElement
    await user.selectOptions(statusSelect, 'interview')

    expect(statusSelect.value).toBe('interview')
  })

  test('displays error when API call fails', async () => {
    mockCreateApplication.mockRejectedValue(new Error('Network error'))

    const user = userEvent.setup()
    render(<AddApplicationPage />)

    const companyInput = screen.getByLabelText(/Company Name/i)
    const jobTitleInput = screen.getByLabelText(/Job Title/i)
    const submitButton = screen.getByRole('button', { name: /Save Application/i })

    await user.type(companyInput, 'Tech Corp')
    await user.type(jobTitleInput, 'Senior Developer')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/Network error/i)).toBeInTheDocument()
    })
  })

  test('requires company name', () => {
    render(<AddApplicationPage />)
    const companyInput = screen.getByLabelText(/Company Name/i) as HTMLInputElement
    expect(companyInput.required).toBe(true)
  })

  test('requires job title', () => {
    render(<AddApplicationPage />)
    const jobTitleInput = screen.getByLabelText(/Job Title/i) as HTMLInputElement
    expect(jobTitleInput.required).toBe(true)
  })
})
