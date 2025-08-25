/**
 * Integration Tests
 * Tests for complete user workflows and integration between components
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../App'
import * as apiService from '../services/apiService'
import * as midiProcessor from '../services/midiProcessor'

// Mock all external dependencies
vi.mock('../services/apiService')
vi.mock('../services/midiProcessor')

// Mock VexFlow and ABCJS since they use DOM manipulation
vi.mock('vexflow', () => ({
  Renderer: vi.fn().mockImplementation(() => ({
    resize: vi.fn(),
    getContext: vi.fn(() => ({
      fillText: vi.fn()
    }))
  })),
  Stave: vi.fn().mockImplementation(() => ({
    addClef: vi.fn().mockReturnThis(),
    addTimeSignature: vi.fn().mockReturnThis(),
    setContext: vi.fn().mockReturnThis(),
    draw: vi.fn()
  })),
  StaveNote: vi.fn(),
  Voice: vi.fn().mockImplementation(() => ({
    addTickables: vi.fn(),
    draw: vi.fn()
  })),
  Formatter: vi.fn().mockImplementation(() => ({
    joinVoices: vi.fn().mockReturnThis(),
    format: vi.fn()
  }))
}))

vi.mock('abcjs', () => ({
  default: {
    renderAbc: vi.fn()
  }
}))

describe('App Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Default mocks
    apiService.checkBackendHealth.mockResolvedValue(true)
    apiService.getSupportedFormats.mockResolvedValue({
      supported_formats: ['wav', 'mp3', 'flac', 'm4a'],
      max_file_size_mb: 50
    })
    apiService.isValidAudioFile.mockReturnValue(true)
  })

  it('should render the main application with all sections', async () => {
    render(<App />)
    
    // Check header
    expect(screen.getByText(/audio to midi converter/i)).toBeInTheDocument()
    expect(screen.getByText('Sergie Code')).toBeInTheDocument()
    
    // Check file upload section
    await waitFor(() => {
      expect(screen.getByText(/upload audio file/i)).toBeInTheDocument()
    })
    
    // Check sheet music placeholder
    expect(screen.getByText(/upload an audio file to see the generated sheet music/i)).toBeInTheDocument()
    
    // Check footer
    expect(screen.getByText(/built with react, vexflow, and abcjs/i)).toBeInTheDocument()
  })

  it('should complete full transcription workflow', async () => {
    // Mock successful transcription
    const mockMidiBlob = new Blob(['midi data'], { type: 'audio/midi' })
    const mockParsedMidi = {
      name: 'Test Song',
      duration: 4.5,
      tracks: [{ notes: [{ name: 'C4', duration: 0.5 }] }]
    }
    const mockSummary = {
      name: 'Test Song',
      duration: '4.5 seconds',
      tracks: 1,
      totalNotes: 1,
      instruments: 'Piano'
    }

    apiService.transcribeAudio.mockResolvedValue({
      success: true,
      midiFile: mockMidiBlob,
      filename: 'test.mid'
    })

    midiProcessor.parseMidiBlob.mockResolvedValue(mockParsedMidi)
    midiProcessor.getMidiSummary.mockReturnValue(mockSummary)
    midiProcessor.convertMidiToABC.mockReturnValue('X:1\nT:Test Song\nK:C\nC')
    midiProcessor.convertMidiToVexFlow.mockReturnValue([
      { keys: ['C/4'], duration: 'q', midi: 60, time: 0 }
    ])

    const { container } = render(<App />)

    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByText(/upload audio file/i)).toBeInTheDocument()
    })

    // Create and upload a file
    const file = new File(['audio content'], 'test.wav', { type: 'audio/wav' })
    const fileInput = container.querySelector('input[type="file"]')
    
    await userEvent.upload(fileInput, file)

    // Wait for transcription to complete
    await waitFor(() => {
      expect(screen.getByText(/transcription successful/i)).toBeInTheDocument()
    }, { timeout: 3000 })

    // Check that MIDI summary is displayed
    expect(screen.getByText('4.5 seconds')).toBeInTheDocument()
    expect(screen.getByText('Piano')).toBeInTheDocument()

    // Check that sheet music viewer is shown
    expect(screen.getByRole('heading', { name: /generated sheet music/i })).toBeInTheDocument()

    // Test download functionality
    const downloadButtons = screen.getAllByRole('button', { name: /download midi/i })
    expect(downloadButtons.length).toBeGreaterThan(0) // At least one download button should be present
  })

  it('should handle transcription errors gracefully', async () => {
    apiService.transcribeAudio.mockResolvedValue({
      success: false,
      error: 'File too large'
    })

    apiService.getErrorMessage.mockReturnValue('Please select a smaller audio file (max 50MB)')

    const { container } = render(<App />)

    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByText(/upload audio file/i)).toBeInTheDocument()
    })

    // Upload a file
    const file = new File(['audio content'], 'test.wav', { type: 'audio/wav' })
    const fileInput = container.querySelector('input[type="file"]')

    await userEvent.upload(fileInput, file)    // Wait for error to be displayed
    await waitFor(() => {
      expect(screen.getByText(/transcription error/i)).toBeInTheDocument()
      expect(screen.getByText(/please select a smaller audio file/i)).toBeInTheDocument()
    })

    // Check that try again button is available
    expect(screen.getByText(/try again with a different file/i)).toBeInTheDocument()
  })

  it('should show backend status correctly', async () => {
    // Test online status
    apiService.checkBackendHealth.mockResolvedValue(true)
    
    render(<App />)
    
    await waitFor(() => {
      expect(screen.getByText(/backend online/i)).toBeInTheDocument()
    })
  })

  it('should handle offline backend', async () => {
    apiService.checkBackendHealth.mockResolvedValue(false)
    
    render(<App />)
    
    await waitFor(() => {
      expect(screen.getByText(/backend offline/i)).toBeInTheDocument()
      expect(screen.getByText(/make sure the backend server is running/i)).toBeInTheDocument()
    })
  })

  it('should allow switching between notation libraries', async () => {
    // Setup successful transcription first
    const mockMidiBlob = new Blob(['midi data'], { type: 'audio/midi' })
    const mockParsedMidi = {
      name: 'Test Song',
      duration: 4.5,
      tracks: [{ notes: [{ name: 'C4', duration: 0.5 }] }]
    }

    apiService.transcribeAudio.mockResolvedValue({
      success: true,
      midiFile: mockMidiBlob,
      filename: 'test.mid'
    })

    midiProcessor.parseMidiBlob.mockResolvedValue(mockParsedMidi)
    midiProcessor.getMidiSummary.mockReturnValue({
      name: 'Test Song',
      duration: '4.5 seconds',
      tracks: 1,
      totalNotes: 1,
      instruments: 'Piano'
    })
    midiProcessor.convertMidiToABC.mockReturnValue('X:1\nT:Test Song\nK:C\nC')
    midiProcessor.convertMidiToVexFlow.mockReturnValue([
      { keys: ['C/4'], duration: 'q', midi: 60, time: 0 }
    ])

    const { container } = render(<App />)

    // Upload file and wait for transcription
    await waitFor(() => {
      expect(screen.getByText(/upload audio file/i)).toBeInTheDocument()
    })

    const file = new File(['audio content'], 'test.wav', { type: 'audio/wav' })
    const fileInput = container.querySelector('input[type="file"]')
    await userEvent.upload(fileInput, file)

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /generated sheet music/i })).toBeInTheDocument()
    })

    // Test switching to VexFlow
    const vexflowButton = screen.getByRole('button', { name: /vexflow/i })
    await userEvent.click(vexflowButton)

    expect(screen.getByText(/vexflow notation/i)).toBeInTheDocument()

    // Test switching back to ABCJS
    const abcjsButton = screen.getByRole('button', { name: /abcjs/i })
    await userEvent.click(abcjsButton)

    expect(screen.getByText(/abcjs notation/i)).toBeInTheDocument()
  })

  it('should handle reset functionality', async () => {
    // Setup successful transcription
    const mockMidiBlob = new Blob(['midi data'], { type: 'audio/midi' })
    apiService.transcribeAudio.mockResolvedValue({
      success: true,
      midiFile: mockMidiBlob,
      filename: 'test.mid'
    })

    const { container } = render(<App />)

    // Complete transcription workflow first
    await waitFor(() => {
      expect(screen.getByText(/upload audio file/i)).toBeInTheDocument()
    })

    const file = new File(['audio content'], 'test.wav', { type: 'audio/wav' })
    const fileInput = container.querySelector('input[type="file"]')
    await userEvent.upload(fileInput, file)

    await waitFor(() => {
      expect(screen.getByText(/transcription successful/i)).toBeInTheDocument()
    })

    // Click reset button
    const resetButton = screen.getByRole('button', { name: /convert another file/i })
    await userEvent.click(resetButton)

    // Check that the app is reset
    expect(screen.queryByText(/transcription successful/i)).not.toBeInTheDocument()
    expect(screen.getByText(/upload an audio file to see the generated sheet music/i)).toBeInTheDocument()
  })
})
