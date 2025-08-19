# Database Setup for NOHVEX Exchange

## Step 1: Create a Free PostgreSQL Database on Neon

1. Go to [Neon Console](https://console.neon.tech/)
2. Sign up for a free account
3. Create a new project called "nohvex-exchange"
4. Select PostgreSQL 15+ and the region closest to you
5. Copy the connection string (it will look like: `postgresql://username:password@ep-xxx.us-east-2.aws.neon.tech/neondb`)

## Step 2: Update Environment Variables

### Local Environment (.env.local)
```env
DATABASE_URL=postgresql://your-neon-connection-string
DIRECT_URL=postgresql://your-neon-connection-string
```

### Vercel Environment Variables
Run these commands to update your Vercel environment variables:

```bash
# Remove old DATABASE_URL
vercel env rm DATABASE_URL

# Add new DATABASE_URL with your Neon connection string  
vercel env add DATABASE_URL

# Also add DIRECT_URL for Prisma
vercel env add DIRECT_URL
```

## Step 3: Run Database Migration

After updating the environment variables, run:

```bash
# Generate Prisma client
npx prisma generate

# Push the database schema to your Neon database
npx prisma db push

# Optional: View your database in Prisma Studio
npx prisma studio
```

## Step 4: Deploy to Vercel

```bash
# Deploy with the new database configuration
vercel --prod
```

## Alternative: Use Vercel Postgres (Paid)

If you prefer to use Vercel's integrated PostgreSQL:

1. Go to your Vercel dashboard
2. Select your nohvex-exchange project
3. Go to the "Storage" tab
4. Click "Create Database" > "Postgres"
5. The environment variables will be automatically configured

## Verification

Once the database is set up and deployed:

1. Visit your live site: https://nohvex-exchange.vercel.app
2. Try creating an account at /auth/signup
3. Sign in and check that your portfolio loads correctly
4. The authentication should now work properly on both local and production!

## Database Schema

The current schema includes:
- `User` - User accounts with authentication
- `Portfolio` - User crypto holdings
- `Transaction` - Trading history
- `Account` & `Session` - NextAuth.js authentication tables
- `VerificationToken` - Email verification support

All new users automatically get demo portfolio data to showcase the platform.
