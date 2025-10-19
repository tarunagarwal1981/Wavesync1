# 🔧 Travel Management Setup - Issues Fixed

## Problems Identified

### 1. **Policy Already Exists Error** ❌
```
ERROR: 42710: policy "Users can view their own travel requests" for table "travel_requests" already exists
```
**Cause**: RLS policies were already created in a previous run.

### 2. **Column Status Does Not Exist Error** ❌
```
ERROR: 42703: column "status" does not exist
```
**Causes**:
- Referenced `assignment_priority` enum that doesn't exist in travel management context
- Column name inconsistencies (`check_in_date` vs `checkin_date`)

---

## ✅ Solutions Provided

### **File 1: `phase3-travel-management-setup-fixed.sql`** (RECOMMENDED)
**Use this file for a clean, complete setup**

**What it fixes:**
1. ✅ Drops and recreates all enum types using `DROP TYPE IF EXISTS ... CASCADE`
2. ✅ Changes `priority` from `assignment_priority` enum to `VARCHAR(20)`
3. ✅ Uses consistent column names: `checkin_date` and `checkout_date` (no underscores)
4. ✅ Drops existing policies before creating new ones
5. ✅ Drops existing indexes before creating new ones
6. ✅ Drops existing triggers before creating new ones
7. ✅ Uses `CREATE TABLE IF NOT EXISTS` to avoid table recreation
8. ✅ Comprehensive error handling

**Key Changes:**
- Line 82: `priority VARCHAR(20) DEFAULT 'normal'` (was: `assignment_priority`)
- Line 173: `checkin_date DATE NOT NULL` (consistent naming)
- Line 174: `checkout_date DATE NOT NULL` (consistent naming)
- Added `DROP POLICY IF EXISTS` for all policies
- Added `DROP INDEX IF EXISTS` for all indexes

---

### **File 2: `fix-travel-policies.sql`**
**Use this to fix only the policy errors (preserves existing data)**

**What it does:**
- ✅ Drops all existing RLS policies
- ✅ Recreates policies with correct definitions
- ❌ Does NOT fix column/enum issues

**When to use**: If you only have policy errors, not column errors.

---

### **File 3: `phase3-travel-management-setup-clean.sql`**
**Alternative complete setup**

**Similar to fixed version but:**
- Uses `DROP TYPE IF EXISTS` without CASCADE (may have dependency issues)
- May require manual intervention if types are in use

---

## 🚀 Recommended Setup Steps

### **Option A: Fresh Start (RECOMMENDED)** ⭐

```sql
-- Step 1: Run the fixed setup script
-- File: phase3-travel-management-setup-fixed.sql
```

**Steps:**
1. Open Supabase Dashboard → SQL Editor
2. Copy entire contents of `phase3-travel-management-setup-fixed.sql`
3. Click "Run"
4. Wait for success message

**Expected Output:**
```
✅ TRAVEL MANAGEMENT SYSTEM - SETUP COMPLETE!
📊 Database Objects Created:
  - 6 Enum Types
  - 5 Tables
  - 13 RLS Policies
  - 18 Indexes
  - 5 Update Triggers
```

---

### **Option B: Incremental Fix** 🔧

If you want to preserve existing data and only fix issues:

```sql
-- Step 1: Drop existing policies
-- (Run fix-travel-policies.sql)

-- Step 2: Alter column types
ALTER TABLE travel_requests ALTER COLUMN priority TYPE VARCHAR(20);

-- Step 3: Rename columns if needed
ALTER TABLE accommodations RENAME COLUMN check_in_date TO checkin_date;
ALTER TABLE accommodations RENAME COLUMN checkout_date TO checkout_date;
```

---

## 📋 Verification Checklist

After running the setup, verify:

### **1. Check Enum Types**
```sql
SELECT typname 
FROM pg_type 
WHERE typname IN ('travel_type', 'travel_status', 'flight_class', 'travel_document_type', 'expense_type', 'expense_status');
```
**Expected**: 6 rows

### **2. Check Tables**
```sql
SELECT tablename 
FROM pg_tables 
WHERE tablename IN ('travel_requests', 'flight_bookings', 'accommodations', 'travel_documents', 'travel_expenses')
AND schemaname = 'public';
```
**Expected**: 5 rows

### **3. Check RLS Policies**
```sql
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE tablename LIKE '%travel%' OR tablename LIKE '%accommodation%' OR tablename LIKE '%flight%';
```
**Expected**: 13 rows

### **4. Check Indexes**
```sql
SELECT indexname 
FROM pg_indexes 
WHERE indexname LIKE 'idx_travel%' OR indexname LIKE 'idx_flight%' OR indexname LIKE 'idx_accommodation%'
AND schemaname = 'public';
```
**Expected**: 18 rows

### **5. Check Triggers**
```sql
SELECT tgname, tgrelid::regclass 
FROM pg_trigger 
WHERE tgname LIKE '%travel%' OR tgname LIKE '%accommodation%' OR tgname LIKE '%flight%';
```
**Expected**: 5 rows (plus system triggers)

---

## 🔍 Column Changes Summary

### **travel_requests table:**
| Column | Old Type | New Type | Reason |
|--------|----------|----------|--------|
| `priority` | `assignment_priority` (enum) | `VARCHAR(20)` | Enum doesn't exist in travel context |

### **accommodations table:**
| Column | Old Name | New Name | Reason |
|--------|----------|----------|--------|
| `check_in_date` | (with underscore) | `checkin_date` | Consistency |
| `check_out_date` | (with underscore) | `checkout_date` | Consistency |

---

## 🎯 Next Steps After Setup

Once the setup is complete:

1. ✅ **Run Notification Triggers**
   ```sql
   -- File: travel-notification-triggers.sql
   ```

2. ✅ **Setup Storage**
   ```sql
   -- File: travel-storage-setup.sql
   ```

3. ✅ **Test the UI**
   - Login as company user
   - Navigate to "Travel Planning"
   - Create a test travel request
   - Verify it appears in the list

4. ✅ **Test Seafarer View**
   - Login as seafarer
   - Navigate to "My Travel"
   - Verify travel request appears

---

## ⚠️ Common Issues & Solutions

### **Issue: "type does not exist"**
**Solution**: The enum types weren't created. Run the fixed script which drops and recreates them.

### **Issue: "column does not exist"**
**Solution**: Table was created with old schema. Either:
- Run the fixed script (it will update the table)
- Or manually alter the columns as shown in Option B

### **Issue: "relation already exists"**
**Solution**: Tables already exist. The script uses `CREATE TABLE IF NOT EXISTS`, so this shouldn't happen. If it does, the script will skip table creation and only update policies/indexes.

### **Issue: "cannot drop type because other objects depend on it"**
**Solution**: The fixed script uses `DROP TYPE ... CASCADE` which handles dependencies automatically.

---

## 📞 Still Having Issues?

If you encounter other errors:

1. **Check the error message carefully** - note the line number
2. **Run verification queries** to see what exists
3. **Drop and recreate** specific objects if needed:
   ```sql
   -- Example: Drop and recreate a specific policy
   DROP POLICY IF EXISTS "policy_name" ON table_name;
   CREATE POLICY "policy_name" ON table_name ...
   ```

---

## ✅ Success Indicators

You'll know the setup is successful when:

- ✅ No errors in SQL Editor
- ✅ Success message appears
- ✅ All verification queries return expected row counts
- ✅ Travel Planning page loads without errors
- ✅ Can create a travel request
- ✅ Seafarer can view travel in My Travel page

---

*Last Updated: October 18, 2025*
*Fixed Version: 1.1.0*

