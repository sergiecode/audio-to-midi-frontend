/**
 * Audio File Uploader Component
 * Created by Sergie Code - AI Tools for Musicians
 * 
 * This component handles audio file selection, validation, and upload
 * with drag-and-drop functionality and progress indication
 */

import { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { getSupportedFormats, isValidAudioFile } from '../services/apiService';

const FileUploader = ({ onFileUpload, isTranscribing }) => {
  const [supportedFormats, setSupportedFormats] = useState([]);
  const [maxFileSize, setMaxFileSize] = useState(50);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    // Fetch supported formats from backend
    const fetchFormats = async () => {
      try {
        const formatData = await getSupportedFormats();
        setSupportedFormats(formatData.supported_formats);
        setMaxFileSize(formatData.max_file_size_mb);
      } catch (error) {
        // Fallback to default formats
        setSupportedFormats(['wav', 'mp3', 'flac', 'm4a']);
        setMaxFileSize(50);
      }
    };

    fetchFormats();
  }, []);

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    setDragActive(false);

    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0];
      if (rejection.errors[0]?.code === 'file-too-large') {
        alert(`File is too large. Maximum size is ${maxFileSize}MB`);
      } else if (rejection.errors[0]?.code === 'file-invalid-type') {
        alert(`Invalid file type. Supported formats: ${supportedFormats.join(', ')}`);
      } else {
        alert('Invalid file. Please try again.');
      }
      return;
    }

    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      
      // Validate file using our custom validation
      if (isValidAudioFile(file, supportedFormats, maxFileSize)) {
        onFileUpload(file);
      } else {
        alert(`Please select a valid audio file (${supportedFormats.join(', ')}) under ${maxFileSize}MB`);
      }
    }
  }, [supportedFormats, maxFileSize, onFileUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDragEnter: () => setDragActive(true),
    onDragLeave: () => setDragActive(false),
    accept: supportedFormats.reduce((acc, format) => {
      acc[`audio/${format}`] = [`.${format}`];
      return acc;
    }, {}),
    maxFiles: 1,
    maxSize: maxFileSize * 1024 * 1024, // Convert MB to bytes
    disabled: isTranscribing
  });

  return (
    <div className="card">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">
        🎵 Upload Audio File
      </h2>
      
      <div
        {...getRootProps()}
        className={`upload-zone ${isDragActive || dragActive ? 'active' : ''} ${
          isTranscribing ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        <input {...getInputProps()} />
        
        {isTranscribing ? (
          <div className="flex flex-col items-center">
            <div className="loading-spinner mb-2"></div>
            <p className="text-gray-600">Processing your audio file...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="text-4xl mb-4">🎼</div>
            {isDragActive || dragActive ? (
              <p className="text-primary-600 font-medium">
                Drop your audio file here!
              </p>
            ) : (
              <div className="text-center">
                <p className="text-gray-700 font-medium mb-2">
                  Drag & drop an audio file here, or click to select
                </p>
                <p className="text-sm text-gray-500">
                  Supported formats: {supportedFormats.join(', ').toUpperCase()}
                </p>
                <p className="text-sm text-gray-500">
                  Maximum file size: {maxFileSize}MB
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-medium text-blue-800 mb-2">💡 How it works:</h3>
        <ol className="text-sm text-blue-700 list-decimal list-inside space-y-1">
          <li>Upload your audio file (instrument recording, vocals, etc.)</li>
          <li>Our AI analyzes the audio and extracts musical notes</li>
          <li>View the generated sheet music notation</li>
          <li>Download the MIDI file for use in other music software</li>
        </ol>
      </div>
    </div>
  );
};

export default FileUploader;
