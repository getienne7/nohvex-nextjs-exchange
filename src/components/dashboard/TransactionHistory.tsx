'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { ArrowUpIcon, ArrowDownIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'

interface Transaction {
  id: string
  type: 'BUY' | 'SELL' | 'DEPOSIT' | 'WITHDRAWAL'
  symbol: string
  amount: number
  price: number
  totalValue: number
  fee: number
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED'
  createdAt: string
}

export default function TransactionHistory() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  useEffect(() => {
    fetchTransactions()
  }, [])

  const filterTransactions = useCallback(() => {
    let filtered = transactions

    // Filter by type
    if (filter !== 'all') {
      filtered = filtered.filter(tx => tx.type.toLowerCase() === filter)
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(tx => 
        tx.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.status.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredTransactions(filtered)
    setCurrentPage(1) // Reset to first page when filtering
  }, [transactions, filter, searchTerm])

  useEffect(() => {
    filterTransactions()
  }, [filterTransactions])

  const fetchTransactions = async () => {
    try {
      const response = await fetch('/api/transactions')
      if (response.ok) {
        const data = await response.json()
        setTransactions(data)
      }
    } catch (error) {
      console.error('Failed to fetch transactions:', error)
    } finally {
      setIsLoading(false)
    }
  }


  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'BUY':
      case 'DEPOSIT':
        return <ArrowDownIcon className="w-4 h-4 text-emerald-400" />
      case 'SELL':
      case 'WITHDRAWAL':
        return <ArrowUpIcon className="w-4 h-4 text-red-400" />
      default:
        return <ArrowDownIcon className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'text-emerald-400 bg-emerald-500/10'
      case 'PENDING':
        return 'text-yellow-400 bg-yellow-500/10'
      case 'FAILED':
        return 'text-red-400 bg-red-500/10'
      case 'CANCELLED':
        return 'text-gray-400 bg-gray-500/10'
      default:
        return 'text-gray-400 bg-gray-500/10'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'BUY':
      case 'DEPOSIT':
        return 'text-emerald-400'
      case 'SELL':
      case 'WITHDRAWAL':
        return 'text-red-400'
      default:
        return 'text-gray-400'
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentTransactions = filteredTransactions.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filters and Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/5 rounded-2xl p-6 backdrop-blur-sm ring-1 ring-white/10"
      >
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="flex flex-wrap gap-2">
            {['all', 'buy', 'sell', 'deposit', 'withdrawal'].map((filterType) => (
              <button
                key={filterType}
                onClick={() => setFilter(filterType)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                  filter === filterType
                    ? 'bg-blue-500 text-white'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                {filterType}
              </button>
            ))}
          </div>

          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
            />
          </div>
        </div>
      </motion.div>

      {/* Transaction List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white/5 rounded-2xl backdrop-blur-sm ring-1 ring-white/10 overflow-hidden"
      >
        <div className="p-6">
          <h2 className="text-xl font-semibold text-white mb-6">Transaction History</h2>
          
          {currentTransactions.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                {transactions.length === 0 ? 'No transactions found' : 'No transactions match your filters'}
              </div>
              {transactions.length === 0 && (
                <p className="text-sm text-gray-500">
                  Start trading to see your transaction history here
                </p>
              )}
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Type</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Asset</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Amount</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Price</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Total</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Fee</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Status</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentTransactions.map((transaction, index) => (
                      <motion.tr
                        key={transaction.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-b border-gray-700/50 hover:bg-white/5 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <div className={`flex items-center space-x-2 ${getTypeColor(transaction.type)}`}>
                            {getTransactionIcon(transaction.type)}
                            <span className="font-medium">{transaction.type}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-white font-medium">{transaction.symbol}</td>
                        <td className="py-3 px-4 text-white">{transaction.amount.toFixed(6)}</td>
                        <td className="py-3 px-4 text-white">{formatCurrency(transaction.price)}</td>
                        <td className="py-3 px-4 text-white font-medium">{formatCurrency(transaction.totalValue)}</td>
                        <td className="py-3 px-4 text-gray-400">{formatCurrency(transaction.fee)}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                            {transaction.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-400 text-sm">{formatDate(transaction.createdAt)}</td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-4">
                {currentTransactions.map((transaction, index) => (
                  <motion.div
                    key={transaction.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white/5 rounded-xl p-4 space-y-3"
                  >
                    <div className="flex justify-between items-start">
                      <div className={`flex items-center space-x-2 ${getTypeColor(transaction.type)}`}>
                        {getTransactionIcon(transaction.type)}
                        <span className="font-medium">{transaction.type}</span>
                        <span className="text-white font-medium">{transaction.symbol}</span>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                        {transaction.status}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-400">Amount:</span>
                        <span className="text-white ml-2">{transaction.amount.toFixed(6)}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Price:</span>
                        <span className="text-white ml-2">{formatCurrency(transaction.price)}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Total:</span>
                        <span className="text-white ml-2 font-medium">{formatCurrency(transaction.totalValue)}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Fee:</span>
                        <span className="text-white ml-2">{formatCurrency(transaction.fee)}</span>
                      </div>
                    </div>
                    
                    <div className="text-xs text-gray-400 border-t border-gray-700 pt-2">
                      {formatDate(transaction.createdAt)}
                    </div>
                  </motion.div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-700 flex justify-between items-center">
            <div className="text-sm text-gray-400">
              Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredTransactions.length)} of{' '}
              {filteredTransactions.length} results
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded bg-white/10 text-gray-300 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                Previous
              </button>
              
              <div className="flex space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = i + 1
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1 rounded text-sm ${
                        currentPage === page
                          ? 'bg-blue-500 text-white'
                          : 'bg-white/10 text-gray-300 hover:bg-white/20'
                      }`}
                    >
                      {page}
                    </button>
                  )
                })}
              </div>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded bg-white/10 text-gray-300 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}
