'use client'

import { SessionProvider } from 'next-auth/react'
import { NotificationProvider } from '@/contexts/NotificationContext'
import { GlobalNotificationContainer } from '@/components/notifications/NotificationContainer'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <NotificationProvider>
        {children}
        <GlobalNotificationContainer />
      </NotificationProvider>
    </SessionProvider>
  )
}
