import { render, screen } from '@testing-library/react'
import { BruteForceAlert } from '../BruteForceAlert'
import { useBruteForce } from '@/hooks/useBruteForce'

jest.mock('@/hooks/useBruteForce', () => ({
  useBruteForce: jest.fn(),
}))

describe('BruteForceAlert', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns null when loading', () => {
    ;(useBruteForce as jest.Mock).mockReturnValue({
      status: null,
      isLoading: true,
    })

    const { container } = render(<BruteForceAlert />)
    expect(container.firstChild).toBeNull()
  })

  it('shows warning when close to blocking', () => {
    ;(useBruteForce as jest.Mock).mockReturnValue({
      status: {
        isBlocked: false,
        remainingAttempts: 2,
        attemptCount: 3,
        maxAttempts: 5,
        blockDuration: 900000,
      },
      isLoading: false,
    })

    render(<BruteForceAlert />)
    expect(screen.getByText(/advertencia de seguridad/i)).toBeInTheDocument()
    expect(screen.getByText(/2 intento/i)).toBeInTheDocument()
  })

  it('shows block message when blocked', () => {
    ;(useBruteForce as jest.Mock).mockReturnValue({
      status: {
        isBlocked: true,
        remainingMinutes: 15,
        remainingTime: 900000,
        retryAfter: new Date(Date.now() + 900000).toISOString(),
      },
      isLoading: false,
    })

    render(<BruteForceAlert />)
    expect(screen.getByText(/acceso bloqueado/i)).toBeInTheDocument()
    expect(screen.getByText(/15 minuto/i)).toBeInTheDocument()
  })

  it('returns null when not blocked and has attempts remaining', () => {
    ;(useBruteForce as jest.Mock).mockReturnValue({
      status: {
        isBlocked: false,
        remainingAttempts: 5,
        attemptCount: 0,
        maxAttempts: 5,
      },
      isLoading: false,
    })

    const { container } = render(<BruteForceAlert />)
    expect(container.firstChild).toBeNull()
  })
})
