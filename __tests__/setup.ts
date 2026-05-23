import '@testing-library/jest-dom'
import { jest } from '@jest/globals'

// Polyfill fetch and other globals for JSDOM
if (typeof global.fetch !== 'function') {
  // @ts-expect-error - fetch is not defined in JSDOM but available in Node.js globalThis
  global.fetch = globalThis.fetch || jest.fn(() => 
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({}),
    })
  );
  // @ts-expect-error - Headers is not defined in JSDOM but available in Node.js globalThis
  global.Headers = globalThis.Headers || class {};
  // @ts-expect-error - Request is not defined in JSDOM but available in Node.js globalThis
  global.Request = globalThis.Request || class {};
  // @ts-expect-error - Response is not defined in JSDOM but available in Node.js globalThis
  global.Response = globalThis.Response || class {};
}

interface NextImageProps {
  [key: string]: unknown
}

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: NextImageProps) => ({
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

interface LinkProps {
  children?: React.ReactNode
  [key: string]: unknown
}

jest.mock('next/link', () => {
  return (props: LinkProps) => props.children
})

interface MotionComponentProps {
  children?: React.ReactNode
  [key: string]: unknown
}

jest.mock('motion/react', () => ({
  motion: {
    div: (props: MotionComponentProps) => props.children,
    button: (props: MotionComponentProps) => props.children,
    span: (props: MotionComponentProps) => props.children,
    form: (props: MotionComponentProps) => props.children,
    p: (props: MotionComponentProps) => props.children,
  },
  AnimatePresence: (props: MotionComponentProps) => props.children,
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

interface ChartComponentProps {
  children?: React.ReactNode
  [key: string]: unknown
}

jest.mock('recharts', () => ({
  PieChart: (props: ChartComponentProps) => props.children,
  Pie: () => null,
  Cell: () => null,
  ResponsiveContainer: (props: ChartComponentProps) => props.children,
  Tooltip: () => null,
}))

const originalError = console.error
const originalWarn = console.warn

beforeAll(() => {
  console.error = jest.fn((...args: unknown[]) => {
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

  console.warn = jest.fn((...args: unknown[]) => {
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

interface Global {
  ResizeObserver: jest.Mock
}

;(global as unknown as Global).ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))
