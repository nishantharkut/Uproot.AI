# How to Find Supabase Connection String - Step by Step

## Method 1: Via Settings Menu

1. **Login to Supabase**: Go to [supabase.com](https://supabase.com) and sign in

2. **Select Your Project**: Click on your project name in the dashboard

3. **Open Settings**:
   - Look at the **left sidebar**
   - Scroll down to the bottom
   - Click on **Settings** (⚙️ gear icon)

4. **Navigate to Database Settings**:
   - In the settings menu, click **Database** (under "Project Settings" section)

5. **Find Connection String**:
   - Scroll down the Database settings page
   - You'll see a section called **"Connection string"** or **"Connection pooling"**
   - There are multiple tabs: **URI**, **JDBC**, **Node.js**, **Python**, etc.
   - Click on the **URI** tab

6. **Copy the String**:
   - You'll see something like:
     ```
     postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
     ```
   - OR (direct connection):
     ```
     postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
     ```

7. **Replace Password**:
   - Replace `[YOUR-PASSWORD]` with the actual password you set when creating the project
   - The password might have special characters - if so, URL-encode them:
     - `@` becomes `%40`
     - `#` becomes `%23`
     - `%` becomes `%25`
     - etc.

## Method 2: Via Project Dashboard

1. **Go to your project dashboard**

2. **Click "Connect"** button or look for connection info

3. **Select "URI"** format

4. **Copy the connection string**

## Example Connection String

After replacing the password, it should look like:
```
postgresql://postgres.abcdefghijklmnop:[MYACTUALPASSWORD]@aws-0-ap-south-1.pooler.supabase.com:6543/postgres
```

## For Vercel/Serverless (Recommended)

Use the **Transaction mode** (port 6543) connection string - it works better with serverless functions:
- Look for **Connection pooling** toggle
- Select **Transaction mode**
- Copy the URI from that section

## If You Still Can't Find It

1. **Check if project is fully initialized**:
   - New projects take 2-3 minutes to set up
   - Look for a green status indicator

2. **Try the API tab**:
   - Go to **Settings** → **API**
   - Look for database connection details there

3. **Reset password**:
   - **Settings** → **Database** → **Database password**
   - Click "Reset database password"
   - Copy new password immediately (you won't see it again!)

4. **Check project status**:
   - Make sure your project shows as "Active" or "Healthy"
   - If it's still setting up, wait a few minutes

## Quick Visual Guide

```
Supabase Dashboard
  └── Your Project
      └── Left Sidebar
          └── ⚙️ Settings (bottom)
              └── Database
                  └── Scroll down
                      └── Connection string section
                          └── URI tab
                              └── Copy connection string
```

## Common Issues

### Issue: Connection string shows [YOUR-PASSWORD]
**Solution**: This is normal! Replace it with your actual password.

### Issue: Can't see Connection string section
**Solution**: 
- Make sure you're in Project Settings (not Account Settings)
- The project needs to be fully initialized
- Try refreshing the page

### Issue: Password has special characters
**Solution**: URL-encode special characters:
- `@` → `%40`
- `#` → `%23`
- `%` → `%25`
- `&` → `%26`
- `+` → `%2B`
- `=` → `%3D`

### Issue: Connection fails after setting up
**Solution**: 
- Double-check password is correct
- Make sure you replaced `[YOUR-PASSWORD]` placeholder
- Try the Transaction mode connection string (port 6543)
- Check if IP restrictions are enabled (disable for now)

