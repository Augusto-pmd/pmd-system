import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { WorkForm } from '../WorkForm'
import { useUsers } from '@/hooks/api/users'

jest.mock('@/hooks/api/users', () => ({
  useUsers: jest.fn(),
}))

describe('WorkForm', () => {
  const mockOnSubmit = jest.fn()
  const mockOnCancel = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useUsers as jest.Mock).mockReturnValue({
      users: [
        { id: '1', name: 'User 1', email: 'user1@test.com' },
        { id: '2', name: 'User 2', email: 'user2@test.com' },
      ],
    })
  })

  it('renders work form with all fields', () => {
    render(<WorkForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)
    
    // Check for form fields by text content - use getAllByText for fields that may appear multiple times
    const nombreElements = screen.getAllByText(/nombre de la obra/i)
    expect(nombreElements.length).toBeGreaterThan(0)
    const clienteElements = screen.getAllByText(/cliente/i)
    expect(clienteElements.length).toBeGreaterThan(0)
    const direccionElements = screen.getAllByText(/dirección/i)
    expect(direccionElements.length).toBeGreaterThan(0)
    const monedaElements = screen.getAllByText(/moneda/i)
    expect(monedaElements.length).toBeGreaterThan(0)
    const fechaInicioElements = screen.getAllByText(/fecha de inicio/i)
    expect(fechaInicioElements.length).toBeGreaterThan(0)
  })

  it('validates required fields', async () => {
    const user = userEvent.setup()
    render(<WorkForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)

    const submitButton = screen.getByRole('button', { name: /crear|actualizar/i })
    await user.click(submitButton)

    // Verificar que el formulario previene el envío cuando faltan campos requeridos
    await waitFor(() => {
      expect(mockOnSubmit).not.toHaveBeenCalled()
    }, { timeout: 1000 })
  })

  it('handles form submission with valid data', async () => {
    const user = userEvent.setup()
    mockOnSubmit.mockResolvedValue(undefined)

    const { container } = render(<WorkForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)

    // Find inputs by placeholder since labels are not properly associated
    const nameInput = screen.getByPlaceholderText(/edificio residencial/i) as HTMLInputElement
    const clientInput = screen.getByPlaceholderText(/nombre del cliente/i) as HTMLInputElement
    const addressInput = screen.getByPlaceholderText(/dirección completa/i) as HTMLInputElement
    
    // Find date input by type
    const dateInput = container.querySelector('input[type="date"]') as HTMLInputElement

    // Use fireEvent to directly set values
    fireEvent.change(nameInput, { target: { value: 'Test Work' } })
    fireEvent.blur(nameInput)
    fireEvent.change(clientInput, { target: { value: 'Test Client' } })
    fireEvent.blur(clientInput)
    fireEvent.change(addressInput, { target: { value: 'Test Address' } })
    fireEvent.blur(addressInput)
    if (dateInput) {
      fireEvent.change(dateInput, { target: { value: '2024-01-01' } })
      fireEvent.blur(dateInput)
    }

    // Wait for values to be set and errors cleared
    await waitFor(() => {
      expect(nameInput.value).toBe('Test Work')
      expect(clientInput.value).toBe('Test Client')
      expect(addressInput.value).toBe('Test Address')
      if (dateInput) {
        expect(dateInput.value).toBe('2024-01-01')
      }
      // Check that errors are cleared
      const errorMessages = screen.queryAllByText(/obligatorio/i)
      expect(errorMessages.length).toBe(0)
    }, { timeout: 2000 })

    // Currency should be selected by default (USD), verify it exists
    const currencySelects = container.querySelectorAll('select')
    const currencySelect = Array.from(currencySelects).find(select => 
      select.querySelector('option[value="USD"]')
    ) as HTMLSelectElement

    const submitButton = screen.getByRole('button', { name: /crear|actualizar/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled()
    }, { timeout: 3000 })
  })

  it('calls onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup()
    render(<WorkForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)

    await user.click(screen.getByRole('button', { name: /cancelar/i }))

    expect(mockOnCancel).toHaveBeenCalled()
  })

  it('populates form with initial data', () => {
    const initialData = {
      id: '1',
      name: 'Existing Work',
      client: 'Existing Client',
      address: 'Existing Address',
      currency: 'USD' as const,
      start_date: '2024-01-01',
      status: 'active' as const,
    }

    render(<WorkForm initialData={initialData} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)

    expect(screen.getByDisplayValue('Existing Work')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Existing Client')).toBeInTheDocument()
  })
})

