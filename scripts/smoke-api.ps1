#Requires -Version 5.1
<#
.SYNOPSIS
    Smoke test da API (Windows-safe JSON para curl).

.NOTES
    PlayLoadX (c) 2024-2026
#>
$ErrorActionPreference = 'Stop'
# Raiz do repo (pasta que contém package.json)
$root = Split-Path $PSScriptRoot
Set-Location $root

$port = if ($env:PORT) { $env:PORT } else { '3044' }
$stubMs = if ($env:PLX_STUB_PIPELINE_MS) { $env:PLX_STUB_PIPELINE_MS } else { '2' }

$tmp = Join-Path $root '.tmp-smoke-body.json'
$json = '{"audioLanguage":"pt","mode":"whale","enableSpeakerRecognition":false,"enableAudioRestore":false,"transcribeToEnglish":false,"sourceObjectKey":"demo.wav","exportFormats":["json"]}'
[System.IO.File]::WriteAllText($tmp, $json, [System.Text.UTF8Encoding]::new($false))

$nodeExe = (Get-Command node -ErrorAction Stop).Source
$job = Start-Job -ArgumentList @($root, $port, $stubMs, $nodeExe) -ScriptBlock {
  param ($projectRoot, $listenPort, $pipelineMs, $nodePath)
  Set-Location $projectRoot
  $env:PORT = $listenPort
  $env:PLX_STUB_PIPELINE_MS = $pipelineMs
  & $nodePath --import tsx/esm apps/api/src/server.ts 2>&1
}

try {
  $deadline = (Get-Date).AddSeconds(20)
  $healthy = $false
  while ((Get-Date) -lt $deadline -and -not $healthy) {
    try {
      $h = curl.exe -sS "http://127.0.0.1:$port/health" 2>$null
      if ($h -match '"ok"\s*:\s*true') { $healthy = $true }
    }
    catch { }
    if (-not $healthy) { Start-Sleep -Milliseconds 500 }
  }
  if (-not $healthy) {
    Write-Host (Receive-Job $job -ErrorAction SilentlyContinue)
    throw 'API nao arrancou a tempo (health).'
  }
  Write-Host 'GET /health' -ForegroundColor Cyan
  curl.exe -sS "http://127.0.0.1:$port/health"
  Write-Host "`nPOST /v1/jobs" -ForegroundColor Cyan
  $created = curl.exe -sS -X POST "http://127.0.0.1:$port/v1/jobs" -H 'content-type: application/json' --data-binary "@$tmp" | ConvertFrom-Json
  Write-Host ($created | ConvertTo-Json -Compress)
  Start-Sleep -Seconds 1
  Write-Host "`nGET /v1/jobs/$($created.id)" -ForegroundColor Cyan
  curl.exe -sS "http://127.0.0.1:$port/v1/jobs/$($created.id)"
  Write-Host ''
}
finally {
  Stop-Job $job
  Remove-Job $job
  Remove-Item $tmp -Force -ErrorAction SilentlyContinue
}
