/**
 * Sheet Music Viewer Component
 * Created by Sergie Code - AI Tools for Musicians
 * 
 * This component renders sheet music from MIDI data using ABCJS and VexFlow
 * Provides options to switch between different notation libraries
 */

import { useState, useEffect, useRef } from 'react';
import { convertMidiToABC, convertMidiToVexFlow, getMidiSummary } from '../services/midiProcessor';
import ABCJSViewer from './ABCJSViewer';
import VexFlowViewer from './VexFlowViewer';

const SheetMusicViewer = ({ midiData, midiSummary, onDownload }) => {
  const [notationLibrary, setNotationLibrary] = useState('abcjs'); // 'abcjs' or 'vexflow'
  const [abcNotation, setAbcNotation] = useState('');
  const [vexFlowData, setVexFlowData] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (midiData) {
      processMidiData();
    }
  }, [midiData]);

  const processMidiData = async () => {
    setIsProcessing(true);
    setError('');

    try {
      // Convert MIDI data to both formats
      const abc = convertMidiToABC(midiData);
      const vexflow = convertMidiToVexFlow(midiData);

      setAbcNotation(abc);
      setVexFlowData(vexflow);
    } catch (err) {
      setError('Failed to process MIDI data for sheet music rendering');
      console.error('MIDI processing error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!midiData) {
    return (
      <div className="card">
        <div className="text-center py-8">
          <div className="text-4xl mb-4">🎼</div>
          <p className="text-gray-600">
            Upload an audio file to see the generated sheet music here
          </p>
        </div>
      </div>
    );
  }

  if (isProcessing) {
    return (
      <div className="card">
        <div className="text-center py-8">
          <div className="loading-spinner mb-4"></div>
          <p className="text-gray-600">Processing MIDI data for sheet music...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <div className="text-center py-8">
          <div className="text-4xl mb-4">⚠️</div>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={processMidiData}
            className="btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 lg:mb-0">
          🎼 Generated Sheet Music
        </h2>
        
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Notation Library Selector */}
          <div className="flex rounded-lg border border-gray-300 overflow-hidden">
            <button
              onClick={() => setNotationLibrary('abcjs')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                notationLibrary === 'abcjs'
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              ABCJS
            </button>
            <button
              onClick={() => setNotationLibrary('vexflow')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                notationLibrary === 'vexflow'
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              VexFlow
            </button>
          </div>
          
          {/* Download Button */}
          <button
            onClick={onDownload}
            className="btn-primary flex items-center"
          >
            <span className="mr-2">💾</span>
            Download MIDI
          </button>
        </div>
      </div>

      {/* MIDI Summary */}
      {midiSummary && (
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="font-medium text-gray-800 mb-2">📊 File Information</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Duration:</span>
              <div className="font-medium">{midiSummary.duration}</div>
            </div>
            <div>
              <span className="text-gray-600">Tracks:</span>
              <div className="font-medium">{midiSummary.tracks}</div>
            </div>
            <div>
              <span className="text-gray-600">Notes:</span>
              <div className="font-medium">{midiSummary.totalNotes}</div>
            </div>
            <div>
              <span className="text-gray-600">Instrument:</span>
              <div className="font-medium">{midiSummary.instruments}</div>
            </div>
          </div>
        </div>
      )}

      {/* Sheet Music Rendering */}
      <div className="relative">
        {notationLibrary === 'abcjs' ? (
          <ABCJSViewer abcNotation={abcNotation} />
        ) : (
          <VexFlowViewer vexFlowData={vexFlowData} />
        )}
      </div>

      {/* Usage Tips */}
      <div className="mt-6 p-4 bg-green-50 rounded-lg">
        <h3 className="font-medium text-green-800 mb-2">🎯 Tips for better results:</h3>
        <ul className="text-sm text-green-700 list-disc list-inside space-y-1">
          <li>Use clear, single-instrument recordings for best transcription accuracy</li>
          <li>Avoid background noise and multiple overlapping instruments</li>
          <li>Piano and guitar recordings typically work very well</li>
          <li>The ABCJS viewer is better for simple melodies, VexFlow for complex notation</li>
        </ul>
      </div>
    </div>
  );
};

export default SheetMusicViewer;
