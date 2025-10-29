# Quick fix for remaining errors

# Fix CreateAnnouncementPage - replace description with message in the createBroadcast call
(Get-Content "src/pages/CreateAnnouncementPage.tsx") -replace 'description: formData\.message', 'message: formData.message' | Set-Content "src/pages/CreateAnnouncementPage.tsx"

# Fix CreateAnnouncementPage - setState with description -> message
(Get-Content "src/pages/CreateAnnouncementPage.tsx") -replace '\{ \.\.\.formData, description:', '{ ...formData, message:' | Set-Content "src/pages/CreateAnnouncementPage.tsx"

Write-Host "Fixed CreateAnnouncementPage.tsx" -ForegroundColor Green

# Remove unused AppRouter imports - just comment them out
$content = Get-Content "src/routes/AppRouter.tsx"
$newContent = @()
foreach ($line in $content) {
    if ($line -match 'const (Company|Admin).*Page = lazy') {
        $newContent += "// $line"
    } else {
        $newContent += $line
    }
}
$newContent | Set-Content "src/routes/AppRouter.tsx"

Write-Host "Fixed AppRouter.tsx" -ForegroundColor Green
Write-Host "Done!" -ForegroundColor Green

