/**
 * Test setup configuration
 * Sets up testing environment for React components
 */

import '@testing-library/jest-dom'

// Mock the Web Audio API and other browser APIs that aren't available in jsdom
global.AudioContext = class MockAudioContext {
  constructor() {
    this.state = 'running'
    this.sampleRate = 44100
  }
  
  createOscillator() {
    return {
      connect: () => {},
      start: () => {},
      stop: () => {},
      frequency: { value: 440 }
    }
  }
  
  createGain() {
    return {
      connect: () => {},
      gain: { value: 1 }
    }
  }
  
  get destination() {
    return { connect: () => {} }
  }
}

// Mock fetch for API tests
global.fetch = vi.fn()

// Mock URL.createObjectURL and URL.revokeObjectURL
global.URL.createObjectURL = vi.fn(() => 'blob:mock-url')
global.URL.revokeObjectURL = vi.fn()

// Mock File API
global.File = class MockFile {
  constructor(bits, name, options = {}) {
    this.bits = bits
    this.name = name
    this.type = options.type || ''
    this.size = bits.reduce((acc, bit) => acc + (bit.length || bit.size || 0), 0)
    this.lastModified = Date.now()
  }
}

// Mock Blob
global.Blob = class MockBlob {
  constructor(parts = [], options = {}) {
    this.parts = parts
    this.type = options.type || ''
    this.size = parts.reduce((acc, part) => acc + (part.length || part.size || 0), 0)
  }
  
  arrayBuffer() {
    return Promise.resolve(new ArrayBuffer(8))
  }
  
  text() {
    return Promise.resolve(this.parts.join(''))
  }
}

// Mock FormData
global.FormData = class MockFormData {
  constructor() {
    this.data = new Map()
  }
  
  append(key, value) {
    this.data.set(key, value)
  }
  
  get(key) {
    return this.data.get(key)
  }
  
  has(key) {
    return this.data.has(key)
  }
}
