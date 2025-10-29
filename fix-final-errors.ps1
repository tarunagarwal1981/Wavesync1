# Fix remaining TypeScript errors

Write-Host "Fixing CreateAnnouncementPage.tsx..." -ForegroundColor Green

# Fix line 172: description -> message in createBroadcast call
$file = "src/pages/CreateAnnouncementPage.tsx"
$content = Get-Content $file -Raw
$content = $content -replace '(\s+)description: formData\.message,', '$1message: formData.message,'
$content = $content -replace '(\s+)description: formData\.message', '$1message: formData.message'
$content = $content -replace 'message: e\.target\.value \}\)', 'message: e.target.value }'
Set-Content $file $content

Write-Host "Fixing AppRouter.tsx..." -ForegroundColor Green

# Remove unused imports
$file = "src/routes/AppRouter.tsx"
$content = Get-Content $file
$content = $content | Where-Object { $_ -notmatch 'const CompanyAnnouncementsPage = lazy' }
$content = $content | Where-Object { $_ -notmatch 'const AdminAnnouncementsPage = lazy' }
$content = $content | Where-Object { $_ -notmatch 'const AdminCreateAnnouncementPage = lazy' }
$content | Set-Content $file

Write-Host "Fixing broadcast.service.ts..." -ForegroundColor Green

# Fix Supabase query
$file = "src/services/broadcast.service.ts"
$content = Get-Content $file -Raw
$content = $content -replace '\.in\(\s*''sender_id'',\s*\n\s*supabase\s*\n\s*\.from\(''user_profiles''\)\s*\n\s*\.select\(''id''\)\s*\n\s*\.eq\(''company_id'', profile\.company_id\)\s*\)', '.eq(''company_id'', profile.company_id)'
Set-Content $file $content

Write-Host "Done! Run 'npm run build' to verify." -ForegroundColor Green

