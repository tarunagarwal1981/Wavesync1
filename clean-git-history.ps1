# Clean .env.template from git history
Write-Host "Removing ai-service/.env.template from git history..." -ForegroundColor Yellow

# Remove the file from all commits
git filter-branch --force --index-filter `
  "git rm --cached --ignore-unmatch ai-service/.env.template" `
  --prune-empty --tag-name-filter cat -- --all 2>&1 | Out-Null

Write-Host "Cleaning up..." -ForegroundColor Yellow
Remove-Item -Path .git/refs/original -Recurse -Force -ErrorAction SilentlyContinue
git reflog expire --expire=now --all 2>&1 | Out-Null
git gc --prune=now --aggressive 2>&1 | Out-Null

Write-Host "Done! Now you can force push with: git push origin dev --force" -ForegroundColor Green

