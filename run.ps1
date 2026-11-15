$scriptDir = $PSScriptRoot
if (Test-Path "$scriptDir\volt-charge\run.ps1") {
    & "$scriptDir\volt-charge\run.ps1"
} else {
    & "$scriptDir\run.ps1"
}
