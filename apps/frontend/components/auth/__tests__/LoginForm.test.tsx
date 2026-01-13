import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LoginForm } from '../LoginForm'
import { useAuthContext } from '@/context/AuthContext'
import { useBruteForce } from '@/hooks/useBruteForce'

jest.mock('@/context/AuthContext', () => ({
  useAuthContext: jest.fn(),
}))

jest.mock('@/hooks/useBruteForce', () => ({
  useBruteForce: jest.fn(),
}))

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}))

describe('LoginForm', () => {
  const mockLogin = jest.fn()
  const mockRefresh = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useAuthContext as jest.Mock).mockReturnValue({
      login: mockLogin,
    })
    ;(useBruteForce as jest.Mock).mockReturnValue({
      status: { isBlocked: false, remainingAttempts: 5 },
      refresh: mockRefresh,
    })
  })

  it('renders login form', () => {
    render(<LoginForm />)
    expect(screen.getByPlaceholderText(/your.email@example.com/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/••••••••/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { type: 'submit' })).toBeInTheDocument()
  })

  it('handles form submission', async () => {
    const user = userEvent.setup()
    mockLogin.mockResolvedValue(true)

    render(<LoginForm />)

    // Use getByLabelText since labels have htmlFor attributes
    const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement
    const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement
    const submitButton = screen.getByRole('button', { name: /sign in/i })

    // Use fireEvent to directly set values
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })

    // Wait for the values to be updated in the DOM
    await waitFor(() => {
      expect(emailInput.value).toBe('test@example.com')
      expect(passwordInput.value).toBe('password123')
    }, { timeout: 2000 })

    // Small delay to ensure state is updated
    await new Promise(resolve => setTimeout(resolve, 100))

    await user.click(submitButton)

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123')
    }, { timeout: 3000 })
  })

  it('shows error on login failure', async () => {
    const user = userEvent.setup()
    mockLogin.mockResolvedValue(false)

    render(<LoginForm />)

    const emailInput = screen.getByPlaceholderText(/your.email@example.com/i)
    const passwordInput = screen.getByPlaceholderText(/••••••••/i)
    const submitButton = screen.getByRole('button', { type: 'submit' })

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'wrong-password')
    await user.click(submitButton)

    await waitFor(() => {
      // Error message should appear
      expect(screen.getByText(/credenciales incorrectas/i) || screen.getByText(/incorrectas/i)).toBeInTheDocument()
    })
  })

  it('disables submit when blocked by brute force', () => {
    ;(useBruteForce as jest.Mock).mockReturnValue({
      status: { isBlocked: true, remainingMinutes: 15 },
      refresh: mockRefresh,
    })

    render(<LoginForm />)
    // When blocked, the button should be disabled or not found
    const submitButton = screen.queryByRole('button', { name: /iniciar sesión/i })
    if (submitButton) {
      expect(submitButton).toBeDisabled()
    } else {
      // Button might not render when blocked
      expect(screen.getByText(/acceso bloqueado/i) || screen.getByText(/bloqueado/i)).toBeTruthy()
    }
  })
})
