# TypeScript Fixes Needed

## Summary
- 59 TypeScript errors found in 8 files
- Main issues: Toast API, Property names, Unused variables

## 1. Toast API - Change `message` to `description` (25 instances)

**Fix:** Replace `message:` with `description:` in all `addToast()` calls

Files to fix:
- src/components/announcements/AnnouncementAnalytics.tsx (7 instances)
- src/components/announcements/CriticalAnnouncementBanner.tsx (3 instances)
- src/pages/AnnouncementDetailPage.tsx (8 instances)
- src/pages/AnnouncementsPage.tsx (7 instances)
- src/pages/CompanyAnnouncementsPage.tsx (2 instances)
- src/pages/CreateAnnouncementPage.tsx (4 instances)

## 2. BroadcastWithStatus property - Use `id` not `broadcast_id` (12 instances)

**Issue:** The RPC function `get_my_broadcasts` returns `broadcast_id` but our type uses `id`

**Fix:** Either:
- A) Update the RPC SQL function to alias `id` as `id` (not `broadcast_id`)
- B) Update the type definition to include `broadcast_id`

Files affected:
- src/components/announcements/CriticalAnnouncementBanner.tsx (3 instances)
- src/pages/AnnouncementsPage.tsx (7 instances)
- src/pages/CompanyAnnouncementsPage.tsx (2 instances)

**Recommended Fix:** Option B - Add `broadcast_id` to the type since the RPC returns it.

## 3. Unused Variables (8 instances)

Files:
- src/components/announcements/AnnouncementAnalytics.tsx: `navigate`
- src/pages/AnnouncementDetailPage.tsx: `profile`, `getInitials`
- src/pages/AnnouncementsPage.tsx: `navigate`, `profile`
- src/pages/CompanyAnnouncementsPage.tsx: `profile`
- src/pages/CreateAnnouncementPage.tsx: `user`
- src/routes/AppRouter.tsx: `CompanyAnnouncementsPage`, `AdminAnnouncementsPage`, `AdminCreateAnnouncementPage`

## 4. Type Mismatch - AnnouncementDetailPage line 72

**Issue:** `data` type is `{}` but should be `BroadcastWithStatus`

**Fix:** The RPC call needs proper typing

## 5. Supabase Query Issue - broadcast.service.ts line 253

**Issue:** Query builder can't be used directly in `.in()` method

**Fix:** Execute the subquery first, then use the results

