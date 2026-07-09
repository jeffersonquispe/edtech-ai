$ErrorActionPreference = 'Continue'

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot '..')
Set-Location $repoRoot

$gh = Get-Command gh -ErrorAction SilentlyContinue
if ($gh) {
    try {
        $json = gh run list --branch main --limit 1 --json status,conclusion,workflowName,createdAt,url 2>$null
        $runs = $json | ConvertFrom-Json
        if ($runs -and $runs.Count -gt 0) {
            $r = $runs[0]
            Write-Output "CI (main) - $($r.workflowName): status=$($r.status) conclusion=$($r.conclusion) ($($r.createdAt))"
            if ($r.status -eq 'completed' -and $r.conclusion -ne 'success') {
                Write-Output "El último run de CI en main NO pasó. Revisa $($r.url) antes de seguir apilando cambios."
            }
        }
    } catch {
        # gh no autenticado o sin conectividad: no bloquear la sesión por esto.
    }
}

$changesDir = Join-Path $repoRoot 'openspec/changes'
if (Test-Path $changesDir) {
    $activeChanges = Get-ChildItem -Directory $changesDir -ErrorAction SilentlyContinue |
        Where-Object { $_.Name -ne 'archive' }
    if ($activeChanges) {
        $names = ($activeChanges | ForEach-Object { $_.Name }) -join ', '
        Write-Output "OpenSpec: change(s) activo(s) sin archivar: $names. Si ya está en prod y validado, correr /opsx:archive."
    }
}

exit 0
