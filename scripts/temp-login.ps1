Param()
$ErrorActionPreference = 'Stop'

# Expect username in $env:NX_USERNAME and password in $env:NX_PASSWORD
if (-not $env:NX_USERNAME) { Write-Error 'NX_USERNAME is not set.'; exit 1 }
if (-not $env:NX_PASSWORD) { Write-Error 'NX_PASSWORD is not set. Please set it securely in your environment.'; exit 1 }

$base = 'https://nohvex-nextjs-exchange.vercel.app'

# Start session and fetch CSRF token
$session = New-Object Microsoft.PowerShell.Commands.WebRequestSession
$csrfResp = Invoke-WebRequest -UseBasicParsing -Uri "$base/api/auth/csrf" -WebSession $session
$csrfJson = $csrfResp.Content | ConvertFrom-Json
$csrf = $csrfJson.csrfToken
if (-not $csrf) { Write-Error 'Failed to obtain CSRF token'; exit 1 }
Write-Output ("CSRF token length: {0}" -f $csrf.Length)

# Prepare form data for credentials callback
$body = @{
  csrfToken   = $csrf
  callbackUrl = '/'
  username    = $env:NX_USERNAME
  password    = $env:NX_PASSWORD
}

# Post credentials
$loginResp = Invoke-WebRequest -UseBasicParsing -Uri "$base/api/auth/callback/credentials" -Method Post -WebSession $session -ContentType 'application/x-www-form-urlencoded' -Body $body -MaximumRedirection 0 -ErrorAction SilentlyContinue

# Note: NextAuth may redirect; we care that cookies are set in the session
# Check session endpoint
$sessionResp = Invoke-WebRequest -UseBasicParsing -Uri "$base/api/auth/session" -WebSession $session -ErrorAction Stop
try {
  $sessionJson = $sessionResp.Content | ConvertFrom-Json
} catch {
  Write-Error 'Failed to parse session JSON.'
  Write-Output $sessionResp.Content
  exit 1
}

if ($sessionJson.user -and $sessionJson.user.email) {
  Write-Output ("Authenticated as: {0}" -f $sessionJson.user.email)
  if ($sessionJson.expires) { Write-Output ("Session expires: {0}" -f $sessionJson.expires) }
  exit 0
} else {
  Write-Output 'Not authenticated. Full session response:'
  $sessionJson | ConvertTo-Json -Depth 5
  exit 2
}

