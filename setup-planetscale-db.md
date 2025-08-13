# PlanetScale Database Setup (Alternative)

If you prefer PlanetScale over Neon:

## Step 1: Create PlanetScale Account
1. Go to https://planetscale.com/
2. Sign up with GitHub
3. Create new database: `nohvex-exchange`

## Step 2: Get Connection String
1. Go to your database dashboard
2. Click "Connect"
3. Select "Prisma" as framework
4. Copy the connection string

## Step 3: Setup Branch (Optional)
PlanetScale uses branches like Git:
- `main` branch is your production database
- You can create `dev` branch for development

## Connection String Format:
```
mysql://username:password@aws.connect.psdb.cloud/nohvex-exchange?sslaccept=strict
```

Note: PlanetScale uses MySQL, so we'd need to update the Prisma schema provider from "postgresql" to "mysql".
