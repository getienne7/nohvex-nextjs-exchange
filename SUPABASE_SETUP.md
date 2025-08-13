# Quick Database Setup with Supabase (Free)

## Step 1: Create Supabase Account
1. Go to [Supabase](https://supabase.com/)
2. Sign up for free
3. Create a new project called "nohvex-exchange"
4. Choose a region close to you
5. Set a strong database password

## Step 2: Get Connection String
1. In your Supabase dashboard, go to Settings → Database
2. Under "Connection string", select "URI" 
3. Copy the connection string that looks like:
   `postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres`

## Step 3: Update Environment Variables

### Update .env.local file:
```env
# NOWNodes API Configuration  
NOWNODES_API_KEY=f89f19e0-5a02-4744-bcf0-215aaeade721
NOWNODES_BASE_URL=https://bsc.nownodes.io

# Database
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres
DIRECT_URL=postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# App Configuration
NODE_ENV=development
```

### Update Vercel Environment Variables:
```bash
# Update DATABASE_URL on Vercel
vercel env add DATABASE_URL

# Add DIRECT_URL for Prisma  
vercel env add DIRECT_URL
```

## Step 4: Run Database Migration
```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Test the connection
npm run dev
# Then visit: http://localhost:3000/api/db-test
```

## Step 5: Deploy to Vercel
```bash
vercel --prod
```

## Verification
Once deployed, test:
1. Visit: https://nohvex-exchange.vercel.app/api/db-test
2. Should see: `{"success": true, "message": "Database connection successful"}`
3. Try signing up at: https://nohvex-exchange.vercel.app/auth/signup

## Database Features
- **Free Tier**: 500MB storage, 2 concurrent connections
- **Real-time subscriptions** (for future live updates)
- **Built-in authentication** (if you want to switch from NextAuth)
- **Automatic backups**
- **Dashboard with SQL editor**

Your NOHVEX Exchange will now have:
✅ Real-time cryptocurrency prices (NOWNodes)
✅ Real PostgreSQL database (Supabase) 
✅ Working authentication system
✅ Portfolio & transaction tracking
