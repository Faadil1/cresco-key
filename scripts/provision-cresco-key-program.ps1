param(
    [string]$KeypairPath = "$HOME\.config\solana\cresco-key-program.json",
    [switch]$Deploy
)

$ErrorActionPreference = "Stop"

$OriginalCrescoProgram = "ABjE6V5q9VbD3CAHDXxvztY5kXQmDXHRcEP1kZ4KSSfk"
$LibPath = Join-Path $PSScriptRoot "..\programs\keys\src\lib.rs"
$AnchorPath = Join-Path $PSScriptRoot "..\Anchor.toml"
$MobileEnvPath = Join-Path $PSScriptRoot "..\apps\mobile\.env"

function Require-Command([string]$Name) {
    if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
        throw "Required command '$Name' is not available in PATH."
    }
}

Require-Command "solana"
Require-Command "solana-keygen"

$resolvedParent = Split-Path -Parent $KeypairPath
if (-not (Test-Path $resolvedParent)) {
    New-Item -ItemType Directory -Force -Path $resolvedParent | Out-Null
}

if (-not (Test-Path $KeypairPath)) {
    Write-Host "Generating a distinct CRESCO Key program keypair OUTSIDE the repository:"
    Write-Host "  $KeypairPath"
    solana-keygen new --no-bip39-passphrase --silent --outfile $KeypairPath
}

$ProgramId = (solana-keygen pubkey $KeypairPath).Trim()
if (-not $ProgramId) {
    throw "Could not read the new program public key."
}

if ($ProgramId -eq $OriginalCrescoProgram) {
    throw "Safety stop: the CRESCO Key program id equals the original CRESCO program id."
}

Write-Host "CRESCO Key program id: $ProgramId"
Write-Host "Original CRESCO program remains: $OriginalCrescoProgram"

$lib = Get-Content -Raw $LibPath
if ($lib -notmatch 'declare_id!\("[1-9A-HJ-NP-Za-km-z]+"\);') {
    throw "Could not find declare_id! in $LibPath"
}
$lib = [regex]::Replace(
    $lib,
    'declare_id!\("[1-9A-HJ-NP-Za-km-z]+"\);',
    "declare_id!(`"$ProgramId`");",
    1
)
Set-Content -NoNewline -Path $LibPath -Value $lib

$anchor = Get-Content -Raw $AnchorPath
$devnetBlock = "[programs.devnet]`nkeys = `"$ProgramId`""

if ($anchor -match '(?ms)^\[programs\.devnet\].*?(?=^\[|\z)') {
    $anchor = [regex]::Replace(
        $anchor,
        '(?ms)^\[programs\.devnet\].*?(?=^\[|\z)',
        "$devnetBlock`n`n",
        1
    )
} else {
    $providerIndex = $anchor.IndexOf("[provider]")
    if ($providerIndex -lt 0) {
        throw "Could not find [provider] in Anchor.toml"
    }
    $anchor = $anchor.Insert($providerIndex, "$devnetBlock`n`n")
}
Set-Content -NoNewline -Path $AnchorPath -Value $anchor

if (Test-Path $MobileEnvPath) {
    $envText = Get-Content -Raw $MobileEnvPath
    if ($envText -match '(?m)^EXPO_PUBLIC_CRESCO_KEY_PROGRAM_ID=.*$') {
        $envText = [regex]::Replace(
            $envText,
            '(?m)^EXPO_PUBLIC_CRESCO_KEY_PROGRAM_ID=.*$',
            "EXPO_PUBLIC_CRESCO_KEY_PROGRAM_ID=$ProgramId"
        )
    } else {
        $envText += "`nEXPO_PUBLIC_CRESCO_KEY_PROGRAM_ID=$ProgramId`n"
    }
    Set-Content -NoNewline -Path $MobileEnvPath -Value $envText
}

Write-Host ""
Write-Host "Updated public configuration:"
Write-Host "  programs/keys/src/lib.rs"
Write-Host "  Anchor.toml"
if (Test-Path $MobileEnvPath) {
    Write-Host "  apps/mobile/.env (local-only)"
}
Write-Host ""
Write-Host "Private keypair remains outside git:"
Write-Host "  $KeypairPath"

if ($Deploy) {
    Require-Command "anchor"

    Write-Host ""
    Write-Host "Building CRESCO Key..."
    anchor build

    $ProgramBinary = Join-Path $PSScriptRoot "..\target\deploy\keys.so"
    if (-not (Test-Path $ProgramBinary)) {
        throw "Expected program binary not found: $ProgramBinary"
    }

    Write-Host "Deploying NEW program id to Devnet..."
    solana program deploy $ProgramBinary --program-id $KeypairPath --url devnet

    Write-Host ""
    Write-Host "Verifying deployed program account..."
    solana program show $ProgramId --url devnet
} else {
    Write-Host ""
    Write-Host "No deployment performed. Review the diff, then run:"
    Write-Host "  powershell -ExecutionPolicy Bypass -File .\scripts\provision-cresco-key-program.ps1 -Deploy"
}
