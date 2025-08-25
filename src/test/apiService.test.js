/**
 * API Service Tests
 * Tests for backend communication and file handling
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  checkBackendHealth,
  getSupportedFormats,
  isValidAudioFile,
  transcribeAudio,
  getErrorMessage,
  downloadMidiFile
} from '../services/apiService'

// Mock fetch globally
global.fetch = vi.fn()

describe('API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('checkBackendHealth', () => {
    it('should return true when backend is healthy', async () => {
      fetch.mockResolvedValueOnce({
        json: () => Promise.resolve({ status: 'healthy' })
      })

      const result = await checkBackendHealth()
      expect(result).toBe(true)
      expect(fetch).toHaveBeenCalledWith('http://localhost:5000/health')
    })

    it('should return false when backend is unhealthy', async () => {
      fetch.mockResolvedValueOnce({
        json: () => Promise.resolve({ status: 'unhealthy' })
      })

      const result = await checkBackendHealth()
      expect(result).toBe(false)
    })

    it('should return false when fetch fails', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'))

      const result = await checkBackendHealth()
      expect(result).toBe(false)
    })
  })

  describe('getSupportedFormats', () => {
    it('should return supported formats from backend', async () => {
      const mockFormats = {
        supported_formats: ['wav', 'mp3', 'flac'],
        max_file_size_mb: 50
      }

      fetch.mockResolvedValueOnce({
        json: () => Promise.resolve(mockFormats)
      })

      const result = await getSupportedFormats()
      expect(result).toEqual(mockFormats)
      expect(fetch).toHaveBeenCalledWith('http://localhost:5000/supported_formats')
    })

    it('should return default formats when fetch fails', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'))

      const result = await getSupportedFormats()
      expect(result).toEqual({
        supported_formats: ['wav', 'mp3', 'flac', 'm4a'],
        max_file_size_mb: 50
      })
    })
  })

  describe('isValidAudioFile', () => {
    it('should validate audio file correctly', () => {
      const validFile = new File(['content'], 'test.wav', { type: 'audio/wav' })
      Object.defineProperty(validFile, 'size', { value: 1024 * 1024 }) // 1MB

      const result = isValidAudioFile(validFile, ['wav', 'mp3'], 50)
      expect(result).toBe(true)
    })

    it('should reject file with unsupported extension', () => {
      const invalidFile = new File(['content'], 'test.txt', { type: 'text/plain' })
      
      const result = isValidAudioFile(invalidFile, ['wav', 'mp3'], 50)
      expect(result).toBe(false)
    })

    it('should reject file that is too large', () => {
      const largeFile = new File(['content'], 'test.wav', { type: 'audio/wav' })
      Object.defineProperty(largeFile, 'size', { value: 100 * 1024 * 1024 }) // 100MB

      const result = isValidAudioFile(largeFile, ['wav', 'mp3'], 50)
      expect(result).toBe(false)
    })

    it('should return false for null file', () => {
      const result = isValidAudioFile(null, ['wav', 'mp3'], 50)
      expect(result).toBe(false)
    })
  })

  describe('transcribeAudio', () => {
    it('should successfully transcribe audio file', async () => {
      const mockFile = new File(['audio'], 'test.wav', { type: 'audio/wav' })
      const mockMidiBlob = new Blob(['midi data'], { type: 'audio/midi' })

      fetch.mockResolvedValueOnce({
        ok: true,
        blob: () => Promise.resolve(mockMidiBlob)
      })

      const result = await transcribeAudio(mockFile)
      
      expect(result.success).toBe(true)
      expect(result.midiFile).toBe(mockMidiBlob)
      expect(result.filename).toBe('test.mid')
    })

    it('should handle transcription error', async () => {
      const mockFile = new File(['audio'], 'test.wav', { type: 'audio/wav' })

      fetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: 'File too large' })
      })

      const result = await transcribeAudio(mockFile)
      
      expect(result.success).toBe(false)
      expect(result.error).toBe('File too large')
    })

    it('should handle network error', async () => {
      const mockFile = new File(['audio'], 'test.wav', { type: 'audio/wav' })

      fetch.mockRejectedValueOnce(new Error('Network error'))

      const result = await transcribeAudio(mockFile)
      
      expect(result.success).toBe(false)
      expect(result.error).toBe('Network error')
    })
  })

  describe('getErrorMessage', () => {
    it('should return user-friendly error messages', () => {
      expect(getErrorMessage('File too large')).toBe('Please select a smaller audio file (max 50MB)')
      expect(getErrorMessage('File type not supported')).toBe('Please use WAV, MP3, FLAC, or M4A files')
      expect(getErrorMessage('Unknown error')).toBe('An unexpected error occurred. Please try again.')
    })
  })

  describe('downloadMidiFile', () => {
    it('should trigger file download', () => {
      // Mock DOM elements
      const mockLink = {
        href: '',
        download: '',
        click: vi.fn()
      }
      
      const createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue(mockLink)
      const appendChildSpy = vi.spyOn(document.body, 'appendChild').mockImplementation(() => {})
      const removeChildSpy = vi.spyOn(document.body, 'removeChild').mockImplementation(() => {})

      const mockBlob = new Blob(['midi data'], { type: 'audio/midi' })
      const filename = 'test.mid'

      downloadMidiFile(mockBlob, filename)

      expect(createElementSpy).toHaveBeenCalledWith('a')
      expect(mockLink.download).toBe(filename)
      expect(mockLink.click).toHaveBeenCalled()
      expect(appendChildSpy).toHaveBeenCalledWith(mockLink)
      expect(removeChildSpy).toHaveBeenCalledWith(mockLink)
    })
  })
})
