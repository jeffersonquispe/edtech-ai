$ErrorActionPreference = 'Stop'

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot '..')
Set-Location $repoRoot

$stateFile = Join-Path $repoRoot '.claude/verify-state.json'
$maxAttempts = 3

function Get-Attempts {
    if (Test-Path $stateFile) {
        try {
            return [int](Get-Content $stateFile -Raw | ConvertFrom-Json).attempts
        } catch {
            return 0
        }
    }
    return 0
}

function Set-Attempts([int]$n) {
    New-Item -ItemType Directory -Force -Path (Split-Path $stateFile) | Out-Null
    @{ attempts = $n } | ConvertTo-Json | Set-Content $stateFile
}

# Skip if there are no uncommitted changes in code paths that matter.
git diff --quiet -- src supabase/migrations
$srcDirty = $LASTEXITCODE -ne 0
git diff --cached --quiet -- src supabase/migrations
$srcStaged = $LASTEXITCODE -ne 0

if (-not $srcDirty -and -not $srcStaged) {
    exit 0
}

$failedGate = $null
$failedOutput = $null

$lintOutput = npm run lint 2>&1
if ($LASTEXITCODE -ne 0) {
    $failedGate = 'lint'
    $failedOutput = $lintOutput
} else {
    $testOutput = npm run test:run 2>&1
    if ($LASTEXITCODE -ne 0) {
        $failedGate = 'test:run'
        $failedOutput = $testOutput
    }
}

if (-not $failedGate) {
    Set-Attempts 0
    Write-Output "verify-flow: lint + tests OK"
    exit 0
}

$attempts = (Get-Attempts) + 1

if ($attempts -lt $maxAttempts) {
    Set-Attempts $attempts
    Write-Output "verify-flow: '$failedGate' failed (intento $attempts/$maxAttempts)."
    Write-Output ($failedOutput | Out-String)
    Write-Output "Corrige el problema anterior antes de continuar."
    exit 2
}

Set-Attempts 0
Write-Output "No se pudo resolver '$failedGate' tras $maxAttempts intentos. Notifica al usuario en el chat con el detalle del fallo."
Write-Output ($failedOutput | Out-String)
exit 0
