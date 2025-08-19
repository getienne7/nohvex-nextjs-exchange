'use client'

import { motion } from 'framer-motion'
import { ShieldCheckIcon, WalletIcon, EyeSlashIcon } from '@heroicons/react/24/outline'

const trustSignals = [
  {
    name: 'Non-Custodial',
    description: 'Your keys, your crypto. We never hold your funds - you maintain full control.',
    icon: WalletIcon,
  },
  {
    name: 'Privacy First',
    description: 'Your portfolio data is encrypted and private. We never share your information.',
    icon: EyeSlashIcon,
  },
  {
    name: 'Security Audited',
    description: 'Our smart contracts and platform undergo regular security audits.',
    icon: ShieldCheckIcon,
  },
]

export function TrustSignals() {
  return (
    <div className="bg-white/5 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-base font-semibold leading-7 text-emerald-400"
          >
            Built for DeFi
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl"
          >
            Secure DeFi Portfolio Management
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 text-lg leading-8 text-gray-300"
          >
            Built with security and privacy at its core. Connect your wallet and manage your DeFi 
            investments with confidence, knowing your assets remain under your control.
          </motion.p>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none"
        >
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
            {trustSignals.map((signal, index) => (
              <motion.div 
                key={signal.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                whileHover={{ y: -5 }}
                className="relative pl-16 flex flex-col"
              >
                <dt className="text-base font-semibold leading-7 text-white">
                  <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-emerald-500">
                    <signal.icon className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                  {signal.name}
                </dt>
                <dd className="mt-2 flex-auto text-base leading-7 text-gray-400">
                  {signal.description}
                </dd>
              </motion.div>
            ))}
          </dl>
        </motion.div>
      </div>
    </div>
  )
}

