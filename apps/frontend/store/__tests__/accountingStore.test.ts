import { renderHook, act, waitFor } from '@testing-library/react'
import { useAccountingStore } from '../accountingStore'
import { apiClient } from '@/lib/api'

jest.mock('@/lib/api', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}))

describe('accountingStore', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    useAccountingStore.setState({
      entries: [],
      isLoading: false,
      error: null,
    })
  })

  describe('fetchEntries', () => {
    it('fetches entries successfully', async () => {
      const mockEntries = [
        { id: '1', amount: 1000, type: 'ingreso' },
        { id: '2', amount: 500, type: 'egreso' },
      ]

      ;(apiClient.get as jest.Mock).mockResolvedValue({ data: mockEntries })

      const { result } = renderHook(() => useAccountingStore())

      await act(async () => {
        await result.current.fetchEntries()
      })

      expect(result.current.entries).toEqual(mockEntries)
      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBeNull()
    })

    it('fetches entries with filters', async () => {
      const mockEntries = [{ id: '1', amount: 1000, type: 'ingreso' }]
      ;(apiClient.get as jest.Mock).mockResolvedValue({ data: mockEntries })

      const { result } = renderHook(() => useAccountingStore())

      await act(async () => {
        await result.current.fetchEntries({ workId: '1', type: 'ingreso' })
      })

      expect(apiClient.get).toHaveBeenCalledWith('/accounting?workId=1&type=ingreso')
      expect(result.current.entries).toEqual(mockEntries)
    })

    it('handles fetch error', async () => {
      const mockError = new Error('Failed to fetch')
      ;(apiClient.get as jest.Mock).mockRejectedValue(mockError)

      const { result } = renderHook(() => useAccountingStore())

      await act(async () => {
        await result.current.fetchEntries()
      })

      expect(result.current.error).toBe('Failed to fetch')
      expect(result.current.isLoading).toBe(false)
    })
  })

  describe('createEntry', () => {
    it('creates entry successfully', async () => {
      const newEntry = {
        amount: 1000,
        type: 'ingreso' as const,
        date: '2024-01-01',
        workId: '1', // Add required workId
      }

      ;(apiClient.post as jest.Mock).mockResolvedValue({ data: { id: '1', ...newEntry } })
      ;(apiClient.get as jest.Mock).mockResolvedValue({ data: [{ id: '1', ...newEntry }] })

      const { result } = renderHook(() => useAccountingStore())

      await act(async () => {
        await result.current.createEntry(newEntry)
      })

      expect(apiClient.post).toHaveBeenCalledWith('/accounting', expect.objectContaining(newEntry))
    })
  })
})

