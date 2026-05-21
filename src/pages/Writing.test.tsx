import { render, screen, fireEvent, act, waitFor } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import Writing from './Writing'

const getTextarea = () => screen.getByRole('textbox') as HTMLTextAreaElement
const typeEssay = (text: string) => fireEvent.change(getTextarea(), { target: { value: text } })
const LONG_ESSAY =
  'The graph shows the number of students studying computer science at a UK university between 2010 and 2020. ' +
  'There was a significant increase in enrollment over the period. In 2010 approximately five hundred students were enrolled in the program. ' +
  'By 2015 this figure had risen to about one thousand students showing steady growth. ' +
  'The most dramatic growth occurred between 2015 and 2020 when numbers doubled from one thousand to over two thousand. ' +
  'This represents a fourfold increase over the entire decade. ' +
  'Several factors contributed to this trend. First the growing demand for technology professionals made computer science more attractive. ' +
  'Second the university invested heavily in its computer science facilities and faculty. ' +
  'Third the rise of the tech industry created more job opportunities for graduates. ' +
  'Overall the data indicates a strong and sustained growing interest in computer science at this university. ' +
  'The trend is expected to continue in the coming years as technology becomes increasingly important in our daily lives and across all industries worldwide.'

// ─── Mode Tests ───────────────────────────────────────────────────────────
describe('Writing - Mode Toggle', () => {
  it('renders both mode buttons', () => {
    render(<Writing />)
    expect(screen.getByText('正常写作')).toBeInTheDocument()
    expect(screen.getByText('语法教学')).toBeInTheDocument()
  })

  it('switches to teaching mode', () => {
    render(<Writing />)
    fireEvent.click(screen.getByText('语法教学'))
    expect(screen.getByText('🎓')).toBeInTheDocument()
  })

  it('switches back to writing mode', () => {
    render(<Writing />)
    fireEvent.click(screen.getByText('语法教学'))
    fireEvent.click(screen.getByText('正常写作'))
    expect(screen.getByText('正常写作')).toBeInTheDocument()
  })
})

// ─── Topic Selection Tests ────────────────────────────────────────────────
describe('Writing - Topic Selection', () => {
  it('shows Task 1 and Task 2 tabs', () => {
    render(<Writing />)
    expect(screen.getByText(/📊 Task 1/)).toBeInTheDocument()
    expect(screen.getByText(/📝 Task 2/)).toBeInTheDocument()
  })

  it('shows Task 1 topics by default', () => {
    render(<Writing />)
    expect(screen.getByText('Line Graph')).toBeInTheDocument()
    expect(screen.getByText('Table')).toBeInTheDocument()
    expect(screen.getByText('Pie Chart')).toBeInTheDocument()
  })

  it('shows Task 2 topics when switched', () => {
    render(<Writing />)
    fireEvent.click(screen.getByRole('button', { name: /📝 Task 2/ }))
    expect(screen.getAllByText(/To what extent|main causes|Do the advantages|positive or negative/).length).toBeGreaterThan(0)
  })

  it('highlights selected topic', () => {
    render(<Writing />)
    expect(screen.getAllByText('✓ 已选择').length).toBeGreaterThanOrEqual(1)
  })
})

// ─── Word Count Tests ───────────────────────────────────────────────────
describe('Writing - Word Count', () => {
  it('shows word count as 0 initially', () => {
    render(<Writing />)
    expect(screen.getByText(/0\/150/)).toBeInTheDocument()
  })

  it('disables submit button when empty', () => {
    render(<Writing />)
    expect(screen.getByText('🚀 提交批改')).toBeDisabled()
  })

  it('enables submit when word count sufficient', () => {
    render(<Writing />)
    typeEssay(LONG_ESSAY + ' extra words to meet the min requirement definitely yes.')
    expect(screen.getByText('🚀 提交批改')).not.toBeDisabled()
  })

  it('shows Task 1 min word count', () => {
    render(<Writing />)
    expect(screen.getByText(/\/150/)).toBeInTheDocument()
  })

  it('shows Task 2 min word count', () => {
    render(<Writing />)
    fireEvent.click(screen.getByRole('button', { name: /📝 Task 2/ }))
    expect(screen.getByText(/\/250/)).toBeInTheDocument()
  })
})

// ─── Submit Flow Tests ─────────────────────────────────────────────────
describe('Writing - Submit Flow', () => {
  it('shows loading state when submitting', () => {
    render(<Writing />)
    typeEssay(LONG_ESSAY)
    fireEvent.click(screen.getByText('🚀 提交批改'))
    expect(screen.getByText('批改中...')).toBeInTheDocument()
  })

  it('shows feedback panel and scores after submission', async () => {
    render(<Writing />)
    typeEssay(LONG_ESSAY)
    fireEvent.click(screen.getByText('🚀 提交批改'))
    await act(() => new Promise(r => setTimeout(r, 2100)))
    await waitFor(() => {
      expect(screen.getByText('总体得分')).toBeInTheDocument()
    }, { timeout: 5000 })
    await waitFor(() => {
      expect(screen.getByText('Band Score')).toBeInTheDocument()
    }, { timeout: 3000 })
    expect(screen.getByText('TR')).toBeInTheDocument()
  })

  it('shows corrections after submission', async () => {
    render(<Writing />)
    typeEssay(LONG_ESSAY)
    fireEvent.click(screen.getByText('🚀 提交批改'))
    await act(() => new Promise(r => setTimeout(r, 2100)))
    await waitFor(() => {
      expect(screen.getByText(/批改详情/)).toBeInTheDocument()
    }, { timeout: 5000 })
  })

  it('shows reset button after submission', async () => {
    render(<Writing />)
    typeEssay(LONG_ESSAY)
    fireEvent.click(screen.getByText('🚀 提交批改'))
    await act(() => new Promise(r => setTimeout(r, 2100)))
    await waitFor(() => {
      expect(screen.getByText('✏️ 重新写作')).toBeInTheDocument()
    }, { timeout: 5000 })
  })
})

// ─── Teaching Mode - Grammar Analysis Tests ────────────────────────────
describe('Writing - Teaching Mode Grammar Analysis', () => {
  it('switches to teaching mode and shows grammar tips', () => {
    render(<Writing />)
    fireEvent.click(screen.getByText('语法教学'))
    typeEssay('He have a problem. The graph show the number.')
    expect(screen.getByText('💡 美式语法提示')).toBeInTheDocument()
  })

  it('clears issues when switching back to writing mode', () => {
    render(<Writing />)
    fireEvent.click(screen.getByText('语法教学'))
    typeEssay('He have a problem.')
    fireEvent.click(screen.getByText('正常写作'))
    expect(screen.queryByText('💡 美式语法提示')).not.toBeInTheDocument()
  })
})

// ─── Clear Button Tests ────────────────────────────────────────────────
describe('Writing - Clear Button', () => {
  it('clears textarea content and resets word count', () => {
    render(<Writing />)
    typeEssay(LONG_ESSAY)
    fireEvent.click(screen.getByText('🗑️ 清空'))
    expect(getTextarea().value).toBe('')
    expect(screen.getByText(/0\/150/)).toBeInTheDocument()
  })
})

// ─── Task Switch Tests ──────────────────────────────────────────────────
describe('Writing - Task Switching', () => {
  it('switches between Task 1 and Task 2', () => {
    render(<Writing />)
    expect(screen.getByText('Line Graph')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /📝 Task 2/ }))
    expect(screen.getAllByText(/To what extent|main causes|Do the advantages|positive or negative/).length).toBeGreaterThan(0)
    fireEvent.click(screen.getByRole('button', { name: /📊 Task 1/ }))
    expect(screen.getByText('Line Graph')).toBeInTheDocument()
  })

  it('resets essay when switching tasks', () => {
    render(<Writing />)
    typeEssay('This should be cleared.')
    fireEvent.click(screen.getByRole('button', { name: /📝 Task 2/ }))
    expect(getTextarea().value).toBe('')
  })
})

// ─── Reset After Submit Tests ─────────────────────────────────────────
describe('Writing - Reset After Submit', () => {
  it('shows topic selection again after reset', async () => {
    render(<Writing />)
    typeEssay(LONG_ESSAY)
    fireEvent.click(screen.getByText('🚀 提交批改'))
    await act(() => new Promise(r => setTimeout(r, 2100)))
    await waitFor(() => {
      expect(screen.getByText('总体得分')).toBeInTheDocument()
    }, { timeout: 5000 })
    fireEvent.click(screen.getByText('✏️ 重新写作'))
    await waitFor(() => {
      expect(screen.getByText('Line Graph')).toBeInTheDocument()
    }, { timeout: 3000 })
  })
})

// ─── Edge Case Tests ────────────────────────────────────────────────
describe('Writing - Edge Cases', () => {
  it('handles long essay without crashing', () => {
    render(<Writing />)
    typeEssay(Array(200).fill('test word for writing exercise').join(' '))
    expect(getTextarea()).toBeInTheDocument()
  })

  it('handles Task 2 word count display', () => {
    render(<Writing />)
    fireEvent.click(screen.getByRole('button', { name: /📝 Task 2/ }))
    expect(screen.getByText(/\/250/)).toBeInTheDocument()
  })
})
