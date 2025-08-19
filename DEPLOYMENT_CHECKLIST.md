# 🚀 Vercel Deployment Checklist

## ✅ Pre-Deployment Steps Completed

- [x] Repository consolidated from `nohvex-nextjs-exchange-complete`
- [x] WalletConnect v2.0 production fixes applied
- [x] SSR-safe components implemented
- [x] CSP headers configured in `next.config.ts`
- [x] Debugging endpoints added (`/api/env-test`, `/api/db-test`, `/api/session-test`)
- [x] Environment verification script created (`verify-env.js`)
- [x] Latest changes pushed to GitHub

## 🔧 Environment Variables to Set in Vercel

**Critical for WalletConnect QR Code functionality:**

```bash
# WalletConnect (REQUIRED)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=5bf0a34aaf1ea069f905d12fe9cbda92

# ChangeNOW API (REQUIRED for swaps)
NEXT_PUBLIC_CHANGENOW_API_KEY=368c7f91139453e10734e446ad35e3712d376dbe1aa3e9219ed1159c40f7c236
NEXT_PUBLIC_CHANGENOW_REFERRAL=https://changenow.app.link/referral?link_id=671245e3259863

# NOWNodes API (REQUIRED for price data)
NOWNODES_API_KEY=df832fb4-5c52-4a90-9436-a0ca798883d7

# NextAuth (REQUIRED for authentication)
NEXTAUTH_SECRET=development-secret-key-change-in-production
NEXTAUTH_URL=https://nohvex-nextjs-exchange.vercel.app

# Environment
NODE_ENV=production
```

## 🧪 Post-Deployment Testing

After Vercel deployment completes:

### 1. **Environment Variables Check**
Visit: `https://your-app.vercel.app/api/env-test`
- Should show all variables as "SET" (not "NOT SET")

### 2. **WalletConnect QR Code Test**
1. Go to your deployed app
2. Click "Connect Wallet" 
3. Select "WalletConnect"
4. **QR Code should display immediately** ✅
5. Test with Token Pocket or other WalletConnect v2.0 wallets

### 3. **Database Connection Test**
Visit: `https://your-app.vercel.app/api/db-test`
- Should show successful connection or fallback to memory storage

### 4. **Session Test**
Visit: `https://your-app.vercel.app/api/session-test`
- Should return session information without errors

## 🔍 Troubleshooting

If QR code doesn't show:
1. Check browser console for errors
2. Verify `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` is set
3. Check `/api/env-test` endpoint
4. Ensure CSP headers allow WalletConnect domains

## 📱 Mobile Testing

Test WalletConnect with these wallets:
- Token Pocket ✅ (Primary target)
- MetaMask Mobile
- Trust Wallet
- Rainbow Wallet

## 🎯 Success Criteria

- [x] Vercel deployment completes without errors
- [ ] Environment variables all show as "SET"
- [ ] QR code displays on wallet connect
- [ ] Mobile wallets can scan and connect
- [ ] No console errors in browser
- [ ] All API endpoints respond correctly

---

**Deployment URL**: https://nohvex-nextjs-exchange.vercel.app
**Repository**: https://github.com/getienne7/nohvex-nextjs-exchange
**Last Updated**: August 18, 2025