'use client'

import { SessionProvider } from 'next-auth/react'
import { NotificationProvider } from '@/contexts/NotificationContext'
import { WalletProvider } from '@/contexts/WalletContext'
import { GlobalNotificationContainer } from '@/components/notifications/NotificationContainer'
import AlertsWatcher from '@/components/alerts/AlertsWatcher'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <NotificationProvider defaultDuration={3500}>
        <WalletProvider>
          {children}
          <GlobalNotificationContainer />
          <AlertsWatcher />
        </WalletProvider>
      </NotificationProvider>
    </SessionProvider>
  )
}
