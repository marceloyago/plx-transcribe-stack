#Requires -Version 5.1
<#
.SYNOPSIS
    Smoke contra API Python (transcribe-service) — Regra 0.

.NOTES
    PlayLoadX (c) 2024-2026
#>
$ErrorActionPreference = 'Stop'
$root = Split-Path $PSScriptRoot
$svc = Join-Path $root 'transcribe-service'
$port = if ($env:PORT) { $env:PORT } else { '3055' }

$tmpWav = Join-Path $root '.tmp-smoke.wav'
# WAV mínimo (header RIFF) — inferência real pode falhar sem áudio válido; smoke foca health/peers.
$bytes = [byte[]](82, 73, 70, 70, 54, 0, 0, 0, 87, 65, 86, 69, 102, 109, 116, 32, 16, 0, 0, 0, 1, 0, 1, 0, 128, 62, 0, 0, 0, 125, 0, 0, 2, 0, 16, 0, 100, 97, 116, 97, 2, 0, 0, 0, 0, 0)
[System.IO.File]::WriteAllBytes($tmpWav, $bytes)

$nodeExe = (Get-Command python -ErrorAction Stop).Source
$job = Start-Job -ArgumentList @($svc, $port, $nodeExe) -ScriptBlock {
    param ($svcRoot, $listenPort, $pythonPath)
    Set-Location $svcRoot
    $env:PYTHONPATH = Join-Path $svcRoot 'src'
    $env:PLX_SKIP_WHISPER_PRELOAD = '1'
    & $pythonPath -m uvicorn plx_transcribe.main:app --host 127.0.0.1 --port $listenPort 2>&1
}

try {
    $deadline = (Get-Date).AddSeconds(25)
    $healthy = $false
    while ((Get-Date) -lt $deadline -and -not $healthy) {
        try {
            $h = curl.exe -sS "http://127.0.0.1:$port/health" 2>$null
            if ($h -match '"ok"\s*:\s*true') { $healthy = $true }
        }
        catch { }
        if (-not $healthy) { Start-Sleep -Milliseconds 400 }
    }
    if (-not $healthy) {
        Write-Host (Receive-Job $job -ErrorAction SilentlyContinue)
        throw 'API Python nao arrancou (health).'
    }
    Write-Host 'GET /health' -ForegroundColor Cyan
    curl.exe -sS "http://127.0.0.1:$port/health"
    Write-Host "`nGET /v1/peers" -ForegroundColor Cyan
    curl.exe -sS "http://127.0.0.1:$port/v1/peers"
    Write-Host "`nPOST /v1/jobs (ficheiro minimo — inferencia real pode marcar failed se WAV invalido)" -ForegroundColor Yellow
    curl.exe -sS -X POST "http://127.0.0.1:$port/v1/jobs" -H "x-tenant-id: smoke" -F "file=@$tmpWav" -F "audio_language=pt" -F "mode=cheetah"
    Write-Host ''
}
finally {
    Stop-Job $job
    Remove-Job $job
    Remove-Item $tmpWav -Force -ErrorAction SilentlyContinue
}
