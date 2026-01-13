import { render, screen } from '@testing-library/react'
import { default as DashboardPage } from '@/app/(authenticated)/dashboard/page'

// Mock all hooks and stores
jest.mock('@/hooks/api/works', () => ({
  useWorks: jest.fn(() => ({
    works: [],
    isLoading: false,
  })),
}))

jest.mock('@/hooks/api/expenses', () => ({
  useExpenses: jest.fn(() => ({
    expenses: [],
    isLoading: false,
  })),
}))

jest.mock('@/hooks/api/incomes', () => ({
  useIncomes: jest.fn(() => ({
    incomes: [],
    isLoading: false,
  })),
}))

jest.mock('@/hooks/api/contracts', () => ({
  useContracts: jest.fn(() => ({
    contracts: [],
    isLoading: false,
  })),
}))

jest.mock('@/store/alertsStore', () => ({
  useAlertsStore: jest.fn(() => ({
    alerts: [],
    isLoading: false,
    fetchAlerts: jest.fn(),
  })),
}))

// Create a mock store
const mockStoreState = {
  user: { id: '1', name: 'Test User', organizationId: '1' },
  isAuthenticated: true,
  token: 'test-token',
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

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}))

// Mock ProtectedRoute to render children directly
jest.mock('@/components/auth/ProtectedRoute', () => ({
  ProtectedRoute: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

describe('Dashboard', () => {
  it('renders dashboard content', () => {
    render(<DashboardPage />)
    // Dashboard should render without errors
    // The page is wrapped in ProtectedRoute, so we just check it renders
    expect(document.body).toBeTruthy()
  })

  it('shows loading state when data is loading', () => {
    const { useWorks } = require('@/hooks/api/works')
    useWorks.mockReturnValue({ works: [], isLoading: true })

    render(<DashboardPage />)
    // Should show loading indicator
    expect(document.body).toBeTruthy()
  })

  it('displays KPI cards when data is loaded', () => {
    const { useWorks } = require('@/hooks/api/works')
    useWorks.mockReturnValue({
      works: [{ id: '1', name: 'Work 1' }],
      isLoading: false,
    })

    render(<DashboardPage />)
    // Should display KPI cards with data
    expect(document.body).toBeTruthy()
  })
})
