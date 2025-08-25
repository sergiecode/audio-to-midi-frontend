/**
 * Backend Status Component
 * Created by Sergie Code - AI Tools for Musicians
 * 
 * This component monitors and displays the backend service status
 */

import { useState, useEffect } from 'react';
import { checkBackendHealth } from '../services/apiService';

const BackendStatus = () => {
  const [status, setStatus] = useState('checking');

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const isHealthy = await checkBackendHealth();
        setStatus(isHealthy ? 'online' : 'offline');
      } catch (error) {
        setStatus('offline');
      }
    };

    // Initial check
    checkStatus();

    // Check every 30 seconds
    const interval = setInterval(checkStatus, 30000);

    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = () => {
    switch (status) {
      case 'online':
        return '🟢';
      case 'offline':
        return '🔴';
      case 'checking':
      default:
        return '🟡';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'online':
        return 'Backend Online';
      case 'offline':
        return 'Backend Offline';
      case 'checking':
      default:
        return 'Checking Status...';
    }
  };

  const getStatusClass = () => {
    switch (status) {
      case 'online':
        return 'status-indicator status-online';
      case 'offline':
        return 'status-indicator status-offline';
      case 'checking':
      default:
        return 'status-indicator status-checking';
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <span className={getStatusClass()}>
        <span className="mr-1">{getStatusIcon()}</span>
        {getStatusText()}
      </span>
      {status === 'offline' && (
        <div className="text-sm text-red-600">
          Make sure the backend server is running on http://localhost:5000
        </div>
      )}
    </div>
  );
};

export default BackendStatus;
