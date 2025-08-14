'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { GlobalNavigation } from '@/components/GlobalNavigation'
import { 
  UserIcon, 
  EnvelopeIcon, 
  CalendarDaysIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  TrophyIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  MapPinIcon,
  ClockIcon,
  PhoneIcon
} from '@heroicons/react/24/outline'
import { UserProfile } from '@/types/user-preferences'
import { useNotify } from '@/components/notifications'

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const notify = useNotify()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<'name' | 'bio' | 'location' | 'timezone' | 'phone', string>>>({})
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    location: '',
    timezone: '',
    phone: ''
  })

  const loadProfile = useCallback(async () => {
    try {
      const response = await fetch('/api/profile')
      if (response.ok) {
        const data = await response.json()
        setProfile(data.profile)
        setFormData({
          name: data.profile.name || '',
          bio: data.profile.bio || '',
          location: data.profile.location || '',
          timezone: data.profile.timezone || '',
          phone: data.profile.phone || ''
        })
      } else {
        notify.error('Failed to Load Profile', 'Unable to load your profile information. Please refresh the page.')
      }
    } catch (error) {
      console.error('Failed to load profile:', error)
      notify.error('Network Error', 'Unable to connect to server. Please check your internet connection.')
    }
  }, [notify])

  // Load profile data
  useEffect(() => {
    if (session?.user) {
      loadProfile()
    }
  }, [loadProfile, session])

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/auth/signin')
    }
  }, [session, status, router])


  const handleSave = async () => {
    setIsLoading(true)
    setErrors({})

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (response.ok) {
        setProfile(data.profile)
        setIsEditing(false)
        notify.success('Profile Updated', 'Your profile has been successfully updated.')
      } else {
        setErrors(data.errors || {})
        // Show individual field errors as notifications
        if (data.errors) {
          const errorMessages = Object.entries(data.errors)
            .map(([field, message]) => `${field}: ${message}`)
            .join(', ')
          notify.error('Validation Error', errorMessages)
        } else {
          notify.error('Update Failed', 'Unable to update your profile. Please try again.')
        }
      }
    } catch (error) {
      console.error('Failed to update profile:', error)
      notify.error('Network Error', 'Unable to connect to server. Please check your internet connection.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        bio: profile.bio || '',
        location: profile.location || '',
        timezone: profile.timezone || '',
        phone: profile.phone || ''
      })
    }
    setIsEditing(false)
    setErrors({})
  }

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <>
      <GlobalNavigation />
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold text-white">Your Profile</h1>
            <p className="text-gray-400 mt-2">
              Manage your account information and preferences
            </p>
          </motion.div>


          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-1"
            >
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                <div className="text-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-white">
                      {(profile?.name || session.user?.name)?.[0]?.toUpperCase() || session.user?.email?.[0]?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-white">
                    {profile?.name || session.user?.name || 'User'}
                  </h2>
                  <p className="text-gray-400">{profile?.email || session.user?.email}</p>
                  {profile?.bio && (
                    <p className="text-gray-300 text-sm mt-2 italic">&ldquo;{profile.bio}&rdquo;</p>
                  )}
                  <div className="mt-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
                      ✅ Verified Account
                    </span>
                  </div>
                  {profile?.location && (
                    <div className="flex items-center justify-center mt-2 text-gray-400 text-sm">
                      <MapPinIcon className="w-4 h-4 mr-1" />
                      {profile.location}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Account Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-2"
            >
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-white">Profile Information</h3>
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center space-x-2 px-3 py-2 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white rounded-lg transition-colors"
                    >
                      <PencilIcon className="w-4 h-4" />
                      <span>Edit</span>
                    </button>
                  ) : (
                    <div className="flex space-x-2">
                      <button
                        onClick={handleSave}
                        disabled={isLoading}
                        className="flex items-center space-x-2 px-3 py-2 bg-green-500 hover:bg-green-600 disabled:bg-green-500/50 text-white rounded-lg transition-colors"
                      >
                        {isLoading ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                        ) : (
                          <CheckIcon className="w-4 h-4" />
                        )}
                        <span>Save</span>
                      </button>
                      <button
                        onClick={handleCancel}
                        disabled={isLoading}
                        className="flex items-center space-x-2 px-3 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-600/50 text-white rounded-lg transition-colors"
                      >
                        <XMarkIcon className="w-4 h-4" />
                        <span>Cancel</span>
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Name Field */}
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        <UserIcon className="w-4 h-4 inline mr-2" />
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={isEditing ? formData.name : (profile?.name || session.user?.name || '')}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className={`w-full px-3 py-2 bg-white/5 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          isEditing ? 'border-white/20' : 'border-white/10'
                        } ${errors.name ? 'border-red-500 ring-red-500' : ''}`}
                        placeholder="Enter your full name"
                        readOnly={!isEditing}
                      />
                      {errors.name && (
                        <p className="text-red-400 text-sm mt-1">{errors.name}</p>
                      )}
                    </div>

                    {/* Email Field (Read-only) */}
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        <EnvelopeIcon className="w-4 h-4 inline mr-2" />
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={profile?.email || session.user?.email || ''}
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none"
                        readOnly
                      />
                      <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                    </div>
                  </div>

                  {/* Bio Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Bio
                    </label>
                    <textarea
                      value={isEditing ? formData.bio : (profile?.bio || '')}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      rows={3}
                      className={`w-full px-3 py-2 bg-white/5 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
                        isEditing ? 'border-white/20' : 'border-white/10'
                      } ${errors.bio ? 'border-red-500 ring-red-500' : ''}`}
                      placeholder="Tell us about yourself..."
                      readOnly={!isEditing}
                    />
                    {errors.bio && (
                      <p className="text-red-400 text-sm mt-1">{errors.bio}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">{formData.bio.length}/500 characters</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Location Field */}
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        <MapPinIcon className="w-4 h-4 inline mr-2" />
                        Location
                      </label>
                      <input
                        type="text"
                        value={isEditing ? formData.location : (profile?.location || '')}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        className={`w-full px-3 py-2 bg-white/5 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          isEditing ? 'border-white/20' : 'border-white/10'
                        }`}
                        placeholder="City, Country"
                        readOnly={!isEditing}
                      />
                    </div>

                    {/* Phone Field */}
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        <PhoneIcon className="w-4 h-4 inline mr-2" />
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={isEditing ? formData.phone : (profile?.phone || '')}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className={`w-full px-3 py-2 bg-white/5 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          isEditing ? 'border-white/20' : 'border-white/10'
                        } ${errors.phone ? 'border-red-500 ring-red-500' : ''}`}
                        placeholder="+1 (555) 123-4567"
                        readOnly={!isEditing}
                      />
                      {errors.phone && (
                        <p className="text-red-400 text-sm mt-1">{errors.phone}</p>
                      )}
                    </div>
                  </div>

                  {/* Timezone Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      <ClockIcon className="w-4 h-4 inline mr-2" />
                      Timezone
                    </label>
                    <select
                      value={isEditing ? formData.timezone : (profile?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone)}
                      onChange={(e) => handleInputChange('timezone', e.target.value)}
                      className={`w-full px-3 py-2 bg-white/5 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        isEditing ? 'border-white/20' : 'border-white/10'
                      }`}
                      disabled={!isEditing}
                    >
                      <option value="America/New_York">Eastern Time (EST/EDT)</option>
                      <option value="America/Chicago">Central Time (CST/CDT)</option>
                      <option value="America/Denver">Mountain Time (MST/MDT)</option>
                      <option value="America/Los_Angeles">Pacific Time (PST/PDT)</option>
                      <option value="UTC">UTC</option>
                      <option value="Europe/London">London (GMT/BST)</option>
                      <option value="Europe/Paris">Paris (CET/CEST)</option>
                      <option value="Asia/Tokyo">Tokyo (JST)</option>
                      <option value="Asia/Shanghai">Shanghai (CST)</option>
                      <option value="Australia/Sydney">Sydney (AEST/AEDT)</option>
                    </select>
                  </div>

                  {/* Member Since (Read-only) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      <CalendarDaysIcon className="w-4 h-4 inline mr-2" />
                      Member Since
                    </label>
                    <input
                      type="text"
                      value={profile?.memberSince ? new Date(profile.memberSince).toLocaleDateString() : new Date().toLocaleDateString()}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none"
                      readOnly
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <div className="flex items-center">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <ChartBarIcon className="w-6 h-6 text-blue-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-400">Total Trades</p>
                  <p className="text-2xl font-bold text-white">127</p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <div className="flex items-center">
                <div className="p-2 bg-emerald-500/20 rounded-lg">
                  <CurrencyDollarIcon className="w-6 h-6 text-emerald-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-400">Portfolio Value</p>
                  <p className="text-2xl font-bold text-white">$12,847</p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-500/20 rounded-lg">
                  <TrophyIcon className="w-6 h-6 text-yellow-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-400">Success Rate</p>
                  <p className="text-2xl font-bold text-white">78%</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Coming Soon Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8"
          >
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4">🚀 Coming Soon</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3 text-gray-400">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Two-Factor Authentication (2FA)</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-400">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  <span>API Key Management</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-400">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>Trading Performance Analytics</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-400">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span>Tax Report Generation</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  )
}
