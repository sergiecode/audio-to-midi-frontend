/**
 * ABCJS Sheet Music Viewer Component
 * Created by Sergie Code - AI Tools for Musicians
 * 
 * This component renders sheet music using the ABCJS library
 * ABCJS is excellent for traditional music notation and ABC format
 */

import { useEffect, useRef } from 'react';
import abcjs from 'abcjs';

const ABCJSViewer = ({ abcNotation }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (abcNotation && containerRef.current) {
      try {
        // Clear previous content
        containerRef.current.innerHTML = '';

        // Render ABC notation using ABCJS
        abcjs.renderAbc(containerRef.current, abcNotation, {
          responsive: 'resize',
          scale: 1.0,
          staffwidth: 740,
          paddingleft: 0,
          paddingright: 0,
          paddingTop: 15,
          paddingbottom: 30,
          format: {
            titlefont: 'Times 18',
            subtitlefont: 'Times 16',
            composerfont: 'Times 14',
            vocalfont: 'Times 13',
            textfont: 'Times 12',
            tempofont: 'Times 12',
            partsfont: 'Times 14',
            gchordfont: 'Times 12',
            annotationfont: 'Times 12',
            footerfont: 'Times 12',
            headerfont: 'Times 12',
            measurenumberfont: 'Times 10'
          }
        });
      } catch (error) {
        console.error('ABCJS rendering error:', error);
        containerRef.current.innerHTML = `
          <div class="text-center py-8">
            <div class="text-red-600 mb-2">❌ Error rendering sheet music</div>
            <div class="text-sm text-gray-600">There was an issue with the ABC notation format</div>
          </div>
        `;
      }
    }
  }, [abcNotation]);

  if (!abcNotation) {
    return (
      <div className="abcjs-container">
        <div className="text-center py-8 text-gray-500">
          No sheet music data available
        </div>
      </div>
    );
  }

  return (
    <div className="abcjs-container">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center text-sm text-gray-600">
          <span className="font-medium mr-2">📝 ABCJS Notation:</span>
          <span>Traditional sheet music rendering</span>
        </div>
        <button
          onClick={() => {
            // Show raw ABC notation in a modal or expandable section
            const textarea = document.createElement('textarea');
            textarea.value = abcNotation;
            textarea.style.position = 'fixed';
            textarea.style.left = '-999999px';
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            alert('ABC notation copied to clipboard!');
          }}
          className="text-xs text-primary-600 hover:text-primary-700 underline"
        >
          Copy ABC Notation
        </button>
      </div>
      
      <div
        ref={containerRef}
        className="min-h-48 border border-gray-200 rounded bg-white p-4 overflow-auto"
        style={{ maxHeight: '600px' }}
      />
      
      <div className="mt-4 text-xs text-gray-500">
        <p>
          <strong>About ABCJS:</strong> Traditional music notation format, excellent for folk tunes, 
          simple melodies, and standard Western music notation. Supports key signatures, time signatures, 
          and various musical symbols.
        </p>
      </div>
    </div>
  );
};

export default ABCJSViewer;
