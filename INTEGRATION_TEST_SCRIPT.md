# 🧪 Audio to MIDI Integration Test Script

**PowerShell Script for Complete Integration Testing**

## Test Script: `test-integration.ps1`

```powershell
#!/usr/bin/env pwsh
# Audio to MIDI Integration Test Script
# Created by Sergie Code - AI Tools for Musicians

Write-Host "🎵 Audio to MIDI Integration Test" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan

# Configuration
$BackendPath = "C:\Users\SnS_D\Desktop\IA\audio-to-midi-backend"
$FrontendPath = "C:\Users\SnS_D\Desktop\IA\audio-to-midi-frontend"
$BackendUrl = "http://localhost:5000"
$FrontendUrl = "http://localhost:5173"

# Test Results
$TestResults = @{}

# Function to test API endpoint
function Test-ApiEndpoint {
    param($Url, $Name)
    try {
        $response = Invoke-WebRequest -Uri $Url -Method GET -TimeoutSec 10
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ $Name - PASSED" -ForegroundColor Green
            return $true
        } else {
            Write-Host "❌ $Name - FAILED (Status: $($response.StatusCode))" -ForegroundColor Red
            return $false
        }
    } catch {
        Write-Host "❌ $Name - FAILED (Error: $($_.Exception.Message))" -ForegroundColor Red
        return $false
    }
}

# Function to check if process is running on port
function Test-PortInUse {
    param($Port)
    $connections = netstat -an | Select-String ":$Port "
    return $connections.Count -gt 0
}

Write-Host "`n🔍 Testing Backend Server..." -ForegroundColor Yellow

# Test 1: Backend Health Check
$TestResults["Backend Health"] = Test-ApiEndpoint "$BackendUrl/health" "Backend Health Check"

# Test 2: Supported Formats
$TestResults["Backend Formats"] = Test-ApiEndpoint "$BackendUrl/supported_formats" "Supported Formats Endpoint"

Write-Host "`n🔍 Testing Frontend Server..." -ForegroundColor Yellow

# Test 3: Frontend Accessibility
$TestResults["Frontend Access"] = Test-ApiEndpoint $FrontendUrl "Frontend Accessibility"

Write-Host "`n🔍 Testing Integration..." -ForegroundColor Yellow

# Test 4: CORS and Integration
if ($TestResults["Backend Health"] -and $TestResults["Frontend Access"]) {
    Write-Host "✅ Integration - Both servers running" -ForegroundColor Green
    $TestResults["Integration"] = $true
} else {
    Write-Host "❌ Integration - One or more servers not running" -ForegroundColor Red
    $TestResults["Integration"] = $false
}

# Test 5: Port Usage
Write-Host "`n🔍 Testing Port Usage..." -ForegroundColor Yellow
$BackendPortInUse = Test-PortInUse 5000
$FrontendPortInUse = Test-PortInUse 5173

if ($BackendPortInUse) {
    Write-Host "✅ Backend Port (5000) - IN USE" -ForegroundColor Green
} else {
    Write-Host "❌ Backend Port (5000) - NOT IN USE" -ForegroundColor Red
}

if ($FrontendPortInUse) {
    Write-Host "✅ Frontend Port (5173) - IN USE" -ForegroundColor Green
} else {
    Write-Host "❌ Frontend Port (5173) - NOT IN USE" -ForegroundColor Red
}

# Summary
Write-Host "`n📊 Test Summary" -ForegroundColor Cyan
Write-Host "===============" -ForegroundColor Cyan

$PassedTests = ($TestResults.Values | Where-Object { $_ -eq $true }).Count
$TotalTests = $TestResults.Count

Write-Host "Tests Passed: $PassedTests/$TotalTests" -ForegroundColor $(if($PassedTests -eq $TotalTests) { "Green" } else { "Yellow" })

foreach ($test in $TestResults.GetEnumerator()) {
    $status = if ($test.Value) { "✅ PASSED" } else { "❌ FAILED" }
    $color = if ($test.Value) { "Green" } else { "Red" }
    Write-Host "$($test.Key): $status" -ForegroundColor $color
}

# Recommendations
Write-Host "`n💡 Recommendations" -ForegroundColor Cyan
Write-Host "=================" -ForegroundColor Cyan

if (-not $TestResults["Backend Health"]) {
    Write-Host "🔧 Start Backend Server:" -ForegroundColor Yellow
    Write-Host "   cd '$BackendPath'" -ForegroundColor Gray
    Write-Host "   .\venv\Scripts\Activate.ps1" -ForegroundColor Gray
    Write-Host "   python app.py" -ForegroundColor Gray
}

if (-not $TestResults["Frontend Access"]) {
    Write-Host "🔧 Start Frontend Server:" -ForegroundColor Yellow
    Write-Host "   cd '$FrontendPath'" -ForegroundColor Gray
    Write-Host "   npm run dev" -ForegroundColor Gray
}

if ($TestResults["Backend Health"] -and $TestResults["Frontend Access"]) {
    Write-Host "🎉 Integration Ready!" -ForegroundColor Green
    Write-Host "   Backend: $BackendUrl" -ForegroundColor Gray
    Write-Host "   Frontend: $FrontendUrl" -ForegroundColor Gray
    Write-Host "   🌐 Open browser: $FrontendUrl" -ForegroundColor Gray
}

Write-Host "`n✅ Integration test completed!" -ForegroundColor Green
```

## Usage Instructions

### Run the Test Script:
1. Save the script as `test-integration.ps1`
2. Open PowerShell as Administrator
3. Navigate to the frontend directory
4. Run: `.\test-integration.ps1`

### Expected Output:
```
🎵 Audio to MIDI Integration Test
=================================

🔍 Testing Backend Server...
✅ Backend Health Check - PASSED
✅ Supported Formats Endpoint - PASSED

🔍 Testing Frontend Server...
✅ Frontend Accessibility - PASSED

🔍 Testing Integration...
✅ Integration - Both servers running

🔍 Testing Port Usage...
✅ Backend Port (5000) - IN USE
✅ Frontend Port (5173) - IN USE

📊 Test Summary
===============
Tests Passed: 4/4
Backend Health: ✅ PASSED
Backend Formats: ✅ PASSED
Frontend Access: ✅ PASSED
Integration: ✅ PASSED

💡 Recommendations
=================
🎉 Integration Ready!
   Backend: http://localhost:5000
   Frontend: http://localhost:5173
   🌐 Open browser: http://localhost:5173

✅ Integration test completed!
```

## Manual Test Checklist

### ✅ Backend Tests:
- [ ] Virtual environment activates without errors
- [ ] Python dependencies are installed
- [ ] Flask server starts successfully
- [ ] Health endpoint returns 200 OK
- [ ] Supported formats endpoint returns expected JSON
- [ ] No error messages in console

### ✅ Frontend Tests:
- [ ] Node.js dependencies are installed
- [ ] Vite development server starts
- [ ] React application loads in browser
- [ ] Backend status shows "Online" (green indicator)
- [ ] File uploader interface is visible
- [ ] No JavaScript errors in browser console

### ✅ Integration Tests:
- [ ] Cross-origin requests work (no CORS errors)
- [ ] File upload accepts valid audio files
- [ ] Upload progress indicators work
- [ ] Error handling displays user-friendly messages
- [ ] MIDI download functionality works
- [ ] Sheet music viewer renders correctly

## Automated Testing Commands

### Quick Health Check:
```powershell
# Test all endpoints quickly
curl http://localhost:5000/health
curl http://localhost:5000/supported_formats
curl http://localhost:5173
```

### File Upload Test:
```powershell
# Test with a small audio file (if available)
$testFile = "test_audio\simple_note.wav"
if (Test-Path $testFile) {
    # Manual upload test using browser
    Write-Host "Test file available: $testFile"
    Write-Host "Use browser at http://localhost:5173 to test upload"
}
```

## Troubleshooting Commands

### Check Running Processes:
```powershell
# Check if servers are running
Get-Process | Where-Object {$_.ProcessName -like "*python*"}
Get-Process | Where-Object {$_.ProcessName -like "*node*"}
```

### Check Port Usage:
```powershell
# Check what's using the ports
netstat -an | findstr :5000
netstat -an | findstr :5173
```

### Restart Services:
```powershell
# Kill existing processes (if needed)
Stop-Process -Name "python" -Force -ErrorAction SilentlyContinue
Stop-Process -Name "node" -Force -ErrorAction SilentlyContinue

# Restart backend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$BackendPath'; .\venv\Scripts\Activate.ps1; python app.py"

# Restart frontend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$FrontendPath'; npm run dev"
```

## Success Criteria

✅ **Integration is successful when:**
- Backend health endpoint returns 200 OK
- Frontend loads without errors
- Backend status shows "Online" in frontend
- File upload interface is functional
- No CORS errors in browser console
- API responses are received correctly

❌ **Integration needs fixing when:**
- Any endpoint returns errors
- Frontend shows "Backend Offline"
- CORS errors appear in browser
- File upload doesn't work
- JavaScript errors in console

---

**Created by Sergie Code - AI Tools for Musicians**  
*Complete integration testing suite! 🧪→✅*
