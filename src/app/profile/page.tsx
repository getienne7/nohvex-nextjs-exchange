'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
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
  PhoneIcon,
  CameraIcon,
  ShieldCheckIcon,
  BellIcon,
  CogIcon,
  GlobeAltIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline'
import { UserProfile, NotificationPreferences, PrivacySettings, TradingPreferences } from '@/types/user-preferences'
import { useNotify } from '@/components/notifications'

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const notify = useNotify()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'security'>('profile')
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({})
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    location: '',
    timezone: '',
    phone: ''
  })
  const [preferences, setPreferences] = useState<{
    notifications: NotificationPreferences
    privacy: PrivacySettings
    trading: TradingPreferences
  } | null>(null)

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

  const loadPreferences = useCallback(async () => {
    try {
      const response = await fetch('/api/preferences')
      if (response.ok) {
        const data = await response.json()
        setPreferences(data.preferences)
      }
    } catch (error) {
      console.error('Failed to load preferences:', error)
    }
  }, [])

  // Enhanced form validation
  const validateForm = () => {
    const newErrors: Partial<Record<string, string>> = {}
    
    if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters long'
    }
    
    if (formData.name.trim().length > 50) {
      newErrors.name = 'Name must be less than 50 characters'
    }
    
    if (formData.bio.length > 500) {
      newErrors.bio = 'Bio must be less than 500 characters'
    }
    
    if (formData.phone && !/^[\+]?[1-9][\d]{0,15}$/.test(formData.phone.replace(/[\s\-\(\)]/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number'
    }
    
    if (formData.location.length > 100) {
      newErrors.location = 'Location must be less than 100 characters'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Avatar upload handler
  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        notify.error('File Too Large', 'Avatar image must be less than 5MB')
        return
      }
      
      if (!file.type.startsWith('image/')) {
        notify.error('Invalid File Type', 'Please select an image file')
        return
      }
      
      const reader = new FileReader()
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // Load profile data
  useEffect(() => {
    if (session?.user) {
      loadProfile()
      loadPreferences()
    }
  }, [loadProfile, loadPreferences, session])

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/auth/signin')
    }
  }, [session, status, router])


  const handleSave = async () => {
    if (!validateForm()) {
      notify.error('Validation Error', 'Please correct the errors before saving')
      return
    }

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
        setAvatarPreview(null) // Reset avatar preview after save
        notify.success('Profile Updated', 'Your profile has been successfully updated.')
      } else {
        setErrors(data.errors || {})
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
    setAvatarPreview(null) // Reset avatar preview
  }

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error for this field when user starts typing
    if (errors[field]) {
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
              Manage your account information, preferences, and security settings
            </p>
          </motion.div>

          {/* Tab Navigation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <div className="border-b border-white/10">
              <nav className="flex space-x-8">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'profile'
                      ? 'border-blue-500 text-blue-400'
                      : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                  }`}
                >
                  <UserIcon className="w-4 h-4 inline mr-2" />
                  Profile Information
                </button>
                <button
                  onClick={() => setActiveTab('preferences')}
                  className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'preferences'
                      ? 'border-blue-500 text-blue-400'
                      : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                  }`}
                >
                  <CogIcon className="w-4 h-4 inline mr-2" />
                  Preferences
                </button>
                <button
                  onClick={() => setActiveTab('security')}
                  className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'security'
                      ? 'border-blue-500 text-blue-400'
                      : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                  }`}
                >
                  <ShieldCheckIcon className="w-4 h-4 inline mr-2" />
                  Security
                </button>
              </nav>
            </div>
          </motion.div>


          <AnimatePresence mode="wait">
            {activeTab === 'profile' && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Enhanced Profile Card */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="lg:col-span-1"
                  >
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                      <div className="text-center">
                        {/* Avatar with Upload */}
                        <div className="relative inline-block mb-4">
                          <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-full flex items-center justify-center overflow-hidden">
                            {avatarPreview || profile?.avatar ? (
                              <img 
                                src={avatarPreview || profile?.avatar} 
                                alt="Profile" 
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-2xl font-bold text-white">
                                {(profile?.name || session.user?.name)?.[0]?.toUpperCase() || session.user?.email?.[0]?.toUpperCase() || 'U'}
                              </span>
                            )}
                          </div>
                          {isEditing && (
                            <>
                              <label className="absolute -bottom-1 -right-1 bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full cursor-pointer transition-colors">
                                <CameraIcon className="w-4 h-4" />
                                <input 
                                  type="file" 
                                  accept="image/*" 
                                  onChange={handleAvatarUpload}
                                  className="hidden"
                                />
                              </label>
                            </>
                          )}
                        </div>
                        
                        <h2 className="text-xl font-bold text-white">
                          {profile?.name || session.user?.name || 'User'}
                        </h2>
                        <p className="text-gray-400">{profile?.email || session.user?.email}</p>
                        {profile?.bio && (
                          <p className="text-gray-300 text-sm mt-2 italic">&ldquo;{profile.bio}&rdquo;</p>
                        )}
                        
                        <div className="mt-4 space-y-2">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
                            ✅ Verified Account
                          </span>
                          {profile?.location && (
                            <div className="flex items-center justify-center text-gray-400 text-sm">
                              <MapPinIcon className="w-4 h-4 mr-1" />
                              {profile.location}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Enhanced Account Information */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="lg:col-span-2"
                  >
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-white">Profile Information</h3>
                        <div className="flex items-center space-x-2">
                          {!isEditing ? (
                            <>
                              <button
                                onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
                                className="flex items-center space-x-2 px-3 py-2 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white rounded-lg transition-colors"
                              >
                                <CogIcon className="w-4 h-4" />
                                <span>Advanced</span>
                              </button>
                              <button
                                onClick={() => setIsEditing(true)}
                                className="flex items-center space-x-2 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                              >
                                <PencilIcon className="w-4 h-4" />
                                <span>Edit</span>
                              </button>
                            </>
                          ) : (
                            <div className="flex space-x-2">
                              <button
                                onClick={handleSave}
                                disabled={isLoading}
                                className="flex items-center space-x-2 px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-green-500/50 text-white rounded-lg transition-colors"
                              >
                                {isLoading ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                                ) : (
                                  <CheckIcon className="w-4 h-4" />
                                )}
                                <span>{isLoading ? 'Saving...' : 'Save'}</span>
                              </button>
                              <button
                                onClick={handleCancel}
                                disabled={isLoading}
                                className="flex items-center space-x-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-600/50 text-white rounded-lg transition-colors"
                              >
                                <XMarkIcon className="w-4 h-4" />
                                <span>Cancel</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Enhanced Name Field */}
                          <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">
                              <UserIcon className="w-4 h-4 inline mr-2" />
                              Full Name
                              <span className="text-red-400 ml-1">*</span>
                            </label>
                            <input
                              type="text"
                              value={isEditing ? formData.name : (profile?.name || session.user?.name || '')}
                              onChange={(e) => handleInputChange('name', e.target.value)}
                              className={`w-full px-3 py-2 bg-white/5 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${
                                isEditing ? 'border-white/20 focus:ring-blue-500' : 'border-white/10'
                              } ${
                                errors.name ? 'border-red-500 ring-2 ring-red-500/20' : ''
                              }`}
                              placeholder="Enter your full name"
                              readOnly={!isEditing}
                              maxLength={50}
                            />
                            <div className="flex justify-between items-center mt-1">
                              {errors.name ? (
                                <p className="text-red-400 text-sm">{errors.name}</p>
                              ) : (
                                <p className="text-xs text-gray-500">Required field</p>
                              )}
                              {isEditing && (
                                <p className="text-xs text-gray-500">{formData.name.length}/50</p>
                              )}
                            </div>
                          </div>

                          {/* Enhanced Email Field (Read-only) */}
                          <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">
                              <EnvelopeIcon className="w-4 h-4 inline mr-2" />
                              Email Address
                              <span className="inline-flex items-center ml-2 px-2 py-0.5 rounded text-xs bg-green-500/20 text-green-400">Verified</span>
                            </label>
                            <input
                              type="email"
                              value={profile?.email || session.user?.email || ''}
                              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none"
                              readOnly
                            />
                            <p className="text-xs text-gray-500 mt-1">Email cannot be changed for security reasons</p>
                          </div>
                        </div>

                        {/* Enhanced Bio Field */}
                        <div>
                          <label className="block text-sm font-medium text-gray-400 mb-2">
                            <span className="inline-flex items-center">
                              Bio
                              <span className="ml-2 text-xs text-gray-500">(Optional)</span>
                            </span>
                          </label>
                          <textarea
                            value={isEditing ? formData.bio : (profile?.bio || '')}
                            onChange={(e) => handleInputChange('bio', e.target.value)}
                            rows={3}
                            className={`w-full px-3 py-2 bg-white/5 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 resize-none transition-all ${
                              isEditing ? 'border-white/20 focus:ring-blue-500' : 'border-white/10'
                            } ${
                              errors.bio ? 'border-red-500 ring-2 ring-red-500/20' : ''
                            }`}
                            placeholder="Tell us about yourself... (e.g., Trading experience, investment goals, interests)"
                            readOnly={!isEditing}
                            maxLength={500}
                          />
                          <div className="flex justify-between items-center mt-1">
                            {errors.bio ? (
                              <p className="text-red-400 text-sm">{errors.bio}</p>
                            ) : (
                              <p className="text-xs text-gray-500">Share your trading experience or investment philosophy</p>
                            )}
                            {isEditing && (
                              <p className={`text-xs ${
                                formData.bio.length > 450 ? 'text-yellow-400' : 
                                formData.bio.length > 480 ? 'text-red-400' : 'text-gray-500'
                              }`}>
                                {formData.bio.length}/500
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Enhanced Location Field */}
                          <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">
                              <MapPinIcon className="w-4 h-4 inline mr-2" />
                              Location
                              <span className="ml-2 text-xs text-gray-500">(Optional)</span>
                            </label>
                            <input
                              type="text"
                              value={isEditing ? formData.location : (profile?.location || '')}
                              onChange={(e) => handleInputChange('location', e.target.value)}
                              className={`w-full px-3 py-2 bg-white/5 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${
                                isEditing ? 'border-white/20 focus:ring-blue-500' : 'border-white/10'
                              } ${
                                errors.location ? 'border-red-500 ring-2 ring-red-500/20' : ''
                              }`}
                              placeholder="e.g., New York, USA"
                              readOnly={!isEditing}
                              maxLength={100}
                            />
                            <div className="flex justify-between items-center mt-1">
                              {errors.location ? (
                                <p className="text-red-400 text-sm">{errors.location}</p>
                              ) : (
                                <p className="text-xs text-gray-500">Your general location (city, country)</p>
                              )}
                              {isEditing && (
                                <p className="text-xs text-gray-500">{formData.location.length}/100</p>
                              )}
                            </div>
                          </div>

                          {/* Enhanced Phone Field */}
                          <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">
                              <PhoneIcon className="w-4 h-4 inline mr-2" />
                              Phone Number
                              <span className="ml-2 text-xs text-gray-500">(Optional)</span>
                            </label>
                            <input
                              type="tel"
                              value={isEditing ? formData.phone : (profile?.phone || '')}
                              onChange={(e) => handleInputChange('phone', e.target.value)}
                              className={`w-full px-3 py-2 bg-white/5 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${
                                isEditing ? 'border-white/20 focus:ring-blue-500' : 'border-white/10'
                              } ${
                                errors.phone ? 'border-red-500 ring-2 ring-red-500/20' : ''
                              }`}
                              placeholder="+1 (555) 123-4567"
                              readOnly={!isEditing}
                            />
                            <div className="flex justify-between items-center mt-1">
                              {errors.phone ? (
                                <p className="text-red-400 text-sm">{errors.phone}</p>
                              ) : (
                                <p className="text-xs text-gray-500">For account recovery and security</p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Enhanced Timezone Field */}
                        <div>
                          <label className="block text-sm font-medium text-gray-400 mb-2">
                            <ClockIcon className="w-4 h-4 inline mr-2" />
                            Timezone
                            <span className="ml-2 text-xs text-gray-500">(Auto-detected: {Intl.DateTimeFormat().resolvedOptions().timeZone})</span>
                          </label>
                          <select
                            value={isEditing ? formData.timezone : (profile?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone)}
                            onChange={(e) => handleInputChange('timezone', e.target.value)}
                            className={`w-full px-3 py-2 bg-white/5 border rounded-lg text-white focus:outline-none focus:ring-2 transition-all ${
                              isEditing ? 'border-white/20 focus:ring-blue-500' : 'border-white/10'
                            }`}
                            disabled={!isEditing}
                          >
                            <optgroup label="Americas">
                              <option value="America/New_York">Eastern Time (EST/EDT)</option>
                              <option value="America/Chicago">Central Time (CST/CDT)</option>
                              <option value="America/Denver">Mountain Time (MST/MDT)</option>
                              <option value="America/Los_Angeles">Pacific Time (PST/PDT)</option>
                              <option value="America/Toronto">Toronto (EST/EDT)</option>
                            </optgroup>
                            <optgroup label="Europe & Africa">
                              <option value="UTC">UTC (Coordinated Universal Time)</option>
                              <option value="Europe/London">London (GMT/BST)</option>
                              <option value="Europe/Paris">Paris (CET/CEST)</option>
                              <option value="Europe/Berlin">Berlin (CET/CEST)</option>
                              <option value="Europe/Zurich">Zurich (CET/CEST)</option>
                            </optgroup>
                            <optgroup label="Asia & Pacific">
                              <option value="Asia/Tokyo">Tokyo (JST)</option>
                              <option value="Asia/Shanghai">Shanghai (CST)</option>
                              <option value="Asia/Hong_Kong">Hong Kong (HKT)</option>
                              <option value="Asia/Singapore">Singapore (SGT)</option>
                              <option value="Australia/Sydney">Sydney (AEST/AEDT)</option>
                            </optgroup>
                          </select>
                          <p className="text-xs text-gray-500 mt-1">Used for displaying dates and times in your local timezone</p>
                        </div>

                        {/* Advanced Settings Section */}
                        <AnimatePresence>
                          {showAdvancedSettings && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.3 }}
                              className="border-t border-white/10 pt-6"
                            >
                              <h4 className="text-md font-semibold text-white mb-4 flex items-center">
                                <CogIcon className="w-5 h-5 mr-2" />
                                Advanced Settings
                              </h4>
                              
                              <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="bg-white/5 rounded-lg p-4">
                                    <h5 className="text-sm font-medium text-white mb-2">Display Preferences</h5>
                                    <div className="space-y-2">
                                      <label className="flex items-center space-x-2 text-sm text-gray-300">
                                        <input type="checkbox" className="rounded" defaultChecked />
                                        <span>Show portfolio value on dashboard</span>
                                      </label>
                                      <label className="flex items-center space-x-2 text-sm text-gray-300">
                                        <input type="checkbox" className="rounded" />
                                        <span>Enable advanced trading view</span>
                                      </label>
                                    </div>
                                  </div>
                                  
                                  <div className="bg-white/5 rounded-lg p-4">
                                    <h5 className="text-sm font-medium text-white mb-2">Data & Analytics</h5>
                                    <div className="space-y-2">
                                      <label className="flex items-center space-x-2 text-sm text-gray-300">
                                        <input type="checkbox" className="rounded" defaultChecked />
                                        <span>Share anonymous usage data</span>
                                      </label>
                                      <label className="flex items-center space-x-2 text-sm text-gray-300">
                                        <input type="checkbox" className="rounded" defaultChecked />
                                        <span>Receive market insights</span>
                                      </label>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Member Since (Read-only) */}
                        <div>
                          <label className="block text-sm font-medium text-gray-400 mb-2">
                            <CalendarDaysIcon className="w-4 h-4 inline mr-2" />
                            Member Since
                          </label>
                          <input
                            type="text"
                            value={profile?.memberSince ? new Date(profile.memberSince).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            }) : new Date().toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none"
                            readOnly
                          />
                          <p className="text-xs text-gray-500 mt-1">Your account creation date</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            )}

            {activeTab === 'preferences' && (
              <motion.div
                key="preferences"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                {/* Notification Preferences */}
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <BellIcon className="w-5 h-5 mr-2" />
                    Notification Preferences
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-white font-medium">Email Notifications</h4>
                          <p className="text-gray-400 text-sm">Receive updates via email</p>
                        </div>
                        <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-500 transition-colors">
                          <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-white font-medium">Price Alerts</h4>
                          <p className="text-gray-400 text-sm">Get notified of price changes</p>
                        </div>
                        <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-500 transition-colors">
                          <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
                        </button>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-white font-medium">Trade Confirmations</h4>
                          <p className="text-gray-400 text-sm">Confirm trades before execution</p>
                        </div>
                        <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-500 transition-colors">
                          <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-white font-medium">Weekly Reports</h4>
                          <p className="text-gray-400 text-sm">Receive portfolio summaries</p>
                        </div>
                        <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-600 transition-colors">
                          <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Privacy Settings */}
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <EyeIcon className="w-5 h-5 mr-2" />
                    Privacy Settings
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-white font-medium">Public Profile</h4>
                        <p className="text-gray-400 text-sm">Allow others to see your profile</p>
                      </div>
                      <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-500 transition-colors">
                        <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-white font-medium">Portfolio Visibility</h4>
                        <p className="text-gray-400 text-sm">Show portfolio performance publicly</p>
                      </div>
                      <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-600 transition-colors">
                        <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Trading Preferences */}
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <CurrencyDollarIcon className="w-5 h-5 mr-2" />
                    Trading Preferences
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Default Currency</label>
                      <select className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="USD">USD - US Dollar</option>
                        <option value="EUR">EUR - Euro</option>
                        <option value="GBP">GBP - British Pound</option>
                        <option value="JPY">JPY - Japanese Yen</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Risk Level</label>
                      <select className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="conservative">Conservative</option>
                        <option value="moderate">Moderate</option>
                        <option value="aggressive">Aggressive</option>
                      </select>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'security' && (
              <motion.div
                key="security"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                {/* Security Overview */}
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <ShieldCheckIcon className="w-5 h-5 mr-2" />
                    Security Overview
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-green-400 font-medium">Email Verified</p>
                          <p className="text-green-300 text-sm">✓ Verified</p>
                        </div>
                        <CheckIcon className="w-6 h-6 text-green-400" />
                      </div>
                    </div>
                    <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-yellow-400 font-medium">2FA Setup</p>
                          <p className="text-yellow-300 text-sm">Recommended</p>
                        </div>
                        <CogIcon className="w-6 h-6 text-yellow-400" />
                      </div>
                    </div>
                    <div className="bg-gray-500/10 border border-gray-500/20 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-400 font-medium">Phone Verification</p>
                          <p className="text-gray-300 text-sm">Optional</p>
                        </div>
                        <PhoneIcon className="w-6 h-6 text-gray-400" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Security Actions */}
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                  <h3 className="text-lg font-semibold text-white mb-4">Security Actions</h3>
                  <div className="space-y-3">
                    <button className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-left">
                      <div className="flex items-center space-x-3">
                        <ShieldCheckIcon className="w-5 h-5 text-blue-400" />
                        <div>
                          <p className="text-white font-medium">Enable Two-Factor Authentication</p>
                          <p className="text-gray-400 text-sm">Add an extra layer of security to your account</p>
                        </div>
                      </div>
                      <span className="text-blue-400">Setup →</span>
                    </button>
                    <button className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-left">
                      <div className="flex items-center space-x-3">
                        <CogIcon className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-white font-medium">Change Password</p>
                          <p className="text-gray-400 text-sm">Update your account password</p>
                        </div>
                      </div>
                      <span className="text-gray-400">Change →</span>
                    </button>
                    <button className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-left">
                      <div className="flex items-center space-x-3">
                        <ClockIcon className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-white font-medium">Login History</p>
                          <p className="text-gray-400 text-sm">View recent account activity</p>
                        </div>
                      </div>
                      <span className="text-gray-400">View →</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Stats Cards - Only show on profile tab */}
          {activeTab === 'profile' && (
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
                    <p className="text-xs text-green-400">+12 this month</p>
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
                    <p className="text-xs text-green-400">+5.2% this week</p>
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
                    <p className="text-xs text-yellow-400">Above average</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Enhanced Features Section - Only show on profile tab */}
          {activeTab === 'profile' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-8"
            >
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <span className="text-2xl mr-2">🚀</span>
                  Enhanced Features Available
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3 text-gray-300">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span>Advanced Profile Customization</span>
                    <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">Active</span>
                  </div>
                  <div className="flex items-center space-x-3 text-gray-300">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span>Enhanced Security Settings</span>
                    <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">Active</span>
                  </div>
                  <div className="flex items-center space-x-3 text-gray-300">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span>Comprehensive Preferences</span>
                    <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">Active</span>
                  </div>
                  <div className="flex items-center space-x-3 text-gray-300">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Avatar Upload System</span>
                    <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full">New</span>
                  </div>
                  <div className="flex items-center space-x-3 text-gray-400">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span>API Key Management</span>
                    <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full">Soon</span>
                  </div>
                  <div className="flex items-center space-x-3 text-gray-400">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span>Trading Performance Analytics</span>
                    <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded-full">Soon</span>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <p className="text-blue-300 text-sm">
                    🎆 <strong>Phase 1 Complete!</strong> Enhanced user profile management is now live with advanced form validation, tabbed interface, and comprehensive settings.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </>
  )
}
