/**
 * Audio to MIDI Frontend Application
 * Created by Sergie Code - AI Tools for Musicians
 * 
 * This is the main application component that orchestrates the audio-to-MIDI
 * transcription workflow and sheet music visualization
 */

import { useState } from 'react';
import BackendStatus from './components/BackendStatus';
import FileUploader from './components/FileUploader';
import SheetMusicViewer from './components/SheetMusicViewer';
import { transcribeAudio, getErrorMessage, downloadMidiFile } from './services/apiService';
import { parseMidiBlob, getMidiSummary } from './services/midiProcessor';

function App() {
  // Application state
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [midiData, setMidiData] = useState(null);
  const [midiSummary, setMidiSummary] = useState(null);
  const [midiBlob, setMidiBlob] = useState(null);
  const [midiFilename, setMidiFilename] = useState('');
  const [error, setError] = useState('');
  const [currentFile, setCurrentFile] = useState(null);

  // Handle file upload and transcription
  const handleFileUpload = async (file) => {
    setIsTranscribing(true);
    setError('');
    setCurrentFile(file);
    setMidiData(null);
    setMidiSummary(null);

    try {
      // Send file to backend for transcription
      const result = await transcribeAudio(file);

      if (result.success) {
        // Store the MIDI blob for download
        setMidiBlob(result.midiFile);
        setMidiFilename(result.filename);

        // Parse MIDI data for sheet music rendering
        const parsedMidi = await parseMidiBlob(result.midiFile);
        const summary = getMidiSummary(parsedMidi);

        setMidiData(parsedMidi);
        setMidiSummary(summary);
      } else {
        const errorMessage = getErrorMessage(result.error);
        setError(errorMessage);
      }
    } catch (err) {
      const errorMessage = getErrorMessage(err.message);
      setError(errorMessage);
    } finally {
      setIsTranscribing(false);
    }
  };

  // Handle MIDI file download
  const handleDownload = () => {
    if (midiBlob && midiFilename) {
      downloadMidiFile(midiBlob, midiFilename);
    }
  };

  // Reset application state
  const handleReset = () => {
    setMidiData(null);
    setMidiSummary(null);
    setMidiBlob(null);
    setMidiFilename('');
    setError('');
    setCurrentFile(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-4 lg:mb-0">
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                🎵 Audio to MIDI Converter
              </h1>
              <p className="text-gray-600 mt-1">
                Convert your audio recordings into sheet music and MIDI files
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Created by <span className="font-medium">Sergie Code</span> - AI Tools for Musicians
              </p>
            </div>
            <BackendStatus />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <span className="text-red-400 text-xl">⚠️</span>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Transcription Error
                  </h3>
                  <p className="mt-1 text-sm text-red-700">{error}</p>
                  <button
                    onClick={handleReset}
                    className="mt-2 text-sm text-red-600 hover:text-red-500 underline"
                  >
                    Try again with a different file
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Success Display */}
          {midiData && !error && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <span className="text-green-400 text-xl">✅</span>
                </div>
                <div className="ml-3 flex-1">
                  <h3 className="text-sm font-medium text-green-800">
                    Transcription Successful!
                  </h3>
                  <p className="mt-1 text-sm text-green-700">
                    Successfully converted "{currentFile?.name}" to MIDI. 
                    View the sheet music below and download the MIDI file.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      onClick={handleDownload}
                      className="text-sm bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
                    >
                      💾 Download MIDI
                    </button>
                    <button
                      onClick={handleReset}
                      className="text-sm bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded"
                    >
                      🔄 Convert Another File
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* File Upload Section */}
          <FileUploader
            onFileUpload={handleFileUpload}
            isTranscribing={isTranscribing}
          />

          {/* Sheet Music Viewer Section */}
          <SheetMusicViewer
            midiData={midiData}
            midiSummary={midiSummary}
            onDownload={handleDownload}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-gray-600 mb-2">
              🎼 Built with React, VexFlow, and ABCJS for musicians by musicians
            </p>
            <p className="text-sm text-gray-500">
              This frontend integrates with the{' '}
              <a
                href="https://github.com/sergiecode/audio-to-midi-backend"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-600 hover:text-primary-700 underline"
              >
                audio-to-midi-backend
              </a>{' '}
              service by Sergie Code
            </p>
            <div className="mt-4 text-xs text-gray-400">
              <p>YouTube: Sergie Code • Teaching programming and AI tools for creativity</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
