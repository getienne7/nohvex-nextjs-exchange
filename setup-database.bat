@echo off
echo Setting up NOHVEX Exchange Database...
echo.

echo Step 1: Generating Prisma client...
npx prisma generate

echo.
echo Step 2: Pushing database schema to Supabase...
npx prisma db push

echo.
echo Step 3: Testing database connection...
npm run dev &
timeout /t 5 > nul
curl http://localhost:3000/api/db-test
taskkill /f /im node.exe

echo.
echo ✅ Database setup complete!
echo.
echo Next steps:
echo 1. Update Vercel environment variables
echo 2. Deploy to production
echo.
pause
