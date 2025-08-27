'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShieldCheckIcon,
  ComputerDesktopIcon,
  DevicePhoneMobileIcon,
  GlobeAltIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  TrashIcon,
  CheckCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { securityManager, SessionInfo, SecurityEvent } from '@/lib/security-manager'

interface SessionManagerProps {
  currentSessionId: string
  userId: string
  onSessionTerminated?: (sessionId: string) => void
}

export default function SessionManager({
  currentSessionId,
  userId,
  onSessionTerminated
}: SessionManagerProps) {
  const [sessions, setSessions] = useState<SessionInfo[]>([])
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([])
  const [selectedTab, setSelectedTab] = useState<'sessions' | 'activity'>('sessions')
  const [isLoading, setIsLoading] = useState(true)
  const [terminatingSession, setTerminatingSession] = useState<string | null>(null)

  useEffect(() => {
    loadData()
    
    // Refresh data every 30 seconds
    const interval = setInterval(loadData, 30000)
    return () => clearInterval(interval)
  }, [userId])

  const loadData = async () => {
    try {
      const [activeSessions, recentEvents] = await Promise.all([
        securityManager.getActiveSessions(userId),
        securityManager.getSecurityEvents(userId, 20)
      ])
      
      setSessions(activeSessions)
      setSecurityEvents(recentEvents)
    } catch (error) {
      console.error('Failed to load session data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleTerminateSession = async (sessionId: string) => {
    setTerminatingSession(sessionId)
    try {
      await securityManager.invalidateSession(sessionId, 'user_terminated')
      setSessions(prev => prev.filter(s => s.sessionId !== sessionId))
      onSessionTerminated?.(sessionId)
    } catch (error) {
      console.error('Failed to terminate session:', error)
    } finally {
      setTerminatingSession(null)
    }
  }

  const handleTerminateAllOther = async () => {
    try {
      const terminated = await securityManager.terminateOtherSessions(userId, currentSessionId)
      setSessions(prev => prev.filter(s => s.sessionId === currentSessionId))
      console.log(`Terminated ${terminated} sessions`)
    } catch (error) {
      console.error('Failed to terminate sessions:', error)
    }
  }

  const getDeviceIcon = (userAgent: string) => {
    if (/Mobile|Android|iPhone|iPad/.test(userAgent)) {
      return <DevicePhoneMobileIcon className="w-5 h-5" />
    }
    return <ComputerDesktopIcon className="w-5 h-5" />
  }

  const getDeviceInfo = (userAgent: string) => {
    if (userAgent.includes('Chrome')) return 'Chrome Browser'
    if (userAgent.includes('Firefox')) return 'Firefox Browser'
    if (userAgent.includes('Safari')) return 'Safari Browser'
    if (userAgent.includes('Edge')) return 'Edge Browser'
    return 'Unknown Browser'
  }

  const getSecurityLevelColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-green-400 bg-green-500/20'
      case 'medium': return 'text-yellow-400 bg-yellow-500/20'
      case 'low': return 'text-red-400 bg-red-500/20'
      default: return 'text-gray-400 bg-gray-500/20'
    }
  }

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'login': return <CheckCircleIcon className="w-4 h-4 text-green-400" />
      case 'logout': return <XMarkIcon className="w-4 h-4 text-gray-400" />
      case 'failed_login': return <ExclamationTriangleIcon className="w-4 h-4 text-red-400" />
      case 'suspicious_activity': return <ShieldCheckIcon className="w-4 h-4 text-orange-400" />
      default: return <ClockIcon className="w-4 h-4 text-blue-400" />
    }
  }

  const formatTimeAgo = (timestamp: number) => {
    const diff = Date.now() - timestamp
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    
    if (days > 0) return `${days}d ago`
    if (hours > 0) return `${hours}h ago`
    if (minutes > 0) return `${minutes}m ago`
    return 'Just now'
  }

  if (isLoading) {
    return (
      <div className="bg-slate-800 rounded-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-slate-700 rounded w-1/3"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-slate-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-slate-800 rounded-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-white">Session Management</h2>
          <p className="text-gray-400 text-sm mt-1">
            Manage your active sessions and security activity
          </p>
        </div>
        
        {sessions.length > 1 && (
          <button
            onClick={handleTerminateAllOther}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Terminate All Others
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6 bg-slate-700 rounded-lg p-1">
        {[
          { key: 'sessions', label: 'Active Sessions', count: sessions.length },
          { key: 'activity', label: 'Security Activity', count: securityEvents.length }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setSelectedTab(tab.key as any)}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              selectedTab === tab.key
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className="ml-2 px-2 py-1 bg-slate-600 rounded-full text-xs">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {selectedTab === 'sessions' && (
          <motion.div
            key="sessions"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {sessions.map((session) => (
              <div
                key={session.sessionId}
                className={`bg-slate-700 rounded-lg p-4 border ${
                  session.sessionId === currentSessionId
                    ? 'border-blue-500/50 bg-blue-500/10'
                    : 'border-slate-600'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-slate-600 rounded-lg">
                      {getDeviceIcon(session.userAgent)}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-white">
                          {getDeviceInfo(session.userAgent)}
                        </span>
                        {session.sessionId === currentSessionId && (
                          <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                            Current
                          </span>
                        )}
                        <span className={`px-2 py-1 text-xs rounded-full ${getSecurityLevelColor(session.securityLevel)}`}>
                          {session.securityLevel} security
                        </span>
                      </div>
                      
                      <div className="space-y-1 text-sm text-gray-400">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-1">
                            <GlobeAltIcon className="w-4 h-4" />
                            <span>{session.ipAddress}</span>
                          </div>
                          {session.location && (
                            <span>{session.location.city}, {session.location.country}</span>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          <ClockIcon className="w-4 h-4" />
                          <span>Last active: {formatTimeAgo(session.lastActivity)}</span>
                        </div>
                        
                        {session.isTrusted && (
                          <div className="flex items-center space-x-1 text-green-400">
                            <ShieldCheckIcon className="w-4 h-4" />
                            <span>Trusted device</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {session.sessionId !== currentSessionId && (
                    <button
                      onClick={() => handleTerminateSession(session.sessionId)}
                      disabled={terminatingSession === session.sessionId}
                      className="p-2 text-gray-400 hover:text-red-400 transition-colors disabled:opacity-50"
                    >
                      {terminatingSession === session.sessionId ? (
                        <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <TrashIcon className="w-4 h-4" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))}
            
            {sessions.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                <ComputerDesktopIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No active sessions found</p>
              </div>
            )}
          </motion.div>
        )}

        {selectedTab === 'activity' && (
          <motion.div
            key="activity"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-3"
          >
            {securityEvents.map((event) => (
              <div
                key={event.id}
                className="bg-slate-700 rounded-lg p-4 flex items-start space-x-3"
              >
                <div className="flex-shrink-0 mt-1">
                  {getEventIcon(event.type)}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-white capitalize">
                      {event.type.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-gray-400">
                      {formatTimeAgo(event.timestamp)}
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-400 space-y-1">
                    <div>IP: {event.ipAddress}</div>
                    {event.location && (
                      <div>Location: {event.location.city}, {event.location.country}</div>
                    )}
                    {event.riskScore > 50 && (
                      <div className="text-orange-400">
                        Risk Score: {event.riskScore}/100
                      </div>
                    )}
                    {event.details.reasons && (
                      <div className="text-red-400">
                        Reasons: {event.details.reasons.join(', ')}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {securityEvents.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                <ShieldCheckIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No security events found</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}