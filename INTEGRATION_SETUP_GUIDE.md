# 🔧 Audio to MIDI Integration Setup Guide

**For AI Agents and Developers**  
**Date**: August 25, 2025

## 🎯 Quick Setup Instructions

This guide provides step-by-step instructions to set up and run both the `audio-to-midi-backend` and `audio-to-midi-frontend` projects together.

## 📁 Project Structure Required
```
IA/
├── audio-to-midi-backend/     # Python Flask API
└── audio-to-midi-frontend/    # React/Vite frontend
```

## 🐍 Backend Setup (audio-to-midi-backend)

### Prerequisites
- Python 3.8+ installed
- Virtual environment support

### Step 1: Navigate to Backend Directory
```powershell
cd C:\path\to\IA\audio-to-midi-backend
```

### Step 2: Activate Virtual Environment
```powershell
# Windows PowerShell
.\venv\Scripts\Activate.ps1

# If virtual environment doesn't exist, create it:
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

### Step 3: Start Backend Server
```powershell
python app.py
```

### Expected Output:
```
 * Running on http://127.0.0.1:5000
 * Debug mode: on
```

### Verification:
```powershell
curl http://localhost:5000/health
# Should return: {"status": "healthy", "service": "audio-to-midi-backend"}
```

## ⚛️ Frontend Setup (audio-to-midi-frontend)

### Prerequisites
- Node.js 16+ installed
- npm or yarn package manager

### Step 1: Navigate to Frontend Directory
```powershell
cd C:\path\to\IA\audio-to-midi-frontend
```

### Step 2: Install Dependencies (if needed)
```powershell
npm install
```

### Step 3: Start Frontend Development Server
```powershell
npm run dev
```

### Expected Output:
```
VITE v7.1.3  ready in 135 ms
➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

## 🔗 Integration Testing

### Test Backend API
```powershell
# Health check
curl http://localhost:5000/health

# Supported formats
curl http://localhost:5000/supported_formats
```

### Test Frontend
- Open browser: http://localhost:5173
- Look for green "Backend Online" indicator
- Try uploading an audio file

## 🚨 Common Issues and Solutions

### Issue 1: Backend Won't Start
**Symptoms**: Python errors, import failures
**Solution**:
```powershell
# Ensure virtual environment is activated
.\venv\Scripts\Activate.ps1

# Reinstall dependencies
pip install -r requirements.txt

# Check Python version
python --version  # Should be 3.8+
```

### Issue 2: Frontend Shows "Backend Offline"
**Symptoms**: Red status indicator, API connection failed
**Solution**:
```powershell
# Verify backend is running
curl http://localhost:5000/health

# Check for port conflicts
netstat -an | findstr :5000

# Restart backend server
python app.py
```

### Issue 3: CORS Errors
**Symptoms**: Browser console shows CORS errors
**Solution**: Backend is already configured for CORS. If issues persist:
- Restart both servers
- Clear browser cache
- Check if other services are using port 5000

### Issue 4: File Upload Fails
**Symptoms**: Upload hangs or fails with error
**Solution**:
- Check file format (WAV, MP3, FLAC, M4A only)
- Verify file size (<50MB)
- Ensure backend is processing requests

### Issue 5: PowerShell Execution Policy
**Symptoms**: Cannot activate virtual environment
**Solution**:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

## 🎯 Integration Verification Checklist

- [ ] Backend server starts without errors
- [ ] Backend health endpoint responds (http://localhost:5000/health)
- [ ] Frontend development server starts
- [ ] Frontend loads in browser (http://localhost:5173)
- [ ] Backend status shows "Online" (green indicator)
- [ ] File upload interface is visible
- [ ] Supported formats are loaded correctly

## 📋 Port Configuration

### Default Ports:
- **Backend**: http://localhost:5000 (Flask)
- **Frontend**: http://localhost:5173 (Vite)

### Changing Ports (if needed):

#### Backend Port:
Edit `app.py`:
```python
if __name__ == '__main__':
    app.run(debug=True, port=5001)  # Change to desired port
```

#### Frontend Port:
Edit `vite.config.js`:
```javascript
export default defineConfig({
  server: {
    port: 3000  // Change to desired port
  }
})
```

Update frontend API service (`src/services/apiService.js`):
```javascript
const API_BASE_URL = 'http://localhost:5001';  // Match backend port
```

## 🚀 Automated Startup Scripts

### For Windows PowerShell:

Create `start-all.ps1`:
```powershell
# Start backend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'C:\path\to\audio-to-midi-backend'; .\venv\Scripts\Activate.ps1; python app.py"

# Wait for backend to start
Start-Sleep 5

# Start frontend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'C:\path\to\audio-to-midi-frontend'; npm run dev"

# Open browser
Start-Process "http://localhost:5173"
```

### For Linux/macOS:

Create `start-all.sh`:
```bash
#!/bin/bash
# Start backend
cd audio-to-midi-backend
source venv/bin/activate
python app.py &

# Wait for backend
sleep 5

# Start frontend
cd ../audio-to-midi-frontend
npm run dev &

# Open browser
open http://localhost:5173
```

## 🔧 Environment Variables

### Backend (.env file):
```
FLASK_ENV=development
UPLOAD_FOLDER=uploads
OUTPUT_FOLDER=output
MAX_FILE_SIZE_MB=50
```

### Frontend (.env file):
```
VITE_API_BASE_URL=http://localhost:5000
```

## 📊 Performance Monitoring

### Backend Performance:
- Monitor CPU usage during transcription
- Watch memory consumption for large files
- Check response times for API endpoints

### Frontend Performance:
- Monitor bundle size and load times
- Check for memory leaks in sheet music rendering
- Verify mobile responsiveness

## 🧪 Testing Integration

### Manual Testing:
1. Upload a small audio file (e.g., 30-second WAV)
2. Verify transcription completes successfully
3. Check that MIDI file downloads correctly
4. Verify sheet music renders properly

### Automated Testing:
```powershell
# Backend tests
cd audio-to-midi-backend
pytest tests/

# Frontend tests (if implemented)
cd audio-to-midi-frontend
npm test
```

## 📝 Troubleshooting Log

Create a log of common issues:

### Backend Logs:
- Check Flask console output
- Monitor `uploads/` and `output/` directories
- Review any Python stack traces

### Frontend Logs:
- Check browser Developer Tools console
- Monitor Network tab for API requests
- Review any JavaScript errors

## 🆘 Support Resources

### Documentation:
- Backend: `README.md` in audio-to-midi-backend
- Frontend: `README.md` in audio-to-midi-frontend
- API: `FRONTEND_INTEGRATION_GUIDE.md`

### Testing Files:
- Use short audio samples for testing
- Test with different audio formats
- Verify with various file sizes

## ✅ Success Indicators

Integration is successful when:
- ✅ Both servers start without errors
- ✅ Frontend shows "Backend Online" status
- ✅ File upload accepts valid audio files
- ✅ Transcription process completes
- ✅ MIDI files download correctly
- ✅ Sheet music renders properly

---

**Created by Sergie Code - AI Tools for Musicians**  
*Complete integration guide for audio-to-MIDI system! 🎵→🎼*
