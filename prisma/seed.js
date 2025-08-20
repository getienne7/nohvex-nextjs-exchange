import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database with demo data...');

  // Create demo user
  const hashedPassword = await bcrypt.hash('demo123', 12);
  
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@nohvex.com' },
    update: {},
    create: {
      email: 'demo@nohvex.com',
      name: 'Demo User',
      password: hashedPassword,
      emailVerified: new Date(),
    },
  });

  console.log('✅ Created demo user:', demoUser.email);

  // Create demo portfolio
  const portfolioData = [
    { symbol: 'BTC', name: 'Bitcoin', amount: 0.5, averagePrice: 45000, totalValue: 22500 },
    { symbol: 'ETH', name: 'Ethereum', amount: 5.0, averagePrice: 3000, totalValue: 15000 },
    { symbol: 'ADA', name: 'Cardano', amount: 1000, averagePrice: 0.5, totalValue: 500 },
    { symbol: 'DOT', name: 'Polkadot', amount: 100, averagePrice: 25, totalValue: 2500 },
    { symbol: 'LINK', name: 'Chainlink', amount: 50, averagePrice: 20, totalValue: 1000 },
  ];

  for (const asset of portfolioData) {
    await prisma.portfolio.upsert({
      where: {
        userId_symbol: {
          userId: demoUser.id,
          symbol: asset.symbol,
        },
      },
      update: asset,
      create: {
        ...asset,
        userId: demoUser.id,
      },
    });
  }

  console.log('✅ Created demo portfolio with 5 assets');

  // Create demo transactions
  const transactionData = [
    { type: 'BUY', symbol: 'BTC', amount: 0.1, price: 44000, totalValue: 4400, fee: 22 },
    { type: 'BUY', symbol: 'ETH', amount: 2.0, price: 2900, totalValue: 5800, fee: 29 },
    { type: 'SELL', symbol: 'ADA', amount: 200, price: 0.55, totalValue: 110, fee: 0.55 },
    { type: 'BUY', symbol: 'DOT', amount: 50, price: 24, totalValue: 1200, fee: 6 },
  ];

  for (const tx of transactionData) {
    await prisma.transaction.create({
      data: {
        ...tx,
        userId: demoUser.id,
        status: 'COMPLETED',
      },
    });
  }

  console.log('✅ Created demo transaction history');

  // Create demo price alerts
  const alertData = [
    { symbol: 'BTC', operator: 'GT', threshold: 50000 },
    { symbol: 'ETH', operator: 'LT', threshold: 2500 },
    { symbol: 'ADA', operator: 'GT', threshold: 1.0 },
  ];

  for (const alert of alertData) {
    await prisma.alert.create({
      data: {
        ...alert,
        userId: demoUser.id,
      },
    });
  }

  console.log('✅ Created demo price alerts');

  console.log('\n🎉 Database seeding completed!');
  console.log('\n📋 Demo Account:');
  console.log('Email: demo@nohvex.com');
  console.log('Password: demo123');
  console.log('\n🔗 You can now login with these credentials');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });