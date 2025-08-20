#!/usr/bin/env node

import { PrismaClient } from '@prisma/client';

async function checkUsers() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Checking production users...\n');
    
    // Get all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        emailVerified: true,
        _count: {
          select: {
            portfolio: true,
            transactions: true,
            alerts: true,
            walletConnections: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    console.log(`👥 Total users: ${users.length}\n`);
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name || 'No name'} (${user.email})`);
      console.log(`   📅 Created: ${user.createdAt.toISOString().split('T')[0]}`);
      console.log(`   ✅ Verified: ${user.emailVerified ? 'Yes' : 'No'}`);
      console.log(`   📊 Portfolio: ${user._count.portfolio} assets`);
      console.log(`   📈 Transactions: ${user._count.transactions}`);
      console.log(`   🔔 Alerts: ${user._count.alerts}`);
      console.log(`   🔗 Wallets: ${user._count.walletConnections}`);
      console.log('');
    });
    
    // Check for the specific user
    const targetUser = users.find(u => u.email === 'gletienne@outlook.com');
    if (targetUser) {
      console.log('🎯 Found your account: gletienne@outlook.com');
      console.log(`   Status: ${targetUser.emailVerified ? 'Verified' : 'Needs verification'}`);
      
      if (targetUser._count.portfolio === 0) {
        console.log('   💡 No portfolio data - you can add some manually or run seed script');
      }
    } else {
      console.log('⚠️  Account gletienne@outlook.com not found');
      console.log('   Try creating it again or check the email spelling');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();