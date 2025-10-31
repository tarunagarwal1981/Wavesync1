# PowerShell Script to Fix TypeScript Errors
# Run this from the project root

Write-Host "Fixing TypeScript errors in announcement files..." -ForegroundColor Green

# Fix Toast API - Replace 'message:' with 'description:' in announcement files
$files = @(
    "src/components/announcements/CriticalAnnouncementBanner.tsx",
    "src/pages/AnnouncementDetailPage.tsx",
    "src/pages/AnnouncementsPage.tsx",
    "src/pages/CompanyAnnouncementsPage.tsx",
    "src/pages/CreateAnnouncementPage.tsx"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "Fixing Toast API in $file..."
        (Get-Content $file) -replace '(\s+)message:', '$1description:' | Set-Content $file
    }
}

# Fix broadcast_id -> id in BroadcastWithStatus usage
$bcFiles = @(
    "src/components/announcements/CriticalAnnouncementBanner.tsx",
    "src/pages/AnnouncementsPage.tsx",
    "src/pages/CompanyAnnouncementsPage.tsx"
)

foreach ($file in $bcFiles) {
    if (Test-Path $file) {
        Write-Host "Fixing broadcast_id property in $file..."
        (Get-Content $file) -replace '\.broadcast_id', '.id' | Set-Content $file
    }
}

Write-Host "Done! Please review changes and run 'npm run build' to verify." -ForegroundColor Green

