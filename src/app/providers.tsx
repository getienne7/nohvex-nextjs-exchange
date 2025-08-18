'use client'

import { SessionProvider } from 'next-auth/react'
import { NotificationProvider } from '@/contexts/NotificationContext'
import { GlobalNotificationContainer } from '@/components/notifications/NotificationContainer'
import AlertsWatcher from '@/components/alerts/AlertsWatcher'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <NotificationProvider defaultDuration={3500}>
        {children}
        <GlobalNotificationContainer />
        <AlertsWatcher />
      </NotificationProvider>
    </SessionProvider>
  )
}
