/**
 * React Component Tests
 * Tests for UI components and user interactions
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import BackendStatus from '../components/BackendStatus'
import FileUploader from '../components/FileUploader'
import SheetMusicViewer from '../components/SheetMusicViewer'
import * as apiService from '../services/apiService'

// Mock the API service
vi.mock('../services/apiService')

describe('BackendStatus Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should show checking status initially', () => {
    apiService.checkBackendHealth.mockResolvedValue(true)
    
    render(<BackendStatus />)
    
    expect(screen.getByText(/checking status/i)).toBeInTheDocument()
  })

  it('should show online status when backend is healthy', async () => {
    apiService.checkBackendHealth.mockResolvedValue(true)
    
    render(<BackendStatus />)
    
    await waitFor(() => {
      expect(screen.getByText(/backend online/i)).toBeInTheDocument()
    })
  })

  it('should show offline status when backend is unhealthy', async () => {
    apiService.checkBackendHealth.mockResolvedValue(false)
    
    render(<BackendStatus />)
    
    await waitFor(() => {
      expect(screen.getByText(/backend offline/i)).toBeInTheDocument()
      expect(screen.getByText(/make sure the backend server is running/i)).toBeInTheDocument()
    })
  })
})

describe('FileUploader Component', () => {
  const mockOnFileUpload = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    apiService.getSupportedFormats.mockResolvedValue({
      supported_formats: ['wav', 'mp3', 'flac', 'm4a'],
      max_file_size_mb: 50
    })
  })

  it('should render upload zone with instructions', async () => {
    render(<FileUploader onFileUpload={mockOnFileUpload} isTranscribing={false} />)
    
    await waitFor(() => {
      expect(screen.getByText(/drag & drop an audio file here/i)).toBeInTheDocument()
      expect(screen.getByText(/supported formats: WAV, MP3, FLAC, M4A/i)).toBeInTheDocument()
    })
  })

  it('should show processing state when transcribing', () => {
    render(<FileUploader onFileUpload={mockOnFileUpload} isTranscribing={true} />)
    
    expect(screen.getByText(/processing your audio file/i)).toBeInTheDocument()
  })

  it('should handle valid file upload', async () => {
    apiService.isValidAudioFile.mockReturnValue(true)
    
    const { container } = render(<FileUploader onFileUpload={mockOnFileUpload} isTranscribing={false} />)
    
    const fileInput = container.querySelector('input[type="file"]') // The hidden file input
    const file = new File(['audio content'], 'test.wav', { type: 'audio/wav' })
    
    await userEvent.upload(fileInput, file)
    
    expect(mockOnFileUpload).toHaveBeenCalledWith(file)
  })

  it('should reject invalid file types', async () => {
    apiService.isValidAudioFile.mockReturnValue(false)
    
    // Mock alert
    window.alert = vi.fn()
    
    const { container } = render(<FileUploader onFileUpload={mockOnFileUpload} isTranscribing={false} />)
    
    const fileInput = container.querySelector('input[type="file"]')
    const file = new File(['content'], 'test.txt', { type: 'text/plain' })
    
    await userEvent.upload(fileInput, file)
    
    expect(mockOnFileUpload).not.toHaveBeenCalled()
    expect(window.alert).toHaveBeenCalledWith(
      expect.stringContaining('Invalid file type')
    )
  })

  it('should show how it works section', async () => {
    render(<FileUploader onFileUpload={mockOnFileUpload} isTranscribing={false} />)
    
    await waitFor(() => {
      expect(screen.getByText(/how it works/i)).toBeInTheDocument()
      expect(screen.getByText(/upload your audio file/i)).toBeInTheDocument()
      expect(screen.getByText(/our ai analyzes the audio/i)).toBeInTheDocument()
    })
  })
})

describe('SheetMusicViewer Component', () => {
  const mockMidiData = {
    name: 'Test Song',
    duration: 4.5,
    tracks: [
      {
        notes: [
          { name: 'C4', duration: 0.5, time: 0 },
          { name: 'D4', duration: 0.5, time: 0.5 }
        ]
      }
    ]
  }

  const mockMidiSummary = {
    name: 'Test Song',
    duration: '4.5 seconds',
    tracks: 1,
    totalNotes: 2,
    instruments: 'Piano'
  }

  const mockOnDownload = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should show placeholder when no MIDI data', () => {
    render(<SheetMusicViewer midiData={null} midiSummary={null} onDownload={mockOnDownload} />)
    
    expect(screen.getByText(/upload an audio file to see the generated sheet music/i)).toBeInTheDocument()
  })

  it('should show MIDI summary information', () => {
    render(
      <SheetMusicViewer 
        midiData={mockMidiData} 
        midiSummary={mockMidiSummary} 
        onDownload={mockOnDownload} 
      />
    )
    
    expect(screen.getByText('4.5 seconds')).toBeInTheDocument()
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('Piano')).toBeInTheDocument()
  })

  it('should have notation library toggle buttons', () => {
    render(
      <SheetMusicViewer 
        midiData={mockMidiData} 
        midiSummary={mockMidiSummary} 
        onDownload={mockOnDownload} 
      />
    )
    
    expect(screen.getByRole('button', { name: /abcjs/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /vexflow/i })).toBeInTheDocument()
  })

  it('should have download button that calls onDownload', async () => {
    render(
      <SheetMusicViewer 
        midiData={mockMidiData} 
        midiSummary={mockMidiSummary} 
        onDownload={mockOnDownload} 
      />
    )
    
    const downloadButton = screen.getByRole('button', { name: /download midi/i })
    await userEvent.click(downloadButton)
    
    expect(mockOnDownload).toHaveBeenCalledTimes(1)
  })

  it('should switch between notation libraries', async () => {
    render(
      <SheetMusicViewer 
        midiData={mockMidiData} 
        midiSummary={mockMidiSummary} 
        onDownload={mockOnDownload} 
      />
    )
    
    const vexflowButton = screen.getByRole('button', { name: /vexflow/i })
    await userEvent.click(vexflowButton)
    
    expect(screen.getByText(/vexflow notation/i)).toBeInTheDocument()
  })

  it('should show tips for better results', () => {
    render(
      <SheetMusicViewer 
        midiData={mockMidiData} 
        midiSummary={mockMidiSummary} 
        onDownload={mockOnDownload} 
      />
    )
    
    expect(screen.getByText(/tips for better results/i)).toBeInTheDocument()
    expect(screen.getByText(/use clear, single-instrument recordings/i)).toBeInTheDocument()
  })
})
