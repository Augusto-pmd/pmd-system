import { renderHook, waitFor, act } from '@testing-library/react'
import { useBruteForce } from '../useBruteForce'
import { apiClient } from '@/lib/api'

jest.mock('@/lib/api', () => ({
  apiClient: {
    get: jest.fn(),
  },
}))

// Suppress console.error for expected errors
const originalError = console.error
beforeAll(() => {
  console.error = jest.fn()
})

afterAll(() => {
  console.error = originalError
})

describe('useBruteForce', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('fetches brute force status on mount', async () => {
    const mockStatus = {
      isBlocked: false,
      remainingTime: 0,
      remainingMinutes: 0,
      attemptCount: 2,
      remainingAttempts: 3,
      maxAttempts: 5,
      blockDuration: 900000,
      retryAfter: null,
    }

    ;(apiClient.get as jest.Mock).mockResolvedValue(mockStatus)

    const { result } = renderHook(() => useBruteForce())

    // Wait for the initial fetch to complete
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    }, { timeout: 3000 })

    // Verify API was called
    expect(apiClient.get).toHaveBeenCalledWith('/auth/brute-force-status')
    
    // Wait for status to be set
    await waitFor(() => {
      expect(result.current.status).toEqual(mockStatus)
    }, { timeout: 1000 })
  })

  it('handles error when fetching status fails', async () => {
    const mockError = new Error('Failed to fetch')
    ;(apiClient.get as jest.Mock).mockRejectedValue(mockError)

    const { result } = renderHook(() => useBruteForce())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    }, { timeout: 3000 })

    expect(result.current.error).toBe(mockError)
    expect(result.current.status).toBeNull()
  })

  it('refreshes status when refresh is called', async () => {
    const mockStatus = {
      isBlocked: false,
      remainingTime: 0,
      remainingMinutes: 0,
      attemptCount: 1,
      remainingAttempts: 4,
      maxAttempts: 5,
      blockDuration: 900000,
      retryAfter: null,
    }

    ;(apiClient.get as jest.Mock).mockResolvedValue(mockStatus)

    const { result } = renderHook(() => useBruteForce())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    const newStatus = { ...mockStatus, attemptCount: 3 }
    ;(apiClient.get as jest.Mock).mockResolvedValue(newStatus)

    await result.current.refresh()

    await waitFor(() => {
      expect(result.current.status?.attemptCount).toBe(3)
    })
  })

  it('auto-refreshes status every 10 seconds when blocked', async () => {
    jest.useFakeTimers()
    const mockStatus = {
      isBlocked: true,
      remainingTime: 600000,
      remainingMinutes: 10,
      attemptCount: 5,
      remainingAttempts: 0,
      maxAttempts: 5,
      blockDuration: 900000,
      retryAfter: new Date(Date.now() + 600000).toISOString(),
    }

    ;(apiClient.get as jest.Mock).mockResolvedValue(mockStatus)

    const { result } = renderHook(() => useBruteForce())

    await waitFor(() => {
      expect(result.current.status?.isBlocked).toBe(true)
    })

    const initialCallCount = (apiClient.get as jest.Mock).mock.calls.length

    // Avanzar 10 segundos
    act(() => {
      jest.advanceTimersByTime(10000)
    })

    await waitFor(() => {
      expect(apiClient.get).toHaveBeenCalledTimes(initialCallCount + 1)
    }, { timeout: 3000 })
    
    jest.useRealTimers()
  })
})
