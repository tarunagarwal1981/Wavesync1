# WaveSync Maritime Platform - Phase 1 Testing Guide

## 🎯 **Overview**

This guide will help you set up and test all Phase 1 functionalities of the WaveSync Maritime Platform, including user onboarding, company management, and profile completion.

---

## 📋 **Prerequisites**

### **1. Supabase Project Setup**
- Create a new Supabase project at [supabase.com](https://supabase.com)
- Note down your project URL and anon key
- Ensure you have admin access to the project

### **2. Environment Configuration**
Create a `.env` file in your project root:
```env
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### **3. Required Dependencies**
Make sure you have Node.js installed and run:
```bash
npm install @supabase/supabase-js dotenv
```

---

## 🗄️ **Database Setup**

### **Step 1: Run Database Setup Script**
1. Open your Supabase project dashboard
2. Go to **SQL Editor**
3. Copy and paste the contents of `database-setup-complete.sql`
4. Click **Run** to execute the script
5. Verify all tables are created successfully

### **Step 2: Set Up Storage Buckets**
1. In the same SQL Editor, run the `storage-setup.sql` script
2. Go to **Storage** in your Supabase dashboard
3. Verify that three buckets are created:
   - `documents` (private)
   - `avatars` (public)
   - `company-logos` (public)

### **Step 3: Update Storage URL**
In the `storage-setup.sql` file, update the helper function with your actual project reference:
```sql
RETURN 'https://your-actual-project-ref.supabase.co/storage/v1/object/public/' || bucket_name || '/' || file_path;
```

---

## 🧪 **Automated Testing**

### **Step 1: Run Automated Tests**
```bash
node test-phase1.js
```

This script will test:
- ✅ Database connection
- ✅ Company creation
- ✅ User creation (all types)
- ✅ Authentication
- ✅ Profile retrieval
- ✅ RLS policies
- ✅ Storage buckets

### **Step 2: Review Test Results**
The script will output:
- Pass/fail status for each test
- Detailed error messages for failures
- Overall success rate
- Automatic cleanup of test data

---

## 🖥️ **Manual Testing**

### **Step 1: Start the Application**
```bash
npm run dev
```

### **Step 2: Create Admin User**
1. Go to your Supabase **Authentication** dashboard
2. Click **Add User**
3. Create an admin user:
   - Email: `admin@wavesync.com`
   - Password: `admin123456`
   - Auto-confirm: ✅

4. In **SQL Editor**, run:
```sql
INSERT INTO user_profiles (id, email, full_name, user_type, phone)
SELECT id, email, 'Admin User', 'admin', '+1-555-0001'
FROM auth.users
WHERE email = 'admin@wavesync.com';
```

### **Step 3: Test Admin Dashboard**
1. Login with admin credentials
2. Navigate to Admin Dashboard
3. Test **Company Management**:
   - Create a new company
   - Edit company details
   - Delete a company
4. Test **User Management**:
   - Create a company user
   - Create a seafarer user
   - Edit user profiles
   - Delete users

### **Step 4: Test Seafarer Profile Completion**
1. Create a seafarer user through admin panel
2. Logout and login as the seafarer
3. Verify the profile completion form appears
4. Fill out all required fields
5. Submit and verify profile is saved

### **Step 5: Test Company User Functionality**
1. Login as a company user
2. Verify access to company-specific features
3. Test user profile management

---

## 🔍 **Testing Checklist**

### **Database Tests**
- [ ] All tables created successfully
- [ ] RLS policies working correctly
- [ ] Indexes created for performance
- [ ] Triggers functioning properly

### **Authentication Tests**
- [ ] Admin user can login
- [ ] Company user can login
- [ ] Seafarer user can login
- [ ] Password reset works
- [ ] Email confirmation works

### **Admin Dashboard Tests**
- [ ] Dashboard loads correctly
- [ ] Statistics display properly
- [ ] Navigation between sections works
- [ ] Company management CRUD operations
- [ ] User management CRUD operations

### **Profile Management Tests**
- [ ] Seafarer profile completion form
- [ ] Profile data validation
- [ ] Profile data persistence
- [ ] Profile completion check logic

### **Storage Tests**
- [ ] File upload to documents bucket
- [ ] File upload to avatars bucket
- [ ] File upload to company-logos bucket
- [ ] Storage policies working correctly

### **Security Tests**
- [ ] RLS policies prevent unauthorized access
- [ ] Users can only see their own data
- [ ] Admins can see all data
- [ ] Company users can see relevant data

---

## 🐛 **Troubleshooting**

### **Common Issues**

#### **1. Database Connection Failed**
- Check your Supabase URL and key
- Verify your project is active
- Check network connectivity

#### **2. RLS Policy Errors**
- Ensure you're logged in with the correct user type
- Check that RLS policies are properly created
- Verify user profiles exist in the database

#### **3. Storage Upload Failed**
- Check storage bucket policies
- Verify file size limits
- Check MIME type restrictions

#### **4. Profile Completion Not Working**
- Check if seafarer profile exists
- Verify profile completion logic
- Check for JavaScript errors in browser console

### **Debug Steps**
1. Check browser console for errors
2. Check Supabase logs in dashboard
3. Verify database tables and data
4. Test API calls directly in Supabase dashboard

---

## 📊 **Success Criteria**

Phase 1 is considered successful when:

- ✅ All automated tests pass (100% success rate)
- ✅ Admin can create and manage companies
- ✅ Admin can create and manage users
- ✅ Seafarers can complete their profiles
- ✅ All user types can authenticate
- ✅ RLS policies work correctly
- ✅ Storage buckets are accessible
- ✅ No critical errors in browser console
- ✅ All CRUD operations work smoothly

---

## 🚀 **Next Steps**

Once Phase 1 testing is complete:

1. **Document any issues** found during testing
2. **Fix any bugs** or configuration problems
3. **Update documentation** based on findings
4. **Prepare for Phase 2** implementation
5. **Set up production environment** if needed

---

## 📞 **Support**

If you encounter issues during testing:

1. Check the troubleshooting section above
2. Review Supabase documentation
3. Check the project's GitHub issues
4. Contact the development team

---

**Happy Testing! 🎉**
