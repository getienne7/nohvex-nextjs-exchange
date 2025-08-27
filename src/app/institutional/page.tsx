'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import InstitutionalDashboard from '@/components/institutional/InstitutionalDashboard'
import {
  BuildingOfficeIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  DocumentChartBarIcon,
  UsersIcon,
  BanknotesIcon
} from '@heroicons/react/24/outline'

export default function InstitutionalPortfolioPage() {
  const [selectedInstitution] = useState('demo-institution')
  const [userId] = useState('demo-user-123')
  const [userRole] = useState('portfolio-manager')

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="flex items-center justify-center space-x-3 mb-4">
              <BuildingOfficeIcon className="w-8 h-8 text-blue-400" />
              <h1 className="text-3xl font-bold text-white">
                Institutional Portfolio Management
              </h1>
            </div>
            <p className="text-gray-400 text-lg">
              Enterprise-grade portfolio management with advanced risk analytics and compliance monitoring
            </p>
          </motion.div>
        </div>
      </div>

      {/* Features Overview */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
        >
          {[
            {
              icon: ChartBarIcon,
              title: 'Advanced Analytics',
              description: 'Comprehensive risk metrics, performance attribution, and portfolio optimization'
            },
            {
              icon: ShieldCheckIcon,
              title: 'Risk Management',
              description: 'VaR calculations, stress testing, and real-time risk monitoring'
            },
            {
              icon: DocumentChartBarIcon,
              title: 'Compliance Reporting',
              description: 'Automated compliance checks and institutional-grade reporting'
            },
            {
              icon: UsersIcon,
              title: 'Multi-User Access',
              description: 'Role-based permissions for portfolio managers, analysts, and compliance officers'
            },
            {
              icon: BanknotesIcon,
              title: 'Automated Rebalancing',
              description: 'Smart rebalancing with customizable constraints and approval workflows'
            },
            {
              icon: BuildingOfficeIcon,
              title: 'Institution Management',
              description: 'Multi-portfolio oversight with consolidated reporting and analytics'
            }
          ].map((feature, index) => {
            const Icon = feature.icon
            return (
              <div
                key={index}
                className="bg-slate-800 rounded-lg p-6 border border-slate-700 hover:border-slate-600 transition-colors"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <Icon className="w-6 h-6 text-blue-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">{feature.title}</h3>
                </div>
                <p className="text-gray-400 text-sm">{feature.description}</p>
              </div>
            )
          })}
        </motion.div>

        {/* Main Dashboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <InstitutionalDashboard
            institutionId={selectedInstitution}
            userId={userId}
            userRole={userRole}
          />
        </motion.div>

        {/* Key Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-12 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-xl p-8 border border-blue-500/20"
        >
          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            Institutional-Grade Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: 'Risk Models', value: 'VaR, CVaR, Monte Carlo', description: 'Advanced risk calculations' },
              { label: 'Compliance', value: '100+ Rules', description: 'Automated monitoring' },
              { label: 'Asset Classes', value: 'Multi-Asset', description: 'Crypto, DeFi, Traditional' },
              { label: 'Reporting', value: 'Real-Time', description: 'Live portfolio analytics' }
            ].map((feature, index) => (
              <div key={index} className="text-center">
                <div className="text-2xl font-bold text-blue-400 mb-1">{feature.value}</div>
                <div className="text-white font-medium mb-1">{feature.label}</div>
                <div className="text-gray-400 text-sm">{feature.description}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}