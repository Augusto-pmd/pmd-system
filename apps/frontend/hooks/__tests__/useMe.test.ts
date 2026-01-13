import { renderHook, waitFor } from '@testing-library/react'
import { useMe } from '../useMe'

// Create a mock store
const mockStoreState = {
  user: null,
  isAuthenticated: false,
  token: null,
  loadMe: jest.fn(),
}

const mockGetState = jest.fn(() => mockStoreState)

// Mock del store
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

describe('useMe', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockStoreState.user = null
    mockStoreState.isAuthenticated = false
    mockStoreState.token = null
    mockStoreState.loadMe = jest.fn()
  })

  it('returns user and isAuthenticated from store', () => {
    const mockUser = { id: '1', name: 'Test User' }
    mockStoreState.user = mockUser
    mockStoreState.isAuthenticated = true

    const { result } = renderHook(() => useMe())

    expect(result.current.user).toEqual(mockUser)
    expect(result.current.isAuthenticated).toBe(true)
  })

  it('calls loadMe when not authenticated but has token', async () => {
    const mockUser = null
    const mockLoadMe = jest.fn().mockResolvedValue({ id: '1', name: 'Test User' })
    
    mockStoreState.user = mockUser
    mockStoreState.isAuthenticated = false
    mockStoreState.token = 'test-token'
    mockStoreState.loadMe = mockLoadMe
    
    const { useAuthStore } = require('@/store/authStore')
    useAuthStore.getState = jest.fn(() => ({ token: 'test-token' }))

    renderHook(() => useMe())

    await waitFor(() => {
      expect(mockLoadMe).toHaveBeenCalled()
    }, { timeout: 3000 })
  })

  it('does not call loadMe when already authenticated', () => {
    const mockUser = { id: '1', name: 'Test User' }
    const mockLoadMe = jest.fn()

    mockStoreState.user = mockUser
    mockStoreState.isAuthenticated = true
    mockStoreState.loadMe = mockLoadMe

    renderHook(() => useMe())

    expect(mockLoadMe).not.toHaveBeenCalled()
  })

  it('does not call loadMe when no token exists', () => {
    const mockUser = null
    const mockLoadMe = jest.fn()

    mockStoreState.user = mockUser
    mockStoreState.isAuthenticated = false
    mockStoreState.token = null
    mockStoreState.loadMe = mockLoadMe
    
    const { useAuthStore } = require('@/store/authStore')
    useAuthStore.getState = jest.fn(() => ({ token: null }))

    renderHook(() => useMe())

    expect(mockLoadMe).not.toHaveBeenCalled()
  })
})

