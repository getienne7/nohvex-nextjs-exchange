import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

async function verifyAccount() {
  const prisma = new PrismaClient()
  
  try {
    console.log('🔍 Checking for gletienne@outlook.com account...\n');
    
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: {
        email: 'gletienne@outlook.com'
      },
      include: {
        accounts: true,
        sessions: true,
        portfolio: true,
        transactions: true
      }
    });
    
    if (user) {
      console.log('✅ Account found in database!');
      console.log(`📧 Email: ${user.email}`);
      console.log(`🆔 User ID: ${user.id}`)
      console.log(`📅 Created: ${user.createdAt}`);
      console.log(`🔄 Updated: ${user.updatedAt}`);
      
      if (user.name) console.log(`👤 Name: ${user.name}`);
      if (user.image) console.log(`🖼️ Image: ${user.image}`);
      
      console.log(`\n📊 Account Details:`);
      console.log(`   - OAuth Accounts: ${user.accounts.length}`);
      console.log(`   - Active Sessions: ${user.sessions.length}`);
      console.log(`   - Portfolios: ${user.portfolio.length}`);
      console.log(`   - Total Transactions: ${user.transactions.length}`);
      
      if (user.portfolio.length > 0) {
        console.log(`   - Portfolio holdings:`);
        user.portfolio.forEach(p => {
          console.log(`     • ${p.symbol}: ${p.amount} (avg: $${p.averagePrice})`);
        });
      }
      
      console.log('\n🎉 Account registration and database persistence successful!');
      
    } else {
      console.log('❌ No account found for gletienne@outlook.com');
      console.log('Please make sure you have registered through the web interface first.');
    }
    
    // Show database connection info
    console.log('\n📋 Database Connection Status:');
    const userCount = await prisma.user.count();
    console.log(`   - Total users in database: ${userCount}`);
    console.log(`   - Database: PostgreSQL (persistent storage)`);
    
  } catch (error) {
    console.error('❌ Error checking account:', error.message);
    
    if (error.message.includes('connect')) {
      console.log('\n💡 Database connection issue. Make sure:');
      console.log('   1. PostgreSQL is running');
      console.log('   2. DATABASE_URL is set in .env.local');
      console.log('   3. Database schema is up to date');
    }
  } finally {
    await prisma.$disconnect();
  }
}

// Run verification
verifyAccount().catch(console.error)
