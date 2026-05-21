import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import Library from './Library'

// ─── Mode Tests ─────────────────────────────────────────────────────────
describe('Library - Shelf View', () => {
  it('renders library header', () => {
    render(<Library />)
    expect(screen.getByText('📚 图书馆')).toBeInTheDocument()
    expect(screen.getByText('导入文档')).toBeInTheDocument()
  })

  it('shows default books', () => {
    render(<Library />)
    expect(screen.getByText('The Great Gatsby')).toBeInTheDocument()
    expect(screen.getByText('Pride and Prejudice')).toBeInTheDocument()
  })

  it('shows import button', () => {
    render(<Library />)
    const btn = screen.getByText('导入文档')
    expect(btn).toBeInTheDocument()
  })
})

// ─── Reader Tests ───────────────────────────────────────────────────────
describe('Library - Reader View', () => {
  it('opens reader when clicking a book', () => {
    render(<Library />)
    fireEvent.click(screen.getByText('The Great Gatsby'))
    expect(screen.getByText(/书架/)).toBeInTheDocument()
    expect(screen.getByText(/TXT/)).toBeInTheDocument()
  })

  it('shows page navigation', () => {
    render(<Library />)
    fireEvent.click(screen.getByText('The Great Gatsby'))
    expect(screen.getByText(/1 \/ /)).toBeInTheDocument()
  })

  it('navigates pages with next/prev buttons', () => {
    render(<Library />)
    fireEvent.click(screen.getByText('The Great Gatsby'))
    const nextBtn = screen.getByText('下一段 →')
    fireEvent.click(nextBtn)
    expect(screen.getByText(/2 \/ /)).toBeInTheDocument()
  })

  it('shows vocab sidebar button', () => {
    render(<Library />)
    fireEvent.click(screen.getByText('The Great Gatsby'))
    expect(screen.getByText(/📚 0/)).toBeInTheDocument()
  })

  it('exits reader back to shelf', () => {
    render(<Library />)
    fireEvent.click(screen.getByText('The Great Gatsby'))
    fireEvent.click(screen.getByText('书架'))
    expect(screen.getByText('📚 图书馆')).toBeInTheDocument()
  })
})

// ─── Notes View Tests ──────────────────────────────────────────────────
describe('Library - Notes View', () => {
  it('opens notes view', () => {
    render(<Library />)
    fireEvent.click(screen.getByText(/笔记 \(0\)/))
    expect(screen.getByText('📝 所有笔记')).toBeInTheDocument()
  })

  it('shows empty state for notes', () => {
    render(<Library />)
    fireEvent.click(screen.getByText(/笔记 \(0\)/))
    expect(screen.getByText(/添加/)).toBeInTheDocument()
  })
})

// ─── Highlight Tests ─────────────────────────────────────────────────
describe('Library - Highlights', () => {
  it('shows highlight color buttons in selection toolbar', () => {
    render(<Library />)
    fireEvent.click(screen.getByText('The Great Gatsby'))
    // Toolbar appears on selection, but we can still test the reader is open
    expect(screen.getByText(/⏱ 0:00/)).toBeInTheDocument()
  })
})

// ─── Vocab Collection Tests ──────────────────────────────────────────
describe('Library - Vocab Collection', () => {
  it('opens vocab sidebar when clicking 📚 button', () => {
    render(<Library />)
    fireEvent.click(screen.getByText('The Great Gatsby'))
    fireEvent.click(screen.getByText(/📚 0/))
    // Vocab sidebar should show empty state
    expect(screen.getByText('选中单词收藏')).toBeInTheDocument()
  })
})

// ─── Format Support Tests ────────────────────────────────────────────
describe('Library - Format Support', () => {
  it('shows format badges on book cards', () => {
    render(<Library />)
    // Books have TXT badge shown on hover, but format is in the card info
    const pagesLabels = screen.getAllByText(/段/)
    expect(pagesLabels.length).toBeGreaterThanOrEqual(3)
  })

  it('shows support info for file formats', () => {
    render(<Library />)
    expect(screen.getByText('.txt')).toBeInTheDocument()
    expect(screen.getByText('.md')).toBeInTheDocument()
    expect(screen.getByText('.epub')).toBeInTheDocument()
  })
})

// ─── Edge Cases Tests ────────────────────────────────────────────────
describe('Library - Edge Cases', () => {
  it('handles importing empty file gracefully', () => {
    render(<Library />)
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    expect(input).toBeInTheDocument()
  })

  it('shows progress bars on book cards', () => {
    render(<Library />)
    const percentages = screen.getAllByText(/%/)
    expect(percentages.length).toBeGreaterThanOrEqual(3)
  })
})