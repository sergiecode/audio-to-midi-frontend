/**
 * API Service for Audio to MIDI Backend Communication
 * Created by Sergie Code - AI Tools for Musicians
 * 
 * This service handles all communication with the audio-to-midi-backend API
 * Base URL: http://localhost:5000 (development)
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

/**
 * Check if the backend service is healthy and available
 * @returns {Promise<boolean>} True if backend is healthy, false otherwise
 */
export const checkBackendHealth = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    const data = await response.json();
    return data.status === 'healthy';
  } catch (error) {
    console.error('Backend health check failed:', error);
    return false;
  }
};

/**
 * Get supported audio file formats from the backend
 * @returns {Promise<{supported_formats: string[], max_file_size_mb: number}>}
 */
export const getSupportedFormats = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/supported_formats`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to get supported formats:', error);
    // Return default formats as fallback
    return {
      supported_formats: ['wav', 'mp3', 'flac', 'm4a'],
      max_file_size_mb: 50
    };
  }
};

/**
 * Validate audio file based on supported formats and size limits
 * @param {File} file - The audio file to validate
 * @param {string[]} supportedFormats - Array of supported file extensions
 * @param {number} maxSizeMB - Maximum file size in MB
 * @returns {boolean} True if file is valid, false otherwise
 */
export const isValidAudioFile = (file, supportedFormats, maxSizeMB = 50) => {
  if (!file) return false;
  
  // Check file extension
  const extension = file.name.split('.').pop()?.toLowerCase();
  if (!extension || !supportedFormats.includes(extension)) {
    return false;
  }
  
  // Check file size (convert bytes to MB)
  const fileSizeMB = file.size / (1024 * 1024);
  if (fileSizeMB > maxSizeMB) {
    return false;
  }
  
  return true;
};

/**
 * Upload audio file to backend and get MIDI file in return
 * @param {File} audioFile - The audio file to transcribe
 * @returns {Promise<{success: boolean, midiFile?: Blob, filename?: string, error?: string}>}
 */
export const transcribeAudio = async (audioFile) => {
  try {
    const formData = new FormData();
    formData.append('audio_file', audioFile);
    
    const response = await fetch(`${API_BASE_URL}/transcribe`, {
      method: 'POST',
      body: formData,
    });
    
    if (response.ok) {
      const midiBlob = await response.blob();
      const filename = `${audioFile.name.split('.')[0]}.mid`;
      
      return {
        success: true,
        midiFile: midiBlob,
        filename
      };
    } else {
      const errorData = await response.json();
      return {
        success: false,
        error: errorData.error || 'Transcription failed'
      };
    }
  } catch (error) {
    console.error('Transcription error:', error);
    return {
      success: false,
      error: error.message || 'Network error occurred'
    };
  }
};

/**
 * Handle transcription errors with user-friendly messages
 * @param {string} error - The error message from the API
 * @returns {string} User-friendly error message
 */
export const getErrorMessage = (error) => {
  const errorMessages = {
    'File too large': 'Please select a smaller audio file (max 50MB)',
    'File type not supported': 'Please use WAV, MP3, FLAC, or M4A files',
    'Internal server error': 'Transcription service unavailable. Please try again.',
    'No audio file provided': 'Please select an audio file first',
    'Network error occurred': 'Unable to connect to the transcription service'
  };
  
  return errorMessages[error] || 'An unexpected error occurred. Please try again.';
};

/**
 * Download MIDI file to user's device
 * @param {Blob} midiBlob - The MIDI file blob
 * @param {string} filename - The filename for the downloaded file
 */
export const downloadMidiFile = (midiBlob, filename) => {
  const url = URL.createObjectURL(midiBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
