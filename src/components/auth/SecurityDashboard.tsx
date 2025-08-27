'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  ComputerDesktopIcon,
  GlobeAltIcon,
  KeyIcon,
  EyeIcon,
  CogIcon,
  ChartBarIcon,
  BellIcon
} from '@heroicons/react/24/outline'
import { securityManager, SecurityEvent } from '@/lib/security-manager'

interface SecurityDashboardProps {
  userId: string
  className?: string
}

export default function SecurityDashboard({ userId, className = '' }: SecurityDashboardProps) {
  const [securityStats, setSecurityStats] = useState({
    activeSessions: 0,
    securityEvents24h: 0,
    blockedIPs: 0,
    trustedDevices: 0,
    suspiciousActivity: 0
  })
  
  const [recentEvents, setRecentEvents] = useState<SecurityEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null)

  useEffect(() => {
    loadSecurityData()
    
    // Real-time updates
    const interval = setInterval(loadSecurityData, 10000)
    return () => clearInterval(interval)
  }, [userId])

  const loadSecurityData = async () => {
    try {
      const [stats, events] = await Promise.all([
        securityManager.getSecurityStats(),
        securityManager.getSecurityEvents(userId, 10)
      ])
      
      setSecurityStats(stats)
      setRecentEvents(events)
    } catch (error) {
      console.error('Failed to load security data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const securityMetrics = [
    {
      id: 'sessions',
      title: 'Active Sessions',
      value: securityStats.activeSessions,
      icon: <ComputerDesktopIcon className="w-6 h-6" />,
      color: 'text-blue-400 bg-blue-500/20',
      description: 'Currently active login sessions'
    },
    {
      id: 'events',
      title: 'Security Events (24h)',
      value: securityStats.securityEvents24h,
      icon: <ShieldCheckIcon className="w-6 h-6" />,
      color: 'text-green-400 bg-green-500/20',
      description: 'Security events in the last 24 hours'
    },
    {
      id: 'blocked',
      title: 'Blocked IPs',
      value: securityStats.blockedIPs,
      icon: <ExclamationTriangleIcon className="w-6 h-6" />,
      color: 'text-red-400 bg-red-500/20',
      description: 'IP addresses currently blocked'
    },
    {
      id: 'devices',
      title: 'Trusted Devices',
      value: securityStats.trustedDevices,
      icon: <KeyIcon className="w-6 h-6" />,
      color: 'text-purple-400 bg-purple-500/20',
      description: 'Devices marked as trusted'
    },
    {
      id: 'suspicious',
      title: 'Suspicious Activity',
      value: securityStats.suspiciousActivity,
      icon: <EyeIcon className="w-6 h-6" />,
      color: securityStats.suspiciousActivity > 0 ? 'text-orange-400 bg-orange-500/20' : 'text-green-400 bg-green-500/20',
      description: 'Suspicious activities detected today'
    }
  ]

  const getEventSeverityColor = (riskScore: number) => {
    if (riskScore >= 80) return 'text-red-400 bg-red-500/20'
    if (riskScore >= 50) return 'text-orange-400 bg-orange-500/20'
    if (riskScore >= 30) return 'text-yellow-400 bg-yellow-500/20'
    return 'text-green-400 bg-green-500/20'
  }

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'login': return <ShieldCheckIcon className="w-4 h-4" />
      case 'logout': return <ClockIcon className="w-4 h-4" />
      case 'failed_login': return <ExclamationTriangleIcon className="w-4 h-4" />
      case 'suspicious_activity': return <EyeIcon className="w-4 h-4" />
      default: return <BellIcon className="w-4 h-4" />
    }
  }

  const formatTimeAgo = (timestamp: number) => {
    const diff = Date.now() - timestamp
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    
    if (hours > 0) return `${hours}h ago`
    if (minutes > 0) return `${minutes}m ago`
    return 'Just now'
  }

  if (isLoading) {
    return (
      <div className={`bg-slate-800 rounded-lg p-6 ${className}`}>
        <div className="animate-pulse space-y-6">
          <div className="h-6 bg-slate-700 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-24 bg-slate-700 rounded"></div>
            ))}
          </div>
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
    <div className={`bg-slate-800 rounded-lg p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-white">Security Dashboard</h2>
          <p className="text-gray-400 text-sm mt-1">
            Monitor your account security and recent activity
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${
            securityStats.suspiciousActivity === 0 ? 'bg-green-400' : 'bg-orange-400'
          } animate-pulse`}></div>
          <span className="text-sm text-gray-400">
            {securityStats.suspiciousActivity === 0 ? 'Secure' : 'Alert'}
          </span>
        </div>
      </div>

      {/* Security Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {securityMetrics.map((metric, index) => (
          <motion.div
            key={metric.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => setSelectedMetric(selectedMetric === metric.id ? null : metric.id)}
            className={`bg-slate-700 rounded-lg p-4 cursor-pointer transition-all hover:bg-slate-600 ${
              selectedMetric === metric.id ? 'ring-2 ring-blue-500' : ''
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2 rounded-lg ${metric.color}`}>
                {metric.icon}
              </div>
              {metric.value > 0 && metric.id === 'suspicious' && (
                <span className="w-2 h-2 bg-red-400 rounded-full animate-ping"></span>
              )}
            </div>
            
            <div className="text-2xl font-bold text-white mb-1">
              {metric.value}
            </div>
            
            <div className="text-sm text-gray-400 mb-2">
              {metric.title}
            </div>
            
            {selectedMetric === metric.id && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="text-xs text-gray-500 border-t border-slate-600 pt-2"
              >
                {metric.description}
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Security Health Score */}
      <div className="bg-slate-700 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-white">Security Health Score</h3>
          <button className="text-gray-400 hover:text-white transition-colors">
            <CogIcon className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Overall Security</span>
              <span className="text-sm font-medium text-green-400">85/100</span>
            </div>
            <div className="w-full bg-slate-600 rounded-full h-2">
              <div className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                   style={{ width: '85%' }}></div>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-lg font-bold text-green-400">Excellent</div>
            <div className="text-xs text-gray-500">Security Rating</div>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-slate-600">
          <div className="text-center">
            <div className="text-sm font-medium text-white">2FA</div>
            <div className="text-xs text-green-400">Enabled</div>
          </div>
          <div className="text-center">
            <div className="text-sm font-medium text-white">Sessions</div>
            <div className="text-xs text-blue-400">Monitored</div>
          </div>
          <div className="text-center">
            <div className="text-sm font-medium text-white">Threats</div>
            <div className="text-xs text-green-400">Blocked</div>
          </div>
        </div>
      </div>

      {/* Recent Security Events */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Recent Security Events</h3>
          <button className="text-blue-400 text-sm hover:text-blue-300 transition-colors">
            View All
          </button>
        </div>
        
        <div className="space-y-3">
          {recentEvents.length > 0 ? (
            recentEvents.slice(0, 5).map((event) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-slate-700 rounded-lg p-4 flex items-center space-x-3"
              >
                <div className={`p-2 rounded-full ${getEventSeverityColor(event.riskScore)}`}>
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
                  
                  <div className="text-sm text-gray-400">
                    {event.ipAddress}
                    {event.location && ` • ${event.location.city}, ${event.location.country}`}
                    {event.riskScore > 30 && (
                      <span className="ml-2 text-orange-400">
                        Risk: {event.riskScore}/100
                      </span>
                    )}
                  </div>
                </div>
                
                {event.riskScore > 50 && (
                  <div className="text-orange-400">
                    <ExclamationTriangleIcon className="w-5 h-5" />
                  </div>
                )}
              </motion.div>
            ))
          ) : (
            <div className="text-center py-6 text-gray-400">
              <ShieldCheckIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No security events to display</p>
              <p className="text-sm mt-1">Your account is secure</p>
            </div>
          )}
        </div>
      </div>

      {/* Security Recommendations */}
      {securityStats.suspiciousActivity > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 bg-orange-500/10 border border-orange-500/30 rounded-lg p-4"
        >
          <div className="flex items-start space-x-3">
            <ExclamationTriangleIcon className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-orange-400 mb-1">Security Alert</h4>
              <p className="text-sm text-orange-300 mb-3">
                We've detected {securityStats.suspiciousActivity} suspicious activities on your account.
              </p>
              <div className="flex space-x-3">
                <button className="px-3 py-1 bg-orange-600 text-white text-sm rounded hover:bg-orange-700 transition-colors">
                  Review Activity
                </button>
                <button className="px-3 py-1 border border-orange-500 text-orange-400 text-sm rounded hover:bg-orange-500/10 transition-colors">
                  Secure Account
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}