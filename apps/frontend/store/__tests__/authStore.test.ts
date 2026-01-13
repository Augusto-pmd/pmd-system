import { renderHook, act } from '@testing-library/react'
import { useAuthStore } from '../authStore'
import * as authService from '@/lib/services/authService'

// Mock del servicio de autenticación
jest.mock('@/lib/services/authService', () => ({
  login: jest.fn(),
  refresh: jest.fn(),
  loadMe: jest.fn(),
}))

// Mock de persist middleware
jest.mock('zustand/middleware', () => ({
  persist: (config: any) => config,
}))

describe('authStore', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Reset store state
    useAuthStore.setState({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      status: 'unauthenticated',
    })
  })

  describe('login', () => {
    it('successfully logs in user', async () => {
      const mockUser = {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        role: { id: '1', name: 'ADMINISTRATION', permissions: [] },
        organizationId: '1',
      }
      const mockResponse = {
        user: mockUser,
        access_token: 'test-token',
        refresh_token: 'test-refresh-token',
      }

      ;(authService.login as jest.Mock).mockResolvedValue(mockResponse)

      const { result } = renderHook(() => useAuthStore())

      await act(async () => {
        await result.current.login('test@example.com', 'password')
      })

      expect(result.current.isAuthenticated).toBe(true)
      expect(result.current.user).toBeTruthy()
      expect(result.current.user?.id).toBe('1')
      expect(result.current.token).toBe('test-token')
    })

    it('handles login failure', async () => {
      ;(authService.login as jest.Mock).mockResolvedValue(null)

      const { result } = renderHook(() => useAuthStore())

      await act(async () => {
        const user = await result.current.login('test@example.com', 'wrong-password')
        expect(user).toBeNull()
      })

      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.user).toBeNull()
    })
  })

  describe('logout', () => {
    it('clears user data on logout', async () => {
      // First login
      const mockUser = { id: '1', name: 'Test User' }
      const mockResponse = {
        user: mockUser,
        access_token: 'test-token',
        refresh_token: 'test-refresh-token',
      }
      ;(authService.login as jest.Mock).mockResolvedValue(mockResponse)

      const { result } = renderHook(() => useAuthStore())

      await act(async () => {
        await result.current.login('test@example.com', 'password')
      })

      expect(result.current.isAuthenticated).toBe(true)

      // Then logout
      act(() => {
        result.current.logout()
      })

      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.user).toBeNull()
      expect(result.current.token).toBeNull()
    })
  })

  describe('loadMe', () => {
    it('loads user data successfully', async () => {
      // Mock user with all required fields for normalization
      // The normalizeUser function expects: id, email, fullName (or name), role, organizationId
      // loadMe returns { user: {...} } structure
      const mockUserData = {
        id: 1, // Can be number, will be normalized to string
        fullName: 'Test User',
        name: 'Test User', // fallback
        email: 'test@example.com',
        role: { 
          id: 1, 
          name: 'ADMINISTRATION', 
          permissions: [] 
        },
        organizationId: 1,
        organization: {
          id: 1,
          name: 'Test Organization'
        }
      }
      
      // Mock the service to return UserMeResponse structure
      ;(authService.loadMe as jest.Mock).mockResolvedValue({ user: mockUserData })

      // Set token first and reset state
      useAuthStore.setState({ 
        token: 'test-token',
        user: null,
        isAuthenticated: false,
        status: 'unauthenticated'
      })

      const { result } = renderHook(() => useAuthStore())

      await act(async () => {
        const loadedUser = await result.current.loadMe()
        // Verify the service was called
        expect(authService.loadMe).toHaveBeenCalled()
        // The user should be loaded (normalized)
        expect(loadedUser).toBeTruthy()
        expect(loadedUser?.id).toBe('1') // Normalized to string
      })

      // Check that user was set in store
      expect(result.current.user).toBeTruthy()
      expect(result.current.user?.id).toBe('1')
      expect(result.current.isAuthenticated).toBe(true)
    })

    it('handles loadMe failure', async () => {
      ;(authService.loadMe as jest.Mock).mockRejectedValue(new Error('Unauthorized'))

      useAuthStore.setState({ token: 'invalid-token' })

      const { result } = renderHook(() => useAuthStore())

      await act(async () => {
        const user = await result.current.loadMe()
        expect(user).toBeNull()
      })

      expect(result.current.isAuthenticated).toBe(false)
    })
  })
})

