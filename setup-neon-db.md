# Neon Database Setup for NOHVEX Exchange

## Step 1: Create Neon Account
1. Go to https://console.neon.tech/
2. Sign up with GitHub or email
3. Create new project:
   - Project name: `nohvex-exchange`
   - Database name: `nohvexdb`
   - Region: Choose closest to your location

## Step 2: Get Connection String
After creating the project, copy the connection string that looks like:
```
postgresql://username:password@ep-xxx-xxx.us-east-2.aws.neon.tech/nohvexdb?sslmode=require
```

## Step 3: Test Connection Locally
1. Update your local .env.local with the Neon connection string:
```bash
DATABASE_URL="your-neon-connection-string-here"
```

2. Test the connection:
```bash
npx prisma db push
```

3. Verify it works:
```bash
npx prisma studio
```

## Step 4: Deploy to Vercel
Once local connection works, we'll update Vercel environment variables and deploy.

## Benefits of Neon:
✅ Excellent connectivity from Vercel
✅ Automatic scaling
✅ Built-in connection pooling
✅ Free tier with generous limits
✅ Fast setup and deployment
