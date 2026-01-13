import { renderHook, waitFor } from '@testing-library/react'
import { useWorks, useWork } from '../works'
import { useAuthStore } from '@/store/authStore'
import { apiClient } from '@/lib/api'

jest.mock('@/store/authStore', () => ({
  useAuthStore: jest.fn(),
}))

jest.mock('@/lib/api', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}))

describe('useWorks', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useAuthStore as jest.Mock).mockReturnValue({
      token: 'test-token',
    })
  })

  it('fetches works when token is present', async () => {
    const mockWorks = [
      { id: '1', name: 'Work 1' },
      { id: '2', name: 'Work 2' },
    ]
    ;(apiClient.get as jest.Mock).mockResolvedValue({ data: mockWorks })

    const { result } = renderHook(() => useWorks())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(apiClient.get).toHaveBeenCalledWith('/works')
    expect(result.current.works).toEqual(mockWorks)
  })

  it('does not fetch when token is not present', () => {
    ;(useAuthStore as jest.Mock).mockReturnValue({
      token: null,
    })

    renderHook(() => useWorks())

    expect(apiClient.get).not.toHaveBeenCalled()
  })
})

describe('useWork', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useAuthStore as jest.Mock).mockReturnValue({
      token: 'test-token',
    })
  })

  it('fetches single work when id is provided', async () => {
    const mockWork = { id: '1', name: 'Work 1' }
    ;(apiClient.get as jest.Mock).mockResolvedValue({ data: mockWork })

    const { result } = renderHook(() => useWork('1'))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(apiClient.get).toHaveBeenCalledWith('/works/1')
    expect(result.current.work).toEqual(mockWork)
  })

  it('returns null when id is not provided', () => {
    const { result } = renderHook(() => useWork(null))

    expect(result.current.work).toBeNull()
    expect(result.current.isLoading).toBe(false)
    expect(apiClient.get).not.toHaveBeenCalled()
  })
})

