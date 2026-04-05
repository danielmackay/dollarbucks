import { render, screen, fireEvent, act } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'

const { mockUpdateServiceWorker, mockUseRegisterSW } = vi.hoisted(() => ({
  mockUpdateServiceWorker: vi.fn(),
  mockUseRegisterSW: vi.fn(),
}))

vi.mock('virtual:pwa-register/react', () => ({
  useRegisterSW: mockUseRegisterSW,
}))

import { UpdatePrompt } from './UpdatePrompt'

describe('UpdatePrompt', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders nothing when no update is pending', () => {
    mockUseRegisterSW.mockImplementation(() => ({
      updateServiceWorker: mockUpdateServiceWorker,
    }))

    const { container } = render(<UpdatePrompt />)
    expect(container).toBeEmptyDOMElement()
  })

  it('shows the modal when onNeedRefresh is called', () => {
    let capturedOnNeedRefresh: (() => void) | undefined

    mockUseRegisterSW.mockImplementation(({ onNeedRefresh }: { onNeedRefresh: () => void }) => {
      capturedOnNeedRefresh = onNeedRefresh
      return { updateServiceWorker: mockUpdateServiceWorker }
    })

    render(<UpdatePrompt />)

    act(() => {
      capturedOnNeedRefresh!()
    })

    expect(screen.getByText('Update Available')).toBeInTheDocument()
    expect(screen.getByText(/A new version of Dollarbucks is ready/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Update Now' })).toBeInTheDocument()
  })

  it('calls updateServiceWorker(true) when Update Now is clicked', () => {
    let capturedOnNeedRefresh: (() => void) | undefined

    mockUseRegisterSW.mockImplementation(({ onNeedRefresh }: { onNeedRefresh: () => void }) => {
      capturedOnNeedRefresh = onNeedRefresh
      return { updateServiceWorker: mockUpdateServiceWorker }
    })

    render(<UpdatePrompt />)

    act(() => {
      capturedOnNeedRefresh!()
    })

    fireEvent.click(screen.getByRole('button', { name: 'Update Now' }))
    expect(mockUpdateServiceWorker).toHaveBeenCalledWith(true)
  })
})
