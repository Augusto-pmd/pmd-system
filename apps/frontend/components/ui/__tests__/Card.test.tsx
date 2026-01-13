import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Card, CardHeader, CardTitle, CardSubtitle, CardContent, CardFooter } from '../Card'

describe('Card', () => {
  it('renders card with children', () => {
    render(<Card>Card Content</Card>)
    expect(screen.getByText('Card Content')).toBeInTheDocument()
  })

  it('handles click events', async () => {
    const handleClick = jest.fn()
    const user = userEvent.setup()
    
    render(<Card onClick={handleClick}>Clickable Card</Card>)
    
    await user.click(screen.getByText('Clickable Card'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('renders CardHeader with children', () => {
    render(
      <Card>
        <CardHeader>Header Content</CardHeader>
      </Card>
    )
    expect(screen.getByText('Header Content')).toBeInTheDocument()
  })

  it('renders CardTitle with default h3 tag', () => {
    render(
      <Card>
        <CardTitle>Title</CardTitle>
      </Card>
    )
    const title = screen.getByText('Title')
    expect(title.tagName).toBe('H3')
  })

  it('renders CardTitle with custom tag', () => {
    render(
      <Card>
        <CardTitle as="h2">Title</CardTitle>
      </Card>
    )
    const title = screen.getByText('Title')
    expect(title.tagName).toBe('H2')
  })

  it('renders CardSubtitle', () => {
    render(
      <Card>
        <CardSubtitle>Subtitle</CardSubtitle>
      </Card>
    )
    expect(screen.getByText('Subtitle')).toBeInTheDocument()
  })

  it('renders CardContent', () => {
    render(
      <Card>
        <CardContent>Content</CardContent>
      </Card>
    )
    expect(screen.getByText('Content')).toBeInTheDocument()
  })

  it('renders CardFooter', () => {
    render(
      <Card>
        <CardFooter>Footer</CardFooter>
      </Card>
    )
    expect(screen.getByText('Footer')).toBeInTheDocument()
  })

  it('renders complete card structure', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
          <CardSubtitle>Card Subtitle</CardSubtitle>
        </CardHeader>
        <CardContent>Card Content</CardContent>
        <CardFooter>Card Footer</CardFooter>
      </Card>
    )
    
    expect(screen.getByText('Card Title')).toBeInTheDocument()
    expect(screen.getByText('Card Subtitle')).toBeInTheDocument()
    expect(screen.getByText('Card Content')).toBeInTheDocument()
    expect(screen.getByText('Card Footer')).toBeInTheDocument()
  })
})

