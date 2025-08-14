'use client'

import { useEffect, useRef } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
  ChartData
} from 'chart.js'
import { Line, Bar, Doughnut } from 'react-chartjs-2'
import { format, subDays, startOfDay } from 'date-fns'

// Chart wrapper component with proper cleanup
function ChartWrapper({ children, chartKey }: { children: React.ReactNode, chartKey: string }) {
  const chartRef = useRef<unknown>(null)
  
  useEffect(() => {
    return () => {
      // Cleanup chart instance on unmount
      if (chartRef.current) {
        try {
          chartRef.current.destroy()
        } catch (error) {
          console.warn('Chart cleanup error:', error)
        }
      }
    }
  }, [])
  
  return (
    <div key={chartKey}>
      {children}
    </div>
  )
}

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
)

interface PriceHistoryData {
  timestamp: string
  price: number
  volume?: number
}

interface PortfolioHistoryData {
  date: string
  totalValue: number
  totalPnL: number
  holdings: { symbol: string; value: number; pnl: number }[]
}

interface ChartComponentsProps {
  priceHistory?: PriceHistoryData[]
  portfolioHistory?: PortfolioHistoryData[]
  portfolioDistribution?: { name: string; value: number; percentage: number }[]
  currentPrices?: { [symbol: string]: number }
  timeRange: '24h' | '7d' | '30d'
  theme: 'dark' | 'light'
}

// Chart.js theme configurations
const getChartTheme = (theme: 'dark' | 'light') => ({
  backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
  textColor: theme === 'dark' ? '#F3F4F6' : '#374151',
  gridColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
  borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
})

// Price History Chart Component
export function PriceHistoryChart({
  priceHistory = [],
  symbol = 'BTC',
  timeRange,
  theme = 'dark'
}: {
  priceHistory: PriceHistoryData[]
  symbol: string
  timeRange: '24h' | '7d' | '30d'
  theme: 'dark' | 'light'
}) {
  const chartTheme = getChartTheme(theme)
  
  // Generate sample data if none provided
  const generateSampleData = () => {
    const days = timeRange === '24h' ? 1 : timeRange === '7d' ? 7 : 30
    const points = timeRange === '24h' ? 24 : days
    const basePrice = 45000 // Sample BTC price
    
    return Array.from({ length: points }, (_, i) => {
      const date = timeRange === '24h' 
        ? new Date(Date.now() - (points - 1 - i) * 60 * 60 * 1000)
        : subDays(new Date(), points - 1 - i)
        
      const variance = 0.05 // 5% variance
      const randomChange = (Math.random() - 0.5) * variance
      const price = basePrice * (1 + randomChange + Math.sin(i / points * Math.PI) * 0.1)
      
      return {
        timestamp: date.toISOString(),
        price: price,
        volume: Math.random() * 1000000
      }
    })
  }

  const data = priceHistory.length > 0 ? priceHistory : generateSampleData()
  
  const chartData: ChartData<'line'> = {
    labels: data.map(item => {
      const date = new Date(item.timestamp)
      return timeRange === '24h' 
        ? format(date, 'HH:mm')
        : format(date, 'MM/dd')
    }),
    datasets: [
      {
        label: `${symbol} Price`,
        data: data.map(item => item.price),
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointBackgroundColor: '#3B82F6',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
      }
    ]
  }

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: theme === 'dark' ? 'rgba(17, 24, 39, 0.9)' : 'rgba(255, 255, 255, 0.9)',
        titleColor: chartTheme.textColor,
        bodyColor: chartTheme.textColor,
        borderColor: chartTheme.borderColor,
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          title: (context) => {
            const date = new Date(data[context[0].dataIndex].timestamp)
            return timeRange === '24h' 
              ? format(date, 'MMM dd, HH:mm')
              : format(date, 'MMM dd, yyyy')
          },
          label: (context) => {
            return `Price: $${context.parsed.y.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}`
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: chartTheme.gridColor,
        },
        border: { display: false },
        ticks: {
          color: chartTheme.textColor,
          maxTicksLimit: 8,
        }
      },
      y: {
        grid: {
          color: chartTheme.gridColor,
        },
        border: { display: false },
        ticks: {
          color: chartTheme.textColor,
          callback: (value) => `$${Number(value).toLocaleString()}`
        }
      }
    }
  }

  const chartKey = `price-${symbol}-${timeRange}-${JSON.stringify(data.slice(0, 3))}`
  
  return (
    <ChartWrapper chartKey={chartKey}>
      <div className="h-64 w-full">
        <Line data={chartData} options={options} key={chartKey} />
      </div>
    </ChartWrapper>
  )
}

// Portfolio Timeline Chart Component
export function PortfolioTimelineChart({
  portfolioHistory = [],
  timeRange,
  theme = 'dark'
}: {
  portfolioHistory: PortfolioHistoryData[]
  timeRange: '24h' | '7d' | '30d'
  theme: 'dark' | 'light'
}) {
  const chartTheme = getChartTheme(theme)
  
  // Generate sample portfolio data if none provided
  const generateSampleData = () => {
    const days = timeRange === '24h' ? 1 : timeRange === '7d' ? 7 : 30
    const points = timeRange === '24h' ? 24 : days
    const baseValue = 50000 // Sample portfolio value
    
    return Array.from({ length: points }, (_, i) => {
      const date = timeRange === '24h' 
        ? new Date(Date.now() - (points - 1 - i) * 60 * 60 * 1000)
        : subDays(new Date(), points - 1 - i)
        
      const growthRate = 0.002 // 0.2% daily growth trend
      const variance = 0.03 // 3% daily variance
      const randomChange = (Math.random() - 0.5) * variance
      const trendGrowth = i * growthRate
      
      const totalValue = baseValue * (1 + trendGrowth + randomChange)
      const initialValue = baseValue * 0.9 // Assume 10% initial gain
      const totalPnL = totalValue - initialValue
      
      return {
        date: startOfDay(date).toISOString(),
        totalValue,
        totalPnL,
        holdings: []
      }
    })
  }

  const data = portfolioHistory.length > 0 ? portfolioHistory : generateSampleData()
  
  const chartData: ChartData<'line'> = {
    labels: data.map(item => {
      const date = new Date(item.date)
      return timeRange === '24h' 
        ? format(date, 'HH:mm')
        : format(date, 'MM/dd')
    }),
    datasets: [
      {
        label: 'Portfolio Value',
        data: data.map(item => item.totalValue),
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointBackgroundColor: '#10B981',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
      },
      {
        label: 'P&L',
        data: data.map(item => item.totalPnL),
        borderColor: '#F59E0B',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        borderWidth: 2,
        fill: false,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointBackgroundColor: '#F59E0B',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        yAxisID: 'y1',
      }
    ]
  }

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        labels: {
          color: chartTheme.textColor,
          usePointStyle: true,
          padding: 20,
        }
      },
      tooltip: {
        backgroundColor: theme === 'dark' ? 'rgba(17, 24, 39, 0.9)' : 'rgba(255, 255, 255, 0.9)',
        titleColor: chartTheme.textColor,
        bodyColor: chartTheme.textColor,
        borderColor: chartTheme.borderColor,
        borderWidth: 1,
        cornerRadius: 8,
        callbacks: {
          title: (context) => {
            const date = new Date(data[context[0].dataIndex].date)
            return timeRange === '24h' 
              ? format(date, 'MMM dd, HH:mm')
              : format(date, 'MMM dd, yyyy')
          },
          label: (context) => {
            const value = context.parsed.y
            if (context.datasetIndex === 0) {
              return `Portfolio: $${value.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}`
            } else {
              const sign = value >= 0 ? '+' : ''
              return `P&L: ${sign}$${value.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}`
            }
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: chartTheme.gridColor,
        },
        border: { display: false },
        ticks: {
          color: chartTheme.textColor,
          maxTicksLimit: 8,
        }
      },
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        grid: {
          color: chartTheme.gridColor,
        },
        border: { display: false },
        ticks: {
          color: chartTheme.textColor,
          callback: (value) => `$${Number(value).toLocaleString()}`
        }
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        grid: {
          drawOnChartArea: false,
        },
        ticks: {
          color: chartTheme.textColor,
          callback: (value) => {
            const sign = Number(value) >= 0 ? '+' : ''
            return `${sign}$${Number(value).toLocaleString()}`
          }
        }
      }
    }
  }

  const chartKey = `portfolio-timeline-${timeRange}-${data.length}-${Date.now()}`
  
  return (
    <ChartWrapper chartKey={chartKey}>
      <div className="h-80 w-full">
        <Line data={chartData} options={options} key={chartKey} />
      </div>
    </ChartWrapper>
  )
}

// Portfolio Distribution Doughnut Chart
export function PortfolioDistributionChart({
  portfolioDistribution = [],
  theme = 'dark'
}: {
  portfolioDistribution: { name: string; value: number; percentage: number }[]
  theme: 'dark' | 'light'
}) {
  const chartTheme = getChartTheme(theme)
  
  // Generate sample data if none provided
  const generateSampleData = () => [
    { name: 'BTC', value: 25000, percentage: 50 },
    { name: 'ETH', value: 15000, percentage: 30 },
    { name: 'ADA', value: 5000, percentage: 10 },
    { name: 'SOL', value: 3000, percentage: 6 },
    { name: 'Others', value: 2000, percentage: 4 }
  ]

  const data = portfolioDistribution.length > 0 ? portfolioDistribution : generateSampleData()
  
  const colors = [
    '#3B82F6', // Blue
    '#10B981', // Emerald  
    '#F59E0B', // Amber
    '#EF4444', // Red
    '#8B5CF6', // Violet
    '#06B6D4', // Cyan
    '#84CC16', // Lime
    '#F97316', // Orange
    '#EC4899', // Pink
    '#14B8A6', // Teal
  ]

  const chartData: ChartData<'doughnut'> = {
    labels: data.map(item => item.name),
    datasets: [
      {
        data: data.map(item => item.percentage),
        backgroundColor: colors.slice(0, data.length),
        borderColor: theme === 'dark' ? '#1F2937' : '#ffffff',
        borderWidth: 2,
        hoverBorderWidth: 3,
      }
    ]
  }

  const options: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '60%',
    plugins: {
      legend: {
        display: true,
        position: 'right' as const,
        labels: {
          color: chartTheme.textColor,
          usePointStyle: true,
          padding: 15,
          generateLabels: (chart) => {
            const original = ChartJS.overrides.doughnut.plugins.legend.labels.generateLabels
            const labels = original(chart)
            
            return labels.map((label, index) => ({
              ...label,
              text: `${data[index].name} (${data[index].percentage.toFixed(1)}%)`
            }))
          }
        }
      },
      tooltip: {
        backgroundColor: theme === 'dark' ? 'rgba(17, 24, 39, 0.9)' : 'rgba(255, 255, 255, 0.9)',
        titleColor: chartTheme.textColor,
        bodyColor: chartTheme.textColor,
        borderColor: chartTheme.borderColor,
        borderWidth: 1,
        cornerRadius: 8,
        callbacks: {
          label: (context) => {
            const item = data[context.dataIndex]
            return [
              `${item.name}: ${item.percentage.toFixed(1)}%`,
              `Value: $${item.value.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}`
            ]
          }
        }
      }
    }
  }

  const chartKey = `portfolio-distribution-${data.length}-${JSON.stringify(data.slice(0, 2))}`
  
  return (
    <ChartWrapper chartKey={chartKey}>
      <div className="h-64 w-full">
        <Doughnut data={chartData} options={options} key={chartKey} />
      </div>
    </ChartWrapper>
  )
}

// Volume Chart Component
export function VolumeChart({
  priceHistory = [],
  theme = 'dark'
}: {
  priceHistory: PriceHistoryData[]
  theme: 'dark' | 'light'
}) {
  const chartTheme = getChartTheme(theme)
  
  // Use the same sample data generation logic as PriceHistoryChart
  const generateSampleData = () => {
    return Array.from({ length: 24 }, (_, i) => {
      const date = new Date(Date.now() - (23 - i) * 60 * 60 * 1000)
      return {
        timestamp: date.toISOString(),
        price: 45000 + Math.random() * 5000,
        volume: Math.random() * 2000000 + 500000
      }
    })
  }

  const data = priceHistory.length > 0 ? priceHistory : generateSampleData()
  
  const chartData: ChartData<'bar'> = {
    labels: data.map(item => {
      const date = new Date(item.timestamp)
      return format(date, 'HH:mm')
    }),
    datasets: [
      {
        label: 'Volume',
        data: data.map(item => item.volume || 0),
        backgroundColor: 'rgba(139, 92, 246, 0.6)',
        borderColor: '#8B5CF6',
        borderWidth: 1,
        borderRadius: 2,
      }
    ]
  }

  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: theme === 'dark' ? 'rgba(17, 24, 39, 0.9)' : 'rgba(255, 255, 255, 0.9)',
        titleColor: chartTheme.textColor,
        bodyColor: chartTheme.textColor,
        borderColor: chartTheme.borderColor,
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          title: (context) => {
            const date = new Date(data[context[0].dataIndex].timestamp)
            return format(date, 'MMM dd, HH:mm')
          },
          label: (context) => {
            const volume = context.parsed.y
            return `Volume: ${(volume / 1000000).toFixed(2)}M`
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: chartTheme.gridColor,
        },
        border: { display: false },
        ticks: {
          color: chartTheme.textColor,
          maxTicksLimit: 8,
        }
      },
      y: {
        grid: {
          color: chartTheme.gridColor,
        },
        border: { display: false },
        ticks: {
          color: chartTheme.textColor,
          callback: (value) => `${(Number(value) / 1000000).toFixed(1)}M`
        }
      }
    }
  }

  const chartKey = `volume-${data.length}-${JSON.stringify(data.slice(0, 2))}`
  
  return (
    <ChartWrapper chartKey={chartKey}>
      <div className="h-32 w-full">
        <Bar data={chartData} options={options} key={chartKey} />
      </div>
    </ChartWrapper>
  )
}
