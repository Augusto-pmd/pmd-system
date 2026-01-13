import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SupplierForm } from '../SupplierForm'

describe('SupplierForm', () => {
  const mockOnSubmit = jest.fn()
  const mockOnCancel = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders supplier form with all fields', () => {
    render(<SupplierForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)
    
    // Check for form fields by text content
    expect(screen.getByText(/nombre|razón social/i)).toBeInTheDocument()
    expect(screen.getByText(/cuit/i)).toBeInTheDocument()
    expect(screen.getByText(/email/i)).toBeInTheDocument()
  })

  it('validates required fields', async () => {
    const user = userEvent.setup()
    render(<SupplierForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)

    const submitButton = screen.getByRole('button', { name: /crear|actualizar/i })
    await user.click(submitButton)

    // Verificar que el formulario previene el envío (no se llama onSubmit)
    await waitFor(() => {
      expect(mockOnSubmit).not.toHaveBeenCalled()
    }, { timeout: 1000 })
  })

  it('validates email format', async () => {
    const user = userEvent.setup()
    const { container } = render(<SupplierForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)

    // Usar placeholder para encontrar inputs ya que los labels no están asociados
    const nameInput = screen.getByPlaceholderText(/proveedora/i) as HTMLInputElement
    const emailInput = screen.getByPlaceholderText(/proveedor@ejemplo/i) as HTMLInputElement

    await user.type(nameInput, 'Test Supplier')
    await user.type(emailInput, 'invalid-email')

    const submitButton = screen.getByRole('button', { name: /crear|actualizar/i })
    await user.click(submitButton)

    // Verificar que el formulario previene el envío con email inválido
    await waitFor(() => {
      expect(mockOnSubmit).not.toHaveBeenCalled()
    }, { timeout: 1000 })
  })

  it('handles form submission with valid data', async () => {
    const user = userEvent.setup()
    mockOnSubmit.mockResolvedValue(undefined)

    const { container } = render(<SupplierForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)

    // Find inputs by placeholder
    const nameInput = screen.getByPlaceholderText(/proveedora/i) as HTMLInputElement
    const emailInput = screen.getByPlaceholderText(/proveedor@ejemplo/i) as HTMLInputElement

    // Use fireEvent to directly set values
    fireEvent.change(nameInput, { target: { value: 'Test Supplier' } })
    fireEvent.blur(nameInput)
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.blur(emailInput)

    // Wait for values to be set
    await waitFor(() => {
      expect(nameInput.value).toBe('Test Supplier')
      expect(emailInput.value).toBe('test@example.com')
    })

    // Estado is required - find and select it
    const selects = container.querySelectorAll('select')
    const estadoSelect = Array.from(selects).find(select => {
      const options = Array.from(select.querySelectorAll('option'))
      return options.some(opt => opt.textContent?.includes('Provisional'))
    }) as HTMLSelectElement

    if (estadoSelect) {
      fireEvent.change(estadoSelect, { target: { value: 'provisional' } })
      fireEvent.blur(estadoSelect)
    }

    // Wait a bit for validation to clear errors
    await waitFor(() => {
      const errorMessages = screen.queryAllByText(/obligatorio/i)
      // Errors should be cleared after filling required fields
      expect(errorMessages.length).toBe(0)
    }, { timeout: 2000 })

    const submitButton = screen.getByRole('button', { name: /crear proveedor|crear|actualizar/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled()
    }, { timeout: 3000 })
  })

  it('calls onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup()
    render(<SupplierForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)

    await user.click(screen.getByRole('button', { name: /cancelar/i }))

    expect(mockOnCancel).toHaveBeenCalled()
  })
})

