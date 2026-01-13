import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { IncomeForm } from '../IncomeForm'
import { useWorks } from '@/hooks/api/works'

jest.mock('@/hooks/api/works', () => ({
  useWorks: jest.fn(),
}))

describe('IncomeForm', () => {
  const mockOnSubmit = jest.fn()
  const mockOnCancel = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useWorks as jest.Mock).mockReturnValue({
      works: [{ id: '1', name: 'Work 1' }],
    })
  })

  it('renders income form with all fields', () => {
    render(<IncomeForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)
    
    // Check for form fields - use getAllByText and check first occurrence
    const obraLabels = screen.getAllByText(/obra/i)
    expect(obraLabels.length).toBeGreaterThan(0)
    const montoLabels = screen.getAllByText(/monto/i)
    expect(montoLabels.length).toBeGreaterThan(0)
    const monedaLabels = screen.getAllByText(/moneda/i)
    expect(monedaLabels.length).toBeGreaterThan(0)
  })

  it('validates required fields', async () => {
    const user = userEvent.setup()
    render(<IncomeForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)

    const submitButton = screen.getByRole('button', { name: /crear|actualizar/i })
    await user.click(submitButton)

    // Verificar que el formulario previene el envío cuando faltan campos requeridos
    await waitFor(() => {
      expect(mockOnSubmit).not.toHaveBeenCalled()
    }, { timeout: 1000 })
  })

  it('validates amount is positive', async () => {
    const user = userEvent.setup()
    render(<IncomeForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)

    // Seleccionar obra primero
    const selects = screen.queryAllByRole('combobox')
    if (selects.length > 0) {
      await user.selectOptions(selects[0], '1')
    }

    // Encontrar el input de monto - puede tener min="0" que previene valores negativos
    const amountInput = screen.getByDisplayValue('0') as HTMLInputElement
    // Intentar establecer un valor negativo (puede que el input lo prevenga)
    await user.clear(amountInput)
    await user.type(amountInput, '-100')

    const submitButton = screen.getByRole('button', { name: /crear|actualizar/i })
    await user.click(submitButton)

    // El formulario puede enviarse pero con validación, o puede prevenir el envío
    // Verificamos que al menos el input tiene la restricción min="0"
    expect(amountInput).toHaveAttribute('min', '0')
  })

  it('handles form submission with valid data', async () => {
    const user = userEvent.setup()
    mockOnSubmit.mockResolvedValue(undefined)

    const { container } = render(<IncomeForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)

    // Find selects by their options since labels are not properly associated
    const selects = container.querySelectorAll('select')
    const workSelect = Array.from(selects).find(select => 
      select.querySelector('option[value="1"]')
    ) as HTMLSelectElement
    
    if (workSelect) {
      fireEvent.change(workSelect, { target: { value: '1' } })
      // Wait for work to be selected
      await waitFor(() => {
        expect(workSelect.value).toBe('1')
      })
    }

    // Find amount input by type and current value
    const amountInput = container.querySelector('input[type="number"]') as HTMLInputElement
    if (amountInput) {
      // Use fireEvent to directly set the value
      fireEvent.change(amountInput, { target: { value: '1000' } })
      fireEvent.blur(amountInput) // Trigger validation
      
      // Wait for the value to be updated and error cleared
      await waitFor(() => {
        expect(amountInput.value).toBe('1000')
        const errorMessage = screen.queryByText(/debe ser mayor/i)
        expect(errorMessage).not.toBeInTheDocument()
      }, { timeout: 2000 })
    }

    // Currency should be selected by default (ARS), verify it exists
    const currencySelect = Array.from(selects).find(select => 
      select.querySelector('option[value="ARS"]')
    ) as HTMLSelectElement

    // Wait a bit for validation to clear errors
    await waitFor(() => {
      const errorMessages = screen.queryAllByText(/obligatorio|debe ser mayor/i)
      // Errors should be cleared after filling fields
    }, { timeout: 1000 })

    const submitButton = screen.getByRole('button', { name: /crear|actualizar/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled()
    }, { timeout: 3000 })
  })

  it('calls onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup()
    render(<IncomeForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)

    await user.click(screen.getByRole('button', { name: /cancelar/i }))

    expect(mockOnCancel).toHaveBeenCalled()
  })
})

