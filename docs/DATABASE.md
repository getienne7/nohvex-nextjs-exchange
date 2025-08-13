# Database Management Guide 🗄️

This guide covers database setup, deployment, and troubleshooting for the NOHVEX Exchange platform.

## Quick Start ⚡

### Local Development
```bash
# Generate Prisma client
npm run db:generate

# Initialize database connection (optional check)
npm run db:init

# If you have a local PostgreSQL database, push schema
npm run db:push
```

### Production Deployment
The database is automatically deployed during the build process via the `postbuild` script.

## Database Architecture 🏗️

### Technology Stack
- **Database**: PostgreSQL (production)
- **ORM**: Prisma 6.14.0
- **Fallback**: In-memory storage (development/fallback)
- **Authentication**: NextAuth.js with Prisma adapter

### Schema Overview
```sql
User
├── id (String, Primary Key)
├── email (String, Unique)
├── name (String, Optional)
├── password (String)
├── emailVerified (DateTime, Optional)
├── image (String, Optional)
├── createdAt (DateTime)
├── updatedAt (DateTime)
└── Relations:
    ├── accounts (Account[])
    ├── sessions (Session[])
    ├── portfolio (Portfolio[])
    └── transactions (Transaction[])

Portfolio
├── id (String, Primary Key)
├── userId (String, Foreign Key)
├── symbol (String) // BTC, ETH, etc.
├── name (String) // Bitcoin, Ethereum, etc.
├── amount (Float)
├── averagePrice (Float)
├── totalValue (Float)
├── createdAt (DateTime)
├── updatedAt (DateTime)
└── Unique: [userId, symbol]

Transaction
├── id (String, Primary Key)
├── userId (String, Foreign Key)
├── type (TransactionType) // BUY, SELL, DEPOSIT, WITHDRAWAL
├── symbol (String)
├── amount (Float)
├── price (Float)
├── totalValue (Float)
├── fee (Float)
├── status (TransactionStatus) // PENDING, COMPLETED, FAILED, CANCELLED
├── createdAt (DateTime)
└── updatedAt (DateTime)
```

## Environment Setup 🔧

### Required Environment Variables
```env
# Production Database (Required for persistence)
DATABASE_URL="postgresql://username:password@host:port/database"

# NextAuth Configuration
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="https://your-domain.com"
```

### Vercel Configuration
The `DATABASE_URL` should be configured in Vercel's environment variables:
1. Go to Vercel Dashboard → Project → Settings → Environment Variables
2. Add `DATABASE_URL` with your PostgreSQL connection string
3. Make sure it's enabled for Production, Preview, and Development

## Database Connection Logic 🔄

The application uses a smart fallback system:

### Connection Priority
1. **PostgreSQL Database** (if DATABASE_URL is configured)
   - Full persistence
   - All user data saved permanently
   - Production-ready

2. **In-Memory Storage** (fallback)
   - Temporary storage
   - Data lost on restart
   - Development/testing only

### Automatic Schema Deployment
- **Development**: Use `npm run db:push` to sync schema
- **Production**: Schema automatically deployed via `postbuild` script
- **Fallback**: Application continues with in-memory storage if database fails

## Commands Reference 📝

### Database Operations
```bash
# Initialize and test database connection
npm run db:init

# Deploy database schema to production
npm run db:deploy

# Push schema changes (development)
npm run db:push

# Generate Prisma client
npm run db:generate

# Open Prisma Studio (database GUI)
npm run db:studio
```

### Prisma Commands
```bash
# Generate client after schema changes
npx prisma generate

# Push schema without migrations (development)
npx prisma db push

# Create and apply migrations (production)
npx prisma migrate dev --name your_migration_name

# Deploy migrations to production
npx prisma migrate deploy

# Reset database (⚠️ DESTRUCTIVE)
npx prisma migrate reset
```

## Troubleshooting 🔍

### Common Issues

#### 1. "Environment variable not found: DATABASE_URL"
**Cause**: DATABASE_URL is not configured
**Solution**: 
- Add DATABASE_URL to your environment variables
- Or use in-memory storage for development

#### 2. "Database does not exist"
**Cause**: PostgreSQL database hasn't been created
**Solution**:
```sql
-- Connect to PostgreSQL and create database
CREATE DATABASE nohvex_exchange;
```

#### 3. "Connection refused"
**Cause**: Database server is not running or unreachable
**Solution**:
- Check if PostgreSQL is running
- Verify connection string format
- Check firewall/network settings

#### 4. "Schema not found"
**Cause**: Database exists but tables haven't been created
**Solution**:
```bash
# Push schema to create tables
npm run db:push
```

### Health Check API
Visit `/api/users` to check database status:
- ✅ Green status = Database connected
- ⚠️ Yellow status = Using in-memory fallback
- ❌ Red status = Database error

## Production Best Practices 🏆

### Database Security
- Use connection pooling
- Enable SSL/TLS connections
- Use strong passwords
- Rotate credentials regularly
- Monitor database performance

### Backup Strategy
- Automated daily backups
- Test backup restoration regularly
- Keep backups in separate location
- Document recovery procedures

### Performance Optimization
- Index frequently queried columns
- Use connection pooling
- Monitor slow queries
- Regular database maintenance

## Migration Strategy 📦

### Development
1. Make schema changes in `prisma/schema.prisma`
2. Run `npx prisma db push` for quick iteration
3. Test changes locally

### Production
1. Create formal migration: `npx prisma migrate dev`
2. Review generated SQL
3. Test on staging environment
4. Deploy via `npx prisma migrate deploy`

## Monitoring & Maintenance 🔧

### Key Metrics to Monitor
- Connection pool usage
- Query response times
- Database size growth
- Error rates
- User registration trends

### Regular Maintenance
- Update Prisma regularly
- Monitor database logs
- Analyze slow queries
- Clean up old data if needed

## Support & Resources 📚

### Documentation
- [Prisma Documentation](https://prisma.io/docs)
- [NextAuth.js Prisma Adapter](https://authjs.dev/reference/adapter/prisma)
- [PostgreSQL Documentation](https://postgresql.org/docs)

### Useful Tools
- [Prisma Studio](https://prisma.io/studio) - Database GUI
- [pgAdmin](https://pgadmin.org) - PostgreSQL administration
- [TablePlus](https://tableplus.com) - Database client

---

## Database Status 📊

You can always check the current database status by visiting:
`https://your-domain.com/api/users`

This endpoint provides real-time information about:
- Database connection status
- Storage type being used
- User count (when safe to display)
- Configuration status

---

*Need help? Check the troubleshooting section above or review the application logs.*
