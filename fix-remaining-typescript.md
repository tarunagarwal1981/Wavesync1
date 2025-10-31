# Remaining TypeScript Fixes

## Files to fix manually:

### 1. src/pages/CompanyAnnouncementsPage.tsx
- Line 35: Remove `profile` from destructuring
- Line 181: Change `selectedBroadcast.id` to `selectedBroadcast.broadcast_id`
- Line 292: Change `broadcast.id` to `broadcast.broadcast_id`

### 2. src/pages/CreateAnnouncementPage.tsx
- Line 45: Remove unused `user` variable
- Rename FormData interface to CreateAnnouncementFormData (conflicts with native FormData)
- Line 173: Change `description:` back to `message:` (CreateBroadcastData expects message, not description)

### 3. src/routes/AppRouter.tsx
- Lines 50, 67, 68: Remove unused lazy imports (CompanyAnnouncementsPage, AdminAnnouncementsPage, AdminCreateAnnouncementPage)

### 4. src/services/broadcast.service.ts
- Line 253: Fix Supabase subquery - execute it first then use results

These are straightforward fixes that will resolve all remaining TypeScript errors.

