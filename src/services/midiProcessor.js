/**
 * MIDI Processing Utilities
 * Created by Sergie Code - AI Tools for Musicians
 * 
 * This module handles MIDI file processing and conversion to various formats
 * for sheet music rendering (VexFlow, ABCJS) and playback
 */

import { Midi } from '@tonejs/midi';

/**
 * Parse MIDI blob and extract note data
 * @param {Blob} midiBlob - The MIDI file blob from the backend
 * @returns {Promise<Object>} Parsed MIDI data with tracks and notes
 */
export const parseMidiBlob = async (midiBlob) => {
  try {
    const arrayBuffer = await midiBlob.arrayBuffer();
    const midi = new Midi(arrayBuffer);
    
    return {
      name: midi.name,
      duration: midi.duration,
      tracks: midi.tracks.map(track => ({
        name: track.name,
        instrument: track.instrument,
        notes: track.notes.map(note => ({
          name: note.name,
          midi: note.midi,
          time: note.time,
          duration: note.duration,
          velocity: note.velocity,
          octave: note.octave,
          pitch: note.pitch
        }))
      }))
    };
  } catch (error) {
    console.error('Error parsing MIDI blob:', error);
    throw new Error('Failed to parse MIDI file');
  }
};

/**
 * Convert MIDI note to ABC notation format
 * @param {Object} note - MIDI note object
 * @returns {string} ABC notation for the note
 */
export const convertNoteToABC = (note) => {
  // Basic note mapping (simplified)
  const noteMap = {
    'C': 'C',
    'C#': '^C',
    'D': 'D',
    'D#': '^D',
    'E': 'E',
    'F': 'F',
    'F#': '^F',
    'G': 'G',
    'G#': '^G',
    'A': 'A',
    'A#': '^A',
    'B': 'B'
  };
  
  const noteName = note.name.replace(/\d+/, ''); // Remove octave number
  const octave = parseInt(note.name.match(/\d+/)?.[0]) || 4;
  
  let abcNote = noteMap[noteName] || 'C';
  
  // Handle octaves (ABC notation)
  if (octave >= 5) {
    abcNote = abcNote.toLowerCase();
    for (let i = 5; i < octave; i++) {
      abcNote += "'";
    }
  } else if (octave < 4) {
    for (let i = octave; i < 4; i++) {
      abcNote += ',';
    }
  }
  
  // Basic duration mapping (simplified)
  if (note.duration < 0.25) {
    abcNote += '/4'; // Sixteenth note
  } else if (note.duration < 0.5) {
    abcNote += '/2'; // Eighth note
  } else if (note.duration < 1) {
    abcNote += ''; // Quarter note (default)
  } else if (note.duration < 2) {
    abcNote += '2'; // Half note
  } else {
    abcNote += '4'; // Whole note
  }
  
  return abcNote;
};

/**
 * Convert parsed MIDI data to ABC notation string
 * @param {Object} midiData - Parsed MIDI data from parseMidiBlob
 * @returns {string} Complete ABC notation string
 */
export const convertMidiToABC = (midiData) => {
  try {
    // ABC notation header
    let abcNotation = 'X:1\n';
    abcNotation += `T:${midiData.name || 'Transcribed Audio'}\n`;
    abcNotation += 'M:4/4\n'; // Time signature (simplified)
    abcNotation += 'L:1/4\n'; // Default note length
    abcNotation += 'K:C\n';   // Key signature (simplified)
    
    // Process first track (simplified approach)
    if (midiData.tracks && midiData.tracks.length > 0) {
      const firstTrack = midiData.tracks[0];
      
      // Sort notes by time
      const sortedNotes = [...firstTrack.notes].sort((a, b) => a.time - b.time);
      
      // Convert notes to ABC notation
      sortedNotes.forEach((note, index) => {
        const abcNote = convertNoteToABC(note);
        abcNotation += abcNote;
        
        // Add space between notes
        if (index < sortedNotes.length - 1) {
          abcNotation += ' ';
        }
        
        // Add line breaks for readability (every 8 notes)
        if ((index + 1) % 8 === 0) {
          abcNotation += '\n';
        }
      });
    }
    
    return abcNotation;
  } catch (error) {
    console.error('Error converting MIDI to ABC:', error);
    return 'X:1\nT:Error\nM:4/4\nL:1/4\nK:C\nz4'; // Return empty measure on error
  }
};

/**
 * Convert parsed MIDI data to VexFlow format
 * @param {Object} midiData - Parsed MIDI data from parseMidiBlob
 * @returns {Array} Array of VexFlow-compatible note objects
 */
export const convertMidiToVexFlow = (midiData) => {
  try {
    const vexFlowNotes = [];
    
    if (midiData.tracks && midiData.tracks.length > 0) {
      const firstTrack = midiData.tracks[0];
      
      // Sort notes by time
      const sortedNotes = [...firstTrack.notes].sort((a, b) => a.time - b.time);
      
      sortedNotes.forEach(note => {
        // Basic duration mapping for VexFlow
        let duration = 'q'; // Quarter note default
        if (note.duration < 0.25) {
          duration = '16';
        } else if (note.duration < 0.5) {
          duration = '8';
        } else if (note.duration < 1) {
          duration = 'q';
        } else if (note.duration < 2) {
          duration = 'h';
        } else {
          duration = 'w';
        }
        
        // Convert MIDI note to VexFlow format
        const vexFlowNote = {
          keys: [`${note.name.replace(/(\d+)/, '/$1')}`], // Convert C4 to C/4
          duration: duration,
          midi: note.midi,
          time: note.time
        };
        
        vexFlowNotes.push(vexFlowNote);
      });
    }
    
    return vexFlowNotes;
  } catch (error) {
    console.error('Error converting MIDI to VexFlow:', error);
    return []; // Return empty array on error
  }
};

/**
 * Get a summary of MIDI data for display purposes
 * @param {Object} midiData - Parsed MIDI data
 * @returns {Object} Summary information about the MIDI file
 */
export const getMidiSummary = (midiData) => {
  try {
    const totalNotes = midiData.tracks.reduce((sum, track) => sum + track.notes.length, 0);
    const trackCount = midiData.tracks.length;
    const duration = Math.round(midiData.duration * 100) / 100; // Round to 2 decimal places
    
    return {
      name: midiData.name || 'Transcribed Audio',
      duration: `${duration} seconds`,
      tracks: trackCount,
      totalNotes: totalNotes,
      instruments: midiData.tracks.map(track => track.instrument?.name || 'Piano').join(', ')
    };
  } catch (error) {
    console.error('Error getting MIDI summary:', error);
    return {
      name: 'Unknown',
      duration: '0 seconds',
      tracks: 0,
      totalNotes: 0,
      instruments: 'Unknown'
    };
  }
};
