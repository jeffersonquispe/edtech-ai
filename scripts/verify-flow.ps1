$ErrorActionPreference = 'Stop'

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot '..')
Set-Location $repoRoot

$stateFile = Join-Path $repoRoot '.claude/verify-state.json'
$maxAttempts = 3

# Rutas conocidas del proyecto que se auto-commitean. Deliberadamente no se usa
# `git add -A`: cualquier archivo suelto fuera de esta lista (scripts sueltos en
# la raíz, experimentos, etc.) se deja para commit manual.
$autoCommitPaths = @(
    'src', 'supabase', 'e2e', 'tests', 'docs', 'openspec', 'scripts', '.github', 'public', '.claude',
    'CLAUDE.md', 'README.md', 'package.json', 'package-lock.json', 'tsconfig.json',
    'next.config.mjs', 'vitest.config.ts', 'playwright.config.ts', 'eslint.config.mjs'
) | Where-Object { Test-Path (Join-Path $repoRoot $_) }

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

function Invoke-AutoCommitAndPush {
    git add -- $autoCommitPaths 2>&1 | Out-Null

    git diff --cached --quiet
    if ($LASTEXITCODE -eq 0) {
        # Nada quedó en stage (p.ej. solo cambió un archivo fuera de la allowlist).
        return
    }

    $changedFiles = git diff --cached --name-only
    $fileCount = ($changedFiles | Measure-Object).Count
    $preview = ($changedFiles | Select-Object -First 5) -join ', '
    if ($fileCount -gt 5) { $preview += ", +$($fileCount - 5) más" }

    $msg = "chore(auto-flow): $fileCount archivo(s) [$preview]`n`nAuto-commit tras lint+test OK (hook Stop / verify-flow.ps1)."
    git commit -m $msg 2>&1 | Out-Null

    if ($LASTEXITCODE -ne 0) {
        Write-Output "verify-flow: no se pudo crear el commit automático."
        return
    }

    Write-Output "verify-flow: commit automático creado ($fileCount archivo(s))."
    $pushOutput = git push origin HEAD 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Output "verify-flow: push a origin OK. CI (GitHub Actions) se disparará y, si pasa, desplegará a Vercel prod."
    } else {
        Write-Output "verify-flow: el commit se creó localmente pero el push falló:"
        Write-Output ($pushOutput | Out-String)
        Write-Output "Notifica al usuario en el chat: hay que resolver el push a mano (posible conflicto, rama protegida o falta de red)."
    }
}

# Solo se corren lint/test si hay cambios sin commitear en código (src o migraciones).
git diff --quiet -- src supabase/migrations
$srcDirty = $LASTEXITCODE -ne 0
git diff --cached --quiet -- src supabase/migrations
$srcStaged = $LASTEXITCODE -ne 0

if (-not $srcDirty -and -not $srcStaged) {
    # No hay código para verificar, pero puede haber otros cambios (docs, openspec, etc.)
    # que sí se pueden auto-commitear sin pasar por lint/test.
    Invoke-AutoCommitAndPush
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
    Invoke-AutoCommitAndPush
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
Write-Output "No se hace auto-commit/push: el código quedó roto, se deja sin subir."
exit 0
