/**
 * MIDI Processor Tests
 * Tests for MIDI parsing and conversion functionality
 */

import { describe, it, expect, vi } from 'vitest'
import {
  parseMidiBlob,
  convertNoteToABC,
  convertMidiToABC,
  convertMidiToVexFlow,
  getMidiSummary
} from '../services/midiProcessor'

// Mock @tonejs/midi
vi.mock('@tonejs/midi', () => ({
  Midi: vi.fn().mockImplementation(() => ({
    name: 'Test Song',
    duration: 4.5,
    tracks: [
      {
        name: 'Track 1',
        instrument: { name: 'Piano' },
        notes: [
          {
            name: 'C4',
            midi: 60,
            time: 0,
            duration: 0.5,
            velocity: 0.8,
            octave: 4,
            pitch: 261.63
          },
          {
            name: 'D4',
            midi: 62,
            time: 0.5,
            duration: 0.5,
            velocity: 0.7,
            octave: 4,
            pitch: 293.66
          }
        ]
      }
    ]
  }))
}))

describe('MIDI Processor', () => {
  describe('parseMidiBlob', () => {
    it('should parse MIDI blob successfully', async () => {
      const mockBlob = new Blob(['mock midi data'])
      
      const result = await parseMidiBlob(mockBlob)
      
      expect(result).toEqual({
        name: 'Test Song',
        duration: 4.5,
        tracks: [
          {
            name: 'Track 1',
            instrument: { name: 'Piano' },
            notes: [
              {
                name: 'C4',
                midi: 60,
                time: 0,
                duration: 0.5,
                velocity: 0.8,
                octave: 4,
                pitch: 261.63
              },
              {
                name: 'D4',
                midi: 62,
                time: 0.5,
                duration: 0.5,
                velocity: 0.7,
                octave: 4,
                pitch: 293.66
              }
            ]
          }
        ]
      })
    })

    it('should handle parsing errors', async () => {
      const { Midi } = await import('@tonejs/midi')
      Midi.mockImplementationOnce(() => {
        throw new Error('Invalid MIDI data')
      })

      const mockBlob = new Blob(['invalid midi data'])
      
      await expect(parseMidiBlob(mockBlob)).rejects.toThrow('Failed to parse MIDI file')
    })
  })

  describe('convertNoteToABC', () => {
    it('should convert C4 note correctly', () => {
      const note = {
        name: 'C4',
        duration: 0.5
      }
      
      const result = convertNoteToABC(note)
      expect(result).toBe('C')
    })

    it('should convert C#5 note with sharp', () => {
      const note = {
        name: 'C#5',
        duration: 0.5
      }
      
      const result = convertNoteToABC(note)
      expect(result).toBe('^c')
    })

    it('should handle different durations', () => {
      const shortNote = { name: 'C4', duration: 0.2 }
      const longNote = { name: 'C4', duration: 2 }
      
      expect(convertNoteToABC(shortNote)).toBe('C/4')
      expect(convertNoteToABC(longNote)).toBe('C4') // Whole note in ABC notation
    })

    it('should handle different octaves', () => {
      const lowNote = { name: 'C3', duration: 0.5 }
      const highNote = { name: 'C6', duration: 0.5 }
      
      expect(convertNoteToABC(lowNote)).toBe('C,')
      expect(convertNoteToABC(highNote)).toBe("c'") // C6 = c' not c''
    })
  })

  describe('convertMidiToABC', () => {
    it('should convert MIDI data to ABC notation', () => {
      const midiData = {
        name: 'Test Song',
        tracks: [
          {
            notes: [
              { name: 'C4', duration: 0.5, time: 0 },
              { name: 'D4', duration: 0.5, time: 0.5 }
            ]
          }
        ]
      }
      
      const result = convertMidiToABC(midiData)
      
      expect(result).toContain('X:1')
      expect(result).toContain('T:Test Song')
      expect(result).toContain('M:4/4')
      expect(result).toContain('L:1/4')
      expect(result).toContain('K:C')
      expect(result).toContain('C D')
    })

    it('should handle MIDI data without tracks', () => {
      const midiData = {
        name: 'Empty Song',
        tracks: []
      }
      
      const result = convertMidiToABC(midiData)
      
      expect(result).toContain('X:1')
      expect(result).toContain('T:Empty Song')
    })

    it('should handle errors gracefully', () => {
      const invalidMidiData = null
      
      const result = convertMidiToABC(invalidMidiData)
      
      expect(result).toContain('T:Error')
      expect(result).toContain('z4') // Empty measure
    })
  })

  describe('convertMidiToVexFlow', () => {
    it('should convert MIDI data to VexFlow format', () => {
      const midiData = {
        tracks: [
          {
            notes: [
              {
                name: 'C4',
                duration: 0.5,
                time: 0,
                midi: 60
              },
              {
                name: 'D4',
                duration: 1,
                time: 0.5,
                midi: 62
              }
            ]
          }
        ]
      }
      
      const result = convertMidiToVexFlow(midiData)
      
      expect(result).toHaveLength(2)
      expect(result[0]).toEqual({
        keys: ['C/4'],
        duration: 'q',
        midi: 60,
        time: 0
      })
      expect(result[1]).toEqual({
        keys: ['D/4'],
        duration: 'h', // duration 1.0 -> 'h'
        midi: 62,
        time: 0.5
      })
    })

    it('should handle different note durations', () => {
      const midiData = {
        tracks: [
          {
            notes: [
              { name: 'C4', duration: 0.1, time: 0, midi: 60 }, // Sixteenth
              { name: 'D4', duration: 0.3, time: 0.1, midi: 62 }, // Eighth
              { name: 'E4', duration: 2, time: 0.4, midi: 64 }, // Half
              { name: 'F4', duration: 4, time: 2.4, midi: 65 }  // Whole note (duration >= 2)
            ]
          }
        ]
      }
      
      const result = convertMidiToVexFlow(midiData)
      
      expect(result[0].duration).toBe('16')
      expect(result[1].duration).toBe('8')
      expect(result[2].duration).toBe('h')  // duration 2: should be 'h' since 2 <= 2
      expect(result[3].duration).toBe('w')  // duration 4: should be 'w' since 4 > 2
    })

    it('should return empty array for invalid data', () => {
      const invalidMidiData = null
      
      const result = convertMidiToVexFlow(invalidMidiData)
      
      expect(result).toEqual([])
    })
  })

  describe('getMidiSummary', () => {
    it('should generate MIDI summary correctly', () => {
      const midiData = {
        name: 'Test Song',
        duration: 4.567,
        tracks: [
          {
            notes: [{ name: 'C4' }, { name: 'D4' }],
            instrument: { name: 'Piano' }
          },
          {
            notes: [{ name: 'E4' }],
            instrument: { name: 'Guitar' }
          }
        ]
      }
      
      const result = getMidiSummary(midiData)
      
      expect(result).toEqual({
        name: 'Test Song',
        duration: '4.57 seconds',
        tracks: 2,
        totalNotes: 3,
        instruments: 'Piano, Guitar'
      })
    })

    it('should handle missing name and instruments', () => {
      const midiData = {
        duration: 2.5,
        tracks: [
          {
            notes: [{ name: 'C4' }],
            instrument: undefined
          }
        ]
      }
      
      const result = getMidiSummary(midiData)
      
      expect(result.name).toBe('Transcribed Audio')
      expect(result.instruments).toBe('Piano')
    })

    it('should handle errors gracefully', () => {
      const invalidMidiData = null
      
      const result = getMidiSummary(invalidMidiData)
      
      expect(result).toEqual({
        name: 'Unknown',
        duration: '0 seconds',
        tracks: 0,
        totalNotes: 0,
        instruments: 'Unknown'
      })
    })
  })
})
