import { render, screen } from '@testing-library/react'
import { DashboardModules } from '../DashboardModules'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
    }
  },
}))

describe('DashboardModules', () => {
  it('renders all module cards', () => {
    render(<DashboardModules />)
    
    // Verificar que se renderizan los módulos principales usando getAllByText
    const obrasElements = screen.getAllByText(/obras/i)
    expect(obrasElements.length).toBeGreaterThan(0)
    
    const proveedoresElements = screen.getAllByText(/proveedores/i)
    expect(proveedoresElements.length).toBeGreaterThan(0)
    
    const contabilidadElements = screen.getAllByText(/contabilidad/i)
    expect(contabilidadElements.length).toBeGreaterThan(0)
    
    const alertasElements = screen.getAllByText(/alertas/i)
    expect(alertasElements.length).toBeGreaterThan(0)
    
    const cajaElements = screen.getAllByText(/caja/i)
    expect(cajaElements.length).toBeGreaterThan(0)
  })

  it('renders module descriptions', () => {
    render(<DashboardModules />)
    
    expect(screen.getByText(/gestiona obras/i)).toBeInTheDocument()
    expect(screen.getByText(/administra proveedores/i)).toBeInTheDocument()
    expect(screen.getByText(/reportes financieros/i)).toBeInTheDocument()
  })
})

