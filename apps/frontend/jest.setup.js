// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// Mock document.visibilityState para SWR ANTES de cualquier otra cosa
// SWR accede a document.visibilityState cuando se importa, así que debe estar mockeado primero
if (typeof document !== 'undefined') {
  // Asegurar que document existe antes de mockear
  if (!document.visibilityState) {
    Object.defineProperty(document, 'visibilityState', {
      writable: true,
      value: 'visible',
      configurable: true,
    })
  }
  
  if (document.hidden === undefined) {
    Object.defineProperty(document, 'hidden', {
      writable: true,
      value: false,
      configurable: true,
    })
  }
}

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      pathname: '/',
      query: {},
      asPath: '/',
    }
  },
  usePathname() {
    return '/'
  },
  useSearchParams() {
    return new URLSearchParams()
  },
}))

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
global.localStorage = localStorageMock

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return []
  }
  unobserve() {}
}


