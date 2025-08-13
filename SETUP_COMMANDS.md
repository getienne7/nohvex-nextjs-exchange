# Database Setup Commands

## After you get your Supabase connection string:

### Step 1: Update .env.local file
Replace both instances of `REPLACE_WITH_YOUR_SUPABASE_CONNECTION_STRING` with your actual connection string.

### Step 2: Run these commands in PowerShell:

```powershell
# Generate Prisma client
npx prisma generate

# Push database schema to Supabase (creates all tables)
npx prisma db push

# Test the database connection
npm run dev
# Then open: http://localhost:3000/api/db-test in your browser
# You should see: {"success": true, "message": "Database connection successful"}

# Stop the dev server with Ctrl+C
```

### Step 3: Update Vercel Environment Variables

```powershell
# Remove old DATABASE_URL
vercel env rm DATABASE_URL

# Add your Supabase DATABASE_URL
vercel env add DATABASE_URL
# Paste your Supabase connection string when prompted

# Add DIRECT_URL (same as DATABASE_URL for Supabase)
vercel env add DIRECT_URL  
# Paste the same Supabase connection string
```

### Step 4: Deploy to Production

```powershell
vercel --prod
```

## Verification Steps

1. **Local test**: Visit http://localhost:3000/api/db-test
2. **Create account**: Try signing up at http://localhost:3000/auth/signup
3. **Production test**: Visit https://nohvex-exchange.vercel.app/api/db-test
4. **Production signup**: Try creating account on live site

## Expected Results

✅ Database connection successful
✅ User registration works
✅ Authentication works  
✅ Portfolio loads with demo data
✅ Real-time prices still working

Your exchange will be fully functional! 🚀
