import '@testing-library/jest-dom'
import { jest } from '@jest/globals'

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => ({
    type: 'img',
    props,
  }),
}))

jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    }
  },
  usePathname() {
    return '/'
  },
  useSearchParams() {
    return new URLSearchParams()
  },
}))

jest.mock('next/link', () => {
  return (props: any) => props.children
})

jest.mock('motion/react', () => ({
  motion: {
    div: (props: any) => props.children,
    button: (props: any) => props.children,
    span: (props: any) => props.children,
    form: (props: any) => props.children,
    p: (props: any) => props.children,
  },
  AnimatePresence: (props: any) => props.children,
}))

jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      getSession: jest.fn().mockResolvedValue({ data: { session: null } }),
      getUser: jest.fn(),
      onAuthStateChange: jest.fn(() => ({
        data: {
          subscription: {
            unsubscribe: jest.fn(),
          },
        },
      })),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockResolvedValue({ data: [], error: null }),
      insert: jest.fn().mockResolvedValue({ data: {}, error: null }),
      update: jest.fn().mockResolvedValue({ data: {}, error: null }),
      delete: jest.fn().mockResolvedValue({ data: {}, error: null }),
    })),
  },
}))

jest.mock('recharts', () => ({
  PieChart: (props: any) => props.children,
  Pie: () => null,
  Cell: () => null,
  ResponsiveContainer: (props: any) => props.children,
  Tooltip: () => null,
}))

const originalError = console.error
const originalWarn = console.warn

beforeAll(() => {
  console.error = jest.fn((...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Warning: ReactDOM.render') ||
        args[0].includes('Not implemented: HTMLFormElement.prototype.submit') ||
        args[0].includes('Warning: useLayoutEffect'))
    ) {
      return
    }
    originalError.call(console, ...args)
  })

  console.warn = jest.fn((...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Warning: useLayoutEffect does nothing on the server') ||
        args[0].includes('Warning: An update to'))
    ) {
      return
    }
    originalWarn.call(console, ...args)
  })
})

afterAll(() => {
  console.error = originalError
  console.warn = originalWarn
})

;(global as any).ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))
