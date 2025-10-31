# Broadcast System Migration Checklist

Use this checklist when deploying the broadcast system to ensure all steps are completed correctly.

## Pre-Migration

- [ ] **Backup Database**
  - Create a snapshot of current database
  - Document current schema version
  - Note any existing custom types that might conflict

- [ ] **Review Dependencies**
  - [ ] Verify `user_profiles` table exists
  - [ ] Verify `seafarer_profiles` table exists
  - [ ] Verify `vessels` table exists
  - [ ] Verify `assignments` table exists
  - [ ] Verify `uuid_generate_v4()` extension is enabled

- [ ] **Review Existing Types**
  - [ ] Check if `broadcast_priority` enum exists
  - [ ] Check if `broadcast_target_type` enum exists
  - [ ] If exists, verify values match requirements

## Migration Steps

### Step 1: Database Setup

- [ ] **Open Supabase Dashboard**
  - [ ] Navigate to SQL Editor
  - [ ] Create new query

- [ ] **Execute Migration**
  - [ ] Copy contents of `broadcast-system-setup.sql`
  - [ ] Paste into SQL Editor
  - [ ] Review the SQL before running
  - [ ] Click "Run"
  - [ ] Wait for completion message

- [ ] **Verify Success Messages**
  - [ ] "BROADCAST SYSTEM CREATED SUCCESSFULLY!" appears
  - [ ] No error messages in output
  - [ ] All tables listed in output
  - [ ] All functions listed in output

### Step 2: Verification

- [ ] **Verify Tables Created**
  ```sql
  SELECT table_name 
  FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name IN ('broadcasts', 'broadcast_reads');
  ```
  - [ ] Returns 2 rows

- [ ] **Verify Enums Created**
  ```sql
  SELECT typname 
  FROM pg_type 
  WHERE typname IN ('broadcast_priority', 'broadcast_target_type');
  ```
  - [ ] Returns 2 rows

- [ ] **Verify RLS Enabled**
  ```sql
  SELECT tablename, rowsecurity 
  FROM pg_tables 
  WHERE tablename IN ('broadcasts', 'broadcast_reads');
  ```
  - [ ] Both tables show `rowsecurity = true`

- [ ] **Verify Indexes Created**
  ```sql
  SELECT indexname 
  FROM pg_indexes 
  WHERE tablename IN ('broadcasts', 'broadcast_reads') 
  AND indexname LIKE 'idx_%';
  ```
  - [ ] Returns at least 10 indexes

- [ ] **Verify RLS Policies**
  ```sql
  SELECT tablename, policyname 
  FROM pg_policies 
  WHERE tablename IN ('broadcasts', 'broadcast_reads');
  ```
  - [ ] Returns at least 8 policies

- [ ] **Verify RPC Functions**
  ```sql
  SELECT routine_name 
  FROM information_schema.routines 
  WHERE routine_schema = 'public' 
  AND routine_name LIKE '%broadcast%';
  ```
  - [ ] Returns 5 functions:
    - [ ] `get_my_broadcasts`
    - [ ] `get_broadcast_recipients`
    - [ ] `mark_broadcast_as_read`
    - [ ] `acknowledge_broadcast`
    - [ ] `get_broadcast_analytics`

### Step 3: Testing

- [ ] **Run Test Suite**
  - [ ] Copy contents of `test-broadcast-system.sql`
  - [ ] Paste into SQL Editor
  - [ ] Click "Run"
  - [ ] Review test results

- [ ] **Verify Test Results**
  - [ ] Test 1.1 - 1.5: Broadcast creation (5 tests)
  - [ ] Test 2.1 - 2.5: RPC functions (5 tests)
  - [ ] Test 3.1 - 3.3: RLS policies (3 tests)
  - [ ] Test 4.1: Indexes (1 test)
  - [ ] Test 5.1 - 5.2: Data integrity (2 tests)
  - [ ] Test 6.1: Performance (1 test)
  - [ ] All 17 tests PASSED

- [ ] **Manual Testing**
  - [ ] Create test broadcast as company user
  - [ ] View broadcasts as seafarer
  - [ ] Mark broadcast as read
  - [ ] Acknowledge broadcast (if required)
  - [ ] View analytics as company user
  - [ ] View recipients list

### Step 4: Code Integration

- [ ] **Verify TypeScript Files**
  - [ ] `src/types/broadcast.types.ts` exists
  - [ ] `src/services/broadcast.service.ts` exists
  - [ ] `src/types/index.ts` exports broadcast types

- [ ] **Run Type Checking**
  ```bash
  npm run type-check
  # or
  tsc --noEmit
  ```
  - [ ] No TypeScript errors

- [ ] **Run Linter**
  ```bash
  npm run lint
  ```
  - [ ] No linting errors in new files

- [ ] **Test Imports**
  ```typescript
  import { createBroadcast } from '@/services/broadcast.service';
  import type { Broadcast } from '@/types/broadcast.types';
  ```
  - [ ] Imports work without errors

### Step 5: Environment Setup

- [ ] **Environment Variables**
  - [ ] `SUPABASE_URL` configured
  - [ ] `SUPABASE_ANON_KEY` configured
  - [ ] Connection to Supabase working

- [ ] **Authentication**
  - [ ] Test user authentication
  - [ ] Verify auth.uid() works in RPC functions
  - [ ] Test with different user types (seafarer, company, admin)

## Post-Migration

### Step 6: Documentation

- [ ] **Update Project Documentation**
  - [ ] Add broadcast system to main README
  - [ ] Update API documentation
  - [ ] Update database schema documentation
  - [ ] Update user guides

- [ ] **Team Communication**
  - [ ] Notify development team
  - [ ] Share documentation links
  - [ ] Schedule knowledge transfer session
  - [ ] Update project status

### Step 7: Monitoring

- [ ] **Set Up Monitoring**
  - [ ] Monitor broadcast creation rate
  - [ ] Track read/acknowledgment rates
  - [ ] Watch for RLS policy violations
  - [ ] Monitor query performance

- [ ] **Configure Alerts**
  - [ ] Set up alerts for failed broadcasts
  - [ ] Alert for slow queries
  - [ ] Alert for RLS policy errors
  - [ ] Alert for low acknowledgment rates (critical broadcasts)

### Step 8: User Training

- [ ] **Prepare Training Materials**
  - [ ] Create user guide for company users
  - [ ] Create user guide for seafarers
  - [ ] Prepare video tutorials
  - [ ] Create quick reference cards

- [ ] **Conduct Training**
  - [ ] Train company users on creating broadcasts
  - [ ] Train all users on reading/acknowledging
  - [ ] Demonstrate analytics dashboard
  - [ ] Answer questions

## Rollback Plan

In case of issues, follow this rollback procedure:

- [ ] **Prepare Rollback**
  ```sql
  -- Drop tables (CASCADE will drop dependent objects)
  DROP TABLE IF EXISTS broadcast_reads CASCADE;
  DROP TABLE IF EXISTS broadcasts CASCADE;
  
  -- Drop enums
  DROP TYPE IF EXISTS broadcast_target_type CASCADE;
  DROP TYPE IF EXISTS broadcast_priority CASCADE;
  
  -- Drop functions
  DROP FUNCTION IF EXISTS get_my_broadcasts() CASCADE;
  DROP FUNCTION IF EXISTS get_broadcast_recipients(UUID) CASCADE;
  DROP FUNCTION IF EXISTS mark_broadcast_as_read(UUID) CASCADE;
  DROP FUNCTION IF EXISTS acknowledge_broadcast(UUID) CASCADE;
  DROP FUNCTION IF EXISTS get_broadcast_analytics(UUID) CASCADE;
  DROP FUNCTION IF EXISTS update_broadcast_updated_at() CASCADE;
  ```

- [ ] **Restore from Backup**
  - [ ] Restore database snapshot
  - [ ] Verify data integrity
  - [ ] Test application functionality

- [ ] **Document Issues**
  - [ ] Record what went wrong
  - [ ] Document errors encountered
  - [ ] Plan fixes for next attempt

## Troubleshooting

### Common Issues

**Issue: "relation already exists"**
- Solution: Tables already created, safe to ignore or drop and recreate

**Issue: "type already exists"**
- Solution: Enums already created, safe to ignore

**Issue: "permission denied"**
- Solution: Ensure you're running as database owner or superuser

**Issue: "function already exists"**
- Solution: Drop existing function first or use CREATE OR REPLACE

**Issue: Tests fail**
- Solution: Check if test users exist, review error messages

## Success Criteria

Migration is successful when:

- ✅ All tables created without errors
- ✅ All indexes created
- ✅ All RLS policies active
- ✅ All RPC functions working
- ✅ All 17 tests passing
- ✅ No TypeScript errors
- ✅ Manual testing successful
- ✅ Documentation updated
- ✅ Team notified

## Timeline

Estimated migration time: **30-45 minutes**

- Pre-Migration: 10 minutes
- Migration Steps: 10 minutes
- Testing: 10 minutes
- Integration: 5-10 minutes
- Documentation: 5 minutes

## Contacts

**Database Administrator:** [Your DBA Contact]  
**Technical Lead:** [Your Tech Lead Contact]  
**Support:** [Your Support Contact]

## Sign-off

- [ ] **DBA Approval**
  - Name: _______________
  - Date: _______________
  - Signature: _______________

- [ ] **Tech Lead Approval**
  - Name: _______________
  - Date: _______________
  - Signature: _______________

- [ ] **QA Approval**
  - Name: _______________
  - Date: _______________
  - Signature: _______________

---

**Migration Date:** _______________  
**Migration By:** _______________  
**Status:** ⬜ Not Started | ⬜ In Progress | ⬜ Complete | ⬜ Rolled Back

**Notes:**
_______________________________________________________________________________
_______________________________________________________________________________
_______________________________________________________________________________

