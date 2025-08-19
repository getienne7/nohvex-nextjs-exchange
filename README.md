# NOHVEX - DeFi Portfolio Management Platform

A comprehensive DeFi portfolio management platform built with Next.js, featuring advanced analytics, yield tracking, and cross-chain capabilities.

## 🚀 Features

- **DeFi Portfolio Management**: Connect your wallet and track your decentralized investments
- **Real-time Analytics**: Monitor portfolio performance, yields, and risk metrics
- **Strategy Simulator**: Test DeFi strategies risk-free with virtual balance
- **Cross-Chain Swaps**: Swap cryptocurrencies across different blockchains
- **Yield Tracking**: Monitor DeFi yields and farming rewards
- **Modern UI/UX**: Responsive design with smooth animations using Framer Motion
- **Secure & Non-Custodial**: Your keys, your crypto - we never hold your funds
- **Privacy First**: Encrypted data with no information sharing

## 🛠 Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS, Framer Motion
- **API Integration**: NOWNodes for real-time crypto data

## 🔗 DeFi Integration

This platform integrates with various DeFi protocols and services:

- **Real-time Price Feeds**: Live cryptocurrency pricing for accurate portfolio valuation
- **Cross-Chain Support**: Swap assets across different blockchain networks
- **Yield Farming**: Track and optimize DeFi yield farming strategies
- **Portfolio Analytics**: Advanced metrics for DeFi investment performance

### API Endpoints

- `GET /api/prices?symbols=BTC,ETH,BNB` - Fetch multiple cryptocurrency prices
- `POST /api/prices` - Get single cryptocurrency price

## 🔧 Getting Started

First, clone and install dependencies:

```bash
git clone <repository-url>
cd nohvex-exchange
npm install
```

### Environment Setup

Create a `.env.local` file with the following variables:

```env
# NOWNodes API Configuration
NOWNODES_API_KEY=your-nownodes-api-key
NOWNODES_BASE_URL=https://bsc.nownodes.io

# Database
DATABASE_URL=your-postgresql-connection-string
DIRECT_URL=your-postgresql-direct-connection-string

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
