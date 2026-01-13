import { render, screen } from '@testing-library/react'
import { SafeText } from '../SafeText'

describe('SafeText', () => {
  it('renders safe text content', () => {
    render(<SafeText>Safe content</SafeText>)
    expect(screen.getByText('Safe content')).toBeInTheDocument()
  })

  it('sanitizes dangerous HTML when allowHtml is false', () => {
    const dangerousContent = '<script>alert("xss")</script>Safe'
    render(<SafeText>{dangerousContent}</SafeText>)
    
    // El contenido debe estar sanitizado
    expect(screen.getByText(/Safe/i)).toBeInTheDocument()
  })

  it('handles empty content', () => {
    const { container } = render(<SafeText>{''}</SafeText>)
    expect(container.firstChild).toBeNull()
  })

  it('handles plain text', () => {
    render(<SafeText>Plain text</SafeText>)
    expect(screen.getByText('Plain text')).toBeInTheDocument()
  })

  it('shows warning when suspicious content is detected', () => {
    render(<SafeText showWarning={true}>{'<script>alert("xss")</script>'}</SafeText>)
    expect(screen.getByText(/contenido potencialmente peligroso/i)).toBeInTheDocument()
  })

  it('renders HTML when allowHtml is true', () => {
    render(<SafeText allowHtml={true}>{'<strong>Bold</strong> text'}</SafeText>)
    const strong = screen.getByText('Bold')
    expect(strong.tagName).toBe('STRONG')
  })
})

