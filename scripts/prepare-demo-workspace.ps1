<#
.SYNOPSIS
    Prepares a demo workspace for capturing the seven marketplace screenshots
    referenced from README.md / media/screenshots/README.md.

.DESCRIPTION
    Builds two folder trees under the target root:

      <root>\
        Acme.Shop\                  4-project Clean Architecture solution,
                                    used for shots 1, 3, 4, 5.
          Acme.Shop.Domain\
            Entities\Order.cs       Seeded with a TODO body so Ctrl+. shows
                                    the pattern Code Actions cleanly (shot 4).
          Acme.Shop.Application\
          Acme.Shop.Infrastructure\
          Acme.Shop.WebApi\
        SmartCommentsDemo.cs        Seeded with five tagged comments
                                    (shot 6).
        CycleDemo\                  Three-project solution with an
                                    intentional A -> B -> C -> A cycle
                                    so the analyzer surfaces a warning
                                    (shot 7).

    The script is idempotent: re-running it wipes the target root and
    rebuilds from scratch.

.PARAMETER Root
    Where to place the demo workspace. Defaults to
    "$env:USERPROFILE\Desktop\ext-demo-screenshots".

.PARAMETER Framework
    Target framework for every scaffolded project. When omitted, the script
    auto-detects the highest .NET major installed locally (>= 6) so the
    captured screenshots always exercise the modern templates the extension
    ships. Pass an explicit value (e.g. net8.0) to pin the demo workspace
    to a specific framework.

.EXAMPLE
    ./scripts/prepare-demo-workspace.ps1

.EXAMPLE
    ./scripts/prepare-demo-workspace.ps1 -Framework net8.0 -Root C:\demo
#>

[CmdletBinding()]
param(
    [string] $Root = (Join-Path $env:USERPROFILE 'Desktop\ext-demo-screenshots'),
    [ValidatePattern('^net(6|7|8|9|10)\.0$')]
    [string] $Framework
)

$ErrorActionPreference = 'Stop'

function Write-Step {
    param([string] $Message)
    Write-Host "==> $Message" -ForegroundColor Cyan
}

function Invoke-Dotnet {
    param([string[]] $DotnetArgs)
    & dotnet @DotnetArgs | Out-Null
    if ($LASTEXITCODE -ne 0) {
        throw "dotnet $($DotnetArgs -join ' ') failed with exit code $LASTEXITCODE"
    }
}

# Discover what's actually on this machine before we start scaffolding —
# otherwise every dotnet new will fail with the same opaque
# "Invalid option(s): --framework" error the extension itself guards against.
Write-Step "Probing installed .NET SDKs"
$installed = & dotnet --list-sdks
if (-not $installed) {
    throw "dotnet --list-sdks returned nothing. Install the .NET SDK first: https://dotnet.microsoft.com/download"
}

$installedMajors = $installed |
    ForEach-Object { if ($_ -match '^(\d+)\.') { [int]$matches[1] } } |
    Where-Object { $_ -ge 6 } |
    Sort-Object -Unique

if (-not $installedMajors) {
    throw @"
No installed SDK supports modern templates (need .NET 6 or higher). Installed SDKs:
$installed

Install the latest LTS or current SDK from https://dotnet.microsoft.com/download
"@
}

if ($Framework) {
    # Caller pinned a framework — verify the matching SDK is installed.
    $majorWanted = [int]($Framework -replace 'net', '' -replace '\..*', '')
    if ($majorWanted -notin $installedMajors) {
        throw @"
Requested -Framework $Framework but no .NET $majorWanted SDK is installed.
Installed major versions: $($installedMajors -join ', ')
Either install .NET $majorWanted or rerun without -Framework to auto-pick.
"@
    }
    Write-Host "Using requested framework: $Framework" -ForegroundColor Green
}
else {
    # Auto-pick the highest installed major so the demo always exercises the
    # extension's modern templates (file-scoped namespaces, positional records).
    $best = ($installedMajors | Measure-Object -Maximum).Maximum
    $Framework = "net$best.0"
    Write-Host "Auto-selected framework: $Framework (highest installed: net$best)" -ForegroundColor Green
    if ($installedMajors.Count -gt 1) {
        Write-Host "  Other installed majors: $(($installedMajors | Where-Object { $_ -ne $best }) -join ', ')" -ForegroundColor DarkGray
    }
}

Write-Step "Resetting demo root: $Root"
if (Test-Path $Root) { Remove-Item $Root -Recurse -Force }
New-Item -ItemType Directory -Path $Root -Force | Out-Null

# ---------------------------------------------------------------------------
# 1. Acme.Shop — Clean Architecture solution (shots 1, 3, 4, 5)
# ---------------------------------------------------------------------------
$shop = Join-Path $Root 'Acme.Shop'
Write-Step "Scaffolding Clean Architecture solution at $shop"
New-Item -ItemType Directory -Path $shop -Force | Out-Null
Push-Location $shop
try {
    Invoke-Dotnet @('new', 'sln', '-n', 'Acme.Shop')

    foreach ($name in @('Domain', 'Application', 'Infrastructure')) {
        $proj = "Acme.Shop.$name"
        Invoke-Dotnet @('new', 'classlib', '-n', $proj, '-o', $proj, '--framework', $Framework)
        Invoke-Dotnet @('sln', 'add', "$proj/$proj.csproj")
        # Remove the autogenerated Class1.cs so the explorer is tidy in shots
        $autoFile = Join-Path (Join-Path $shop $proj) 'Class1.cs'
        if (Test-Path $autoFile) { Remove-Item $autoFile }
    }

    Invoke-Dotnet @('new', 'webapi', '-n', 'Acme.Shop.WebApi', '-o', 'Acme.Shop.WebApi', '--framework', $Framework)
    Invoke-Dotnet @('sln', 'add', 'Acme.Shop.WebApi/Acme.Shop.WebApi.csproj')

    # Reference graph
    Invoke-Dotnet @('add', 'Acme.Shop.Application/Acme.Shop.Application.csproj', 'reference', 'Acme.Shop.Domain/Acme.Shop.Domain.csproj')
    Invoke-Dotnet @('add', 'Acme.Shop.Infrastructure/Acme.Shop.Infrastructure.csproj', 'reference', 'Acme.Shop.Application/Acme.Shop.Application.csproj')
    Invoke-Dotnet @('add', 'Acme.Shop.WebApi/Acme.Shop.WebApi.csproj', 'reference', 'Acme.Shop.Application/Acme.Shop.Application.csproj')
    Invoke-Dotnet @('add', 'Acme.Shop.WebApi/Acme.Shop.WebApi.csproj', 'reference', 'Acme.Shop.Infrastructure/Acme.Shop.Infrastructure.csproj')

    # Conventional folders so the explorer looks lived-in in shot 1
    foreach ($f in @('Domain/Entities', 'Domain/ValueObjects', 'Application/Features', 'Application/Common', 'Infrastructure/Persistence', 'Infrastructure/Services', 'WebApi/Controllers', 'WebApi/Middleware')) {
        $parts = $f -split '/'
        $p = Join-Path $shop "Acme.Shop.$($parts[0])"
        for ($i = 1; $i -lt $parts.Length; $i++) {
            $p = Join-Path $p $parts[$i]
        }
        New-Item -ItemType Directory -Path $p -Force | Out-Null
    }
}
finally {
    Pop-Location
}

# Order.cs ready for the Ctrl+. capture (shot 4)
$orderPath = Join-Path $shop 'Acme.Shop.Domain\Entities\Order.cs'
$orderBody = @'
namespace Acme.Shop.Domain.Entities;

internal class Order
{
    public Guid Id { get; init; }

    public string CustomerName { get; init; } = string.Empty;

    public decimal Total { get; init; }

    // TODO: return Result<Order, OrderError> instead of throwing
    public void Confirm()
    {
        throw new NotImplementedException();
    }
}
'@
Set-Content -Path $orderPath -Value $orderBody -Encoding UTF8

# ---------------------------------------------------------------------------
# 2. SmartCommentsDemo.cs — top-level file used in shot 6
# ---------------------------------------------------------------------------
$smartPath = Join-Path $Root 'SmartCommentsDemo.cs'
$smart = @'
namespace SmartCommentsDemo;

internal static class CommentTagShowcase
{
    public static void Run()
    {
        // TODO: split this method into smaller helpers
        // FIXME: null reference when CustomerName is empty
        // HACK: temporary retry loop until polly is wired up
        // NOTE: see RFC-0042 for the canonical ordering
        // DEPRECATED: replaced by CommentTagShowcaseV2.Run() in 4.0.0
    }
}
'@
Set-Content -Path $smartPath -Value $smart -Encoding UTF8

# ---------------------------------------------------------------------------
# 3. CycleDemo — A -> B -> C -> A so the analyzer flags a circular reference
#    (shot 7). dotnet itself blocks `dotnet add reference` from creating an
#    A -> B -> A loop, so we wire the cycle by editing csproj files directly.
# ---------------------------------------------------------------------------
$cycle = Join-Path $Root 'CycleDemo'
Write-Step "Scaffolding CycleDemo at $cycle"
New-Item -ItemType Directory -Path $cycle -Force | Out-Null
Push-Location $cycle
try {
    Invoke-Dotnet @('new', 'sln', '-n', 'CycleDemo')
    foreach ($name in @('A', 'B', 'C')) {
        Invoke-Dotnet @('new', 'classlib', '-n', $name, '-o', $name, '--framework', $Framework)
        Invoke-Dotnet @('sln', 'add', "$name/$name.csproj")
        $autoFile = Join-Path (Join-Path $cycle $name) 'Class1.cs'
        if (Test-Path $autoFile) { Remove-Item $autoFile }
    }

    # Inject the three references directly into csproj XML — dotnet refuses
    # to add the closing edge of a cycle through `dotnet add reference`.
    $edges = @{
        'A' = 'B'
        'B' = 'C'
        'C' = 'A'
    }
    foreach ($from in $edges.Keys) {
        $to = $edges[$from]
        $csproj = Join-Path $cycle "$from\$from.csproj"
        $xml = Get-Content $csproj -Raw
        $itemGroup = "  <ItemGroup>`r`n    <ProjectReference Include=`"..\$to\$to.csproj`" />`r`n  </ItemGroup>`r`n"
        $xml = $xml -replace '</Project>', "$itemGroup</Project>"
        Set-Content -Path $csproj -Value $xml -Encoding UTF8
    }
}
finally {
    Pop-Location
}

# ---------------------------------------------------------------------------
# Done
# ---------------------------------------------------------------------------
Write-Host ""
Write-Host "Demo workspace ready at: $Root" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. From this repo, press F5 to launch the Extension Development Host."
Write-Host "  2. In the EDH: File -> Open Folder -> $Root"
Write-Host "  3. Follow the shot list in media/screenshots/README.md."
Write-Host "  4. For shot 7 (Analyze Solution), open the CycleDemo subfolder in a second EDH window."
Write-Host ""
