import { render, screen } from '@testing-library/react'
import { ProtectedRoute } from '../ProtectedRoute'

// Create a mock store
const mockStoreState = {
  user: null,
  isAuthenticated: false,
  token: null,
  loadMe: jest.fn(),
}

jest.mock('@/store/authStore', () => {
  const mockGetStateFn = jest.fn(() => mockStoreState)
  const mockStore = jest.fn((selector?: any) => {
    if (selector) {
      return selector(mockStoreState)
    }
    return mockStoreState
  })
  mockStore.getState = mockGetStateFn
  return {
    useAuthStore: mockStore,
  }
})

const mockReplace = jest.fn()
const mockPush = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: mockPush,
    replace: mockReplace,
  })),
}))

describe('ProtectedRoute', () => {
  const mockLoadMe = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockStoreState.user = null
    mockStoreState.isAuthenticated = false
    mockStoreState.token = null
    mockStoreState.loadMe = mockLoadMe
    
    const { useAuthStore } = require('@/store/authStore')
    useAuthStore.getState = jest.fn(() => ({
      token: 'test-token',
      loadMe: mockLoadMe,
    }))
  })

  it('renders children when authenticated', () => {
    mockStoreState.user = { id: '1', name: 'Test User', role: { name: 'ADMINISTRATION' }, organizationId: '1' }
    mockStoreState.isAuthenticated = true
    
    const { useAuthStore } = require('@/store/authStore')
    useAuthStore.getState = jest.fn(() => ({
      token: 'test-token',
      loadMe: mockLoadMe,
    }))

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    )

    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })

  it('redirects when not authenticated', () => {
    mockStoreState.user = null
    mockStoreState.isAuthenticated = false
    
    const { useAuthStore } = require('@/store/authStore')
    useAuthStore.getState = jest.fn(() => ({
      token: null,
      loadMe: mockLoadMe,
    }))

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    )

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })

  it('checks role permissions when allowedRoles is provided', async () => {
    mockReplace.mockClear()
    mockStoreState.user = { id: '1', name: 'Test User', role: { name: 'OPERATOR' }, organizationId: '1' }
    mockStoreState.isAuthenticated = true
    
    const { useAuthStore } = require('@/store/authStore')
    useAuthStore.getState = jest.fn(() => ({
      token: 'test-token',
      loadMe: mockLoadMe,
    }))

    render(
      <ProtectedRoute allowedRoles={['admin', 'administrator']}>
        <div>Admin Content</div>
      </ProtectedRoute>
    )

    // Wait for redirect logic to execute (useEffect runs after render)
    await new Promise(resolve => setTimeout(resolve, 200))

    // Should redirect because user role is not in allowedRoles
    // Check if redirect was called (the component uses useEffect which runs after render)
    expect(mockReplace).toHaveBeenCalledWith('/unauthorized')
  })
})
