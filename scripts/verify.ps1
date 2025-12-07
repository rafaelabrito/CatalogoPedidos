param(
    [switch]$SkipBackendTests,
    [switch]$SkipFrontendLint,
    [switch]$SkipFrontendTests
)

$ErrorActionPreference = "Stop"

function Invoke-Step {
    param(
        [string]$Message,
        [ScriptBlock]$Action
    )

    Write-Host "[verify] $Message" -ForegroundColor Cyan
    & $Action
    Write-Host "[verify] Completed: $Message" -ForegroundColor Green
}

$repoRoot = Split-Path -Parent $PSCommandPath

if (-not $SkipBackendTests) {
    Invoke-Step -Message "dotnet test (backend)" -Action {
        dotnet test "$repoRoot\backend\backend.sln" --nologo
    }
}

Push-Location "$repoRoot\frontend"
try {
    if (-not $SkipFrontendLint) {
        Invoke-Step -Message "npm run lint (frontend)" -Action {
            npm run lint -- --no-progress
        }
    }

    if (-not $SkipFrontendTests) {
        Invoke-Step -Message "npm run test:ci (frontend)" -Action {
            npm run test:ci -- --no-progress
        }
    }
}
finally {
    Pop-Location
}

Write-Host "[verify] All steps finished." -ForegroundColor Green
