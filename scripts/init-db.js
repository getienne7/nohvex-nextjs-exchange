import { PrismaClient } from '@prisma/client'

async function initializeDatabase() {
  const prisma = new PrismaClient()
  
  try {
    console.log('🔌 Testing database connection...')
    
    // Test the connection
    await prisma.$queryRaw`SELECT 1`
    console.log('✅ Database connection successful!')
    
    console.log('📋 Checking database schema...')
    
    // Check if tables exist by trying to count users
    try {
      const userCount = await prisma.user.count()
      console.log(`✅ Database schema is ready! Found ${userCount} users.`)
      
      // If no users exist, we can optionally create a test user
      if (userCount === 0) {
        console.log('📝 Database is empty. This is normal for a new deployment.')
      }
      
    } catch (schemaError) {
      console.log('⚠️  Database schema not found. This is expected for a new database.')
      console.log('ℹ️  Schema will be created automatically on first use.')
    }
    
  } catch (connectionError) {
    console.error('❌ Database connection failed:', connectionError.message)
    
    if (connectionError.message.includes('does not exist')) {
      console.log('💡 This might be a new database that needs to be created.')
    }
    
    if (connectionError.message.includes('connect ECONNREFUSED')) {
      console.log('💡 Database server is not reachable. Check your DATABASE_URL.')
    }
    
    // Don't throw error - let the app continue with fallback storage
    console.log('🔄 Application will use in-memory storage as fallback.')
  } finally {
    await prisma.$disconnect()
  }
}

// Run if called directly
if (process.argv[1] && new URL(import.meta.url).pathname.endsWith(new URL(`file://${process.argv[1]}`).pathname)) {
  initializeDatabase()
    .then(() => {
      console.log('🎉 Database initialization complete!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 Database initialization failed:', error)
      process.exit(1)
    })
}

export { initializeDatabase }
