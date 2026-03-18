# ⚠️ RESTART REQUIRED - Employee List Fix

## What Was Fixed

1. ✅ Added HR RLS policies to allow HR users to view all employees
2. ✅ Added debugging logs to track data loading
3. ✅ Configured Supabase admin client properly
4. ✅ Verified employee data exists in database (1 employee: fitsum tesfaye)

## Why Restart is Needed

The following changes require a server restart:
- Updated `app/hr/actions.ts` with new Supabase client configuration
- Added console logging for debugging
- RLS policies were updated in the database

## How to Restart

### Option 1: Stop and Start (Recommended)
```bash
# Press Ctrl+C in the terminal running the dev server
# Then run:
npm run dev
```

### Option 2: Kill and Restart
```bash
# Find the process
Get-Process node

# Kill it
Stop-Process -Name node -Force

# Start again
npm run dev
```

## After Restart - Testing Steps

1. **Login as HR user**
   - Go to http://localhost:3000/login
   - Login with HR credentials

2. **Navigate to Employee List**
   - Go to http://localhost:3000/hr/employees
   - You should see "fitsum tesfaye (EMP001)" in the list

3. **Check Browser Console**
   - Open DevTools (F12)
   - Look for these logs:
     ```
     Loading employee data...
     getEmployees success: 1 employees
     Employees loaded: 1 [...]
     ```

4. **Test Creating New Employee**
   - Click "Add Employee"
   - Fill in the form
   - Submit
   - Navigate back - new employee should appear

## Troubleshooting

### If employees still don't show:

1. **Check console logs** - Look for errors in browser console
2. **Check server logs** - Look for "getEmployees error:" in terminal
3. **Verify you're logged in as HR** - Check your role in the database:
   ```sql
   SELECT email, role FROM profiles WHERE email = 'your-email@example.com';
   ```

### If you see RLS errors:

The new policies should fix this, but if you still see RLS errors:
```sql
-- Temporarily disable RLS for testing (NOT for production!)
ALTER TABLE employees DISABLE ROW LEVEL SECURITY;
```

## Database Verification

Current employee in database:
- Employee ID: EMP001
- Name: fitsum tesfaye
- Email: fitsum.tria@gmail.com
- Status: active
- Created: 2026-03-06

## Files Modified
1. `app/hr/actions.ts` - Added logging and proper Supabase config
2. `app/hr/employees/page.tsx` - Added detailed console logging
3. Database - Added HR RLS policies

## Next Steps After Restart
Once the server restarts and you can see employees:
1. Test creating a new employee
2. Test the manager dropdown shows all employees
3. Test creating a department and seeing it in the dropdown
4. Remove console.log statements if everything works
