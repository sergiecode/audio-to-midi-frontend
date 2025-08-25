/**
 * VexFlow Sheet Music Viewer Component
 * Created by Sergie Code - AI Tools for Musicians
 * 
 * This component renders sheet music using the VexFlow library
 * VexFlow is excellent for modern music notation and complex scores
 */

import { useEffect, useRef } from 'react';
import { Renderer, Stave, StaveNote, Voice, Formatter } from 'vexflow';

const VexFlowViewer = ({ vexFlowData }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (vexFlowData && vexFlowData.length > 0 && containerRef.current) {
      try {
        // Clear previous content
        containerRef.current.innerHTML = '';

        // Create VexFlow renderer
        const renderer = new Renderer(containerRef.current, Renderer.Backends.SVG);
        renderer.resize(800, 300);
        const context = renderer.getContext();

        // Create a stave
        const stave = new Stave(10, 40, 750);
        stave.addClef('treble').addTimeSignature('4/4');
        stave.setContext(context).draw();

        // Convert our MIDI data to VexFlow notes (simplified approach)
        const notes = vexFlowData.slice(0, 8).map((noteData, index) => {
          // Basic note conversion (this is a placeholder implementation)
          let keys = ['c/4']; // Default to C4
          let duration = 'q'; // Quarter note

          try {
            // Try to parse the MIDI note name
            if (noteData.keys && noteData.keys[0]) {
              keys = [noteData.keys[0].toLowerCase()];
            }
            if (noteData.duration) {
              duration = noteData.duration;
            }
          } catch (error) {
            console.warn('Note parsing error:', error);
          }

          return new StaveNote({
            clef: 'treble',
            keys: keys,
            duration: duration
          });
        });

        // Add notes if we have any
        if (notes.length > 0) {
          const voice = new Voice({ num_beats: 4, beat_value: 4 });
          voice.addTickables(notes);

          new Formatter().joinVoices([voice]).format([voice], 700);
          voice.draw(context, stave);
        } else {
          // Draw empty measures if no notes
          context.fillText('No notes to display', 400, 150);
        }

      } catch (error) {
        console.error('VexFlow rendering error:', error);
        containerRef.current.innerHTML = `
          <div class="text-center py-8">
            <div class="text-red-600 mb-2">❌ Error rendering sheet music</div>
            <div class="text-sm text-gray-600">There was an issue with VexFlow rendering</div>
          </div>
        `;
      }
    }
  }, [vexFlowData]);

  if (!vexFlowData || vexFlowData.length === 0) {
    return (
      <div className="vexflow-container">
        <div className="text-center py-8 text-gray-500">
          No sheet music data available for VexFlow rendering
        </div>
      </div>
    );
  }

  return (
    <div className="vexflow-container">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center text-sm text-gray-600">
          <span className="font-medium mr-2">🎼 VexFlow Notation:</span>
          <span>Modern sheet music rendering</span>
        </div>
        <div className="text-xs text-gray-500">
          Showing first 8 notes • {vexFlowData.length} total notes detected
        </div>
      </div>
      
      <div
        ref={containerRef}
        className="min-h-80 border border-gray-200 rounded bg-white p-4 overflow-auto"
        style={{ maxHeight: '400px' }}
      />
      
      <div className="mt-4 text-xs text-gray-500">
        <p>
          <strong>About VexFlow:</strong> Modern music notation library, excellent for complex scores, 
          jazz notation, and contemporary music. Supports advanced musical symbols, multiple voices, 
          and custom formatting.
        </p>
        <p className="mt-1">
          <strong>Note:</strong> This is a basic implementation. For production use, implement more 
          sophisticated note grouping, measures, and chord handling.
        </p>
      </div>
    </div>
  );
};

export default VexFlowViewer;
