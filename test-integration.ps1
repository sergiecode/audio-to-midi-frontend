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
    Write-Host "   cd ""$BackendPath""" -ForegroundColor Gray
    Write-Host "   .\venv\Scripts\Activate.ps1" -ForegroundColor Gray
    Write-Host "   python app.py" -ForegroundColor Gray
}

if (-not $TestResults["Frontend Access"]) {
    Write-Host "🔧 Start Frontend Server:" -ForegroundColor Yellow
    Write-Host "   cd ""$FrontendPath""" -ForegroundColor Gray
    Write-Host "   npm run dev" -ForegroundColor Gray
}

if ($TestResults["Backend Health"] -and $TestResults["Frontend Access"]) {
    Write-Host "🎉 Integration Ready!" -ForegroundColor Green
    Write-Host "   Backend: $BackendUrl" -ForegroundColor Gray
    Write-Host "   Frontend: $FrontendUrl" -ForegroundColor Gray
    Write-Host "   🌐 Open browser: $FrontendUrl" -ForegroundColor Gray
}

Write-Host "`n✅ Integration test completed!" -ForegroundColor Green
