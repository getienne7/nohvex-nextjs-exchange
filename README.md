# NOHVEX Exchange - Cryptocurrency Trading Platform

A modern, secure cryptocurrency exchange platform built with Next.js, featuring real-time pricing via NOWNodes integration.

## 🚀 Features

- **Real-time Cryptocurrency Pricing**: Powered by NOWNodes API for accurate, up-to-date market data
- **Interactive Trading Interface**: Live exchange rates with automatic conversion calculations
- **Portfolio Management**: Track your crypto holdings with real-time profit/loss calculations
- **Modern UI/UX**: Responsive design with smooth animations using Framer Motion
- **Secure Authentication**: Built with NextAuth.js for robust user management
- **Database Integration**: Prisma ORM with PostgreSQL for data persistence

## 🛠 Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS, Framer Motion
- **API Integration**: NOWNodes for real-time crypto data

## 📊 NOWNodes Integration

This project uses NOWNodes for real-time cryptocurrency pricing data. The integration provides:

- Live price feeds for major cryptocurrencies (BTC, ETH, BNB, USDT, ADA, etc.)
- Real-time exchange rate calculations
- Automatic price updates every 10-30 seconds
- Fallback pricing for enhanced reliability

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
