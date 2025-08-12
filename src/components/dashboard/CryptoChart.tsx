'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Line, Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

interface ChartData {
  prices: [number, number][]
  market_caps: [number, number][]
  total_volumes: [number, number][]
}

export default function CryptoChart() {
  const [selectedCrypto, setSelectedCrypto] = useState('bitcoin')
  const [timeframe, setTimeframe] = useState('7')
  const [chartType, setChartType] = useState('price')
  const [chartData, setChartData] = useState<ChartData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const cryptoOptions = [
    { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC' },
    { id: 'ethereum', name: 'Ethereum', symbol: 'ETH' },
    { id: 'binancecoin', name: 'Binance Coin', symbol: 'BNB' },
    { id: 'cardano', name: 'Cardano', symbol: 'ADA' }
  ]

  const timeframeOptions = [
    { value: '1', label: '1D' },
    { value: '7', label: '7D' },
    { value: '30', label: '30D' },
    { value: '365', label: '1Y' }
  ]

  useEffect(() => {
    fetchChartData()
  }, [selectedCrypto, timeframe])

  const fetchChartData = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/${selectedCrypto}/market_chart?vs_currency=usd&days=${timeframe}`
      )
      if (response.ok) {
        const data = await response.json()
        setChartData(data)
      }
    } catch (error) {
      console.error('Failed to fetch chart data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatChartData = () => {
    if (!chartData) return null

    let dataPoints, label, borderColor, backgroundColor

    switch (chartType) {
      case 'price':
        dataPoints = chartData.prices
        label = 'Price (USD)'
        borderColor = 'rgb(59, 130, 246)'
        backgroundColor = 'rgba(59, 130, 246, 0.1)'
        break
      case 'volume':
        dataPoints = chartData.total_volumes
        label = 'Volume (USD)'
        borderColor = 'rgb(16, 185, 129)'
        backgroundColor = 'rgba(16, 185, 129, 0.1)'
        break
      case 'marketcap':
        dataPoints = chartData.market_caps
        label = 'Market Cap (USD)'
        borderColor = 'rgb(139, 92, 246)'
        backgroundColor = 'rgba(139, 92, 246, 0.1)'
        break
      default:
        dataPoints = chartData.prices
        label = 'Price (USD)'
        borderColor = 'rgb(59, 130, 246)'
        backgroundColor = 'rgba(59, 130, 246, 0.1)'
    }

    const labels = dataPoints.map(([timestamp]) => {
      const date = new Date(timestamp)
      return timeframe === '1' 
        ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : date.toLocaleDateString([], { month: 'short', day: 'numeric' })
    })

    return {
      labels,
      datasets: [
        {
          label,
          data: dataPoints.map(([, value]) => value),
          borderColor,
          backgroundColor,
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 6,
          borderWidth: 2,
        },
      ],
    }
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        callbacks: {
          label: (context: any) => {
            const value = context.parsed.y
            return `${context.dataset.label || 'Value'}: $${value.toLocaleString()}`
          }
        }
      },
    },
    scales: {
      x: {
        display: true,
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
          drawBorder: false,
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)',
          maxTicksLimit: 8,
        },
      },
      y: {
        display: true,
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
          drawBorder: false,
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)',
          callback: function(value: string | number) {
            return '$' + value.toLocaleString()
          }
        },
      },
    },
  }

  const formattedData = formatChartData()

  return (
    <div className="space-y-6">
      {/* Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/5 rounded-2xl p-6 backdrop-blur-sm ring-1 ring-white/10"
      >
        <div className="flex flex-wrap gap-4 justify-between items-center">
          {/* Cryptocurrency Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Cryptocurrency
            </label>
            <select
              value={selectedCrypto}
              onChange={(e) => setSelectedCrypto(e.target.value)}
              className="bg-white/10 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {cryptoOptions.map((crypto) => (
                <option key={crypto.id} value={crypto.id} className="bg-gray-800">
                  {crypto.name} ({crypto.symbol})
                </option>
              ))}
            </select>
          </div>

          {/* Timeframe Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Timeframe
            </label>
            <div className="flex space-x-2">
              {timeframeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setTimeframe(option.value)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    timeframe === option.value
                      ? 'bg-blue-500 text-white'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Chart Type Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Chart Type
            </label>
            <div className="flex space-x-2">
              {[
                { value: 'price', label: 'Price' },
                { value: 'volume', label: 'Volume' },
                { value: 'marketcap', label: 'Market Cap' }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setChartType(option.value)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    chartType === option.value
                      ? 'bg-emerald-500 text-white'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white/5 rounded-2xl p-6 backdrop-blur-sm ring-1 ring-white/10"
      >
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-white">
            {cryptoOptions.find(c => c.id === selectedCrypto)?.name} {
              chartType === 'price' ? 'Price Chart' :
              chartType === 'volume' ? 'Volume Chart' : 'Market Cap Chart'
            }
          </h2>
        </div>
        
        <div className="h-96">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : formattedData ? (
            <Line data={formattedData} options={chartOptions} />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              Failed to load chart data
            </div>
          )}
        </div>
      </motion.div>

      {/* Market Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {[
          {
            title: 'Current Price',
            value: chartData ? `$${chartData.prices[chartData.prices.length - 1][1].toLocaleString()}` : '--',
            color: 'text-blue-400'
          },
          {
            title: 'Market Cap',
            value: chartData ? `$${(chartData.market_caps[chartData.market_caps.length - 1][1] / 1e9).toFixed(2)}B` : '--',
            color: 'text-purple-400'
          },
          {
            title: '24h Volume',
            value: chartData ? `$${(chartData.total_volumes[chartData.total_volumes.length - 1][1] / 1e6).toFixed(2)}M` : '--',
            color: 'text-emerald-400'
          },
          {
            title: 'Price Change',
            value: chartData ? 
              `${((chartData.prices[chartData.prices.length - 1][1] - chartData.prices[0][1]) / chartData.prices[0][1] * 100).toFixed(2)}%` 
              : '--',
            color: 'text-yellow-400'
          }
        ].map((stat, index) => (
          <div
            key={stat.title}
            className="bg-white/5 rounded-xl p-4 backdrop-blur-sm ring-1 ring-white/10"
          >
            <div className="text-gray-400 text-sm">{stat.title}</div>
            <div className={`text-xl font-bold ${stat.color}`}>{stat.value}</div>
          </div>
        ))}
      </motion.div>
    </div>
  )
}
