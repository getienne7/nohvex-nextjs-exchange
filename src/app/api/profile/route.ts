import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { UpdateProfileRequest, UserProfile } from '@/types/user-preferences'

// GET /api/profile - Get user profile
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // For now, return mock data based on session
    // In production, this would fetch from database
    const profile: UserProfile = {
      id: session.user.email,
      name: session.user.name || 'User',
      email: session.user.email,
      bio: '',
      location: '',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      phone: '',
      avatar: session.user.image || '',
      verified: true,
      memberSince: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    }

    return NextResponse.json({ profile })
  } catch (error) {
    console.error('Profile fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/profile - Update user profile
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body: UpdateProfileRequest = await request.json()

    // Validate input
    const errors: Partial<Record<'name' | 'bio' | 'phone', string>> = {}
    
    if (body.name && body.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters long'
    }
    
    if (body.bio && body.bio.length > 500) {
      errors.bio = 'Bio must be less than 500 characters'
    }
    
    if (body.phone && !/^[\+]?[1-9][\d]{0,15}$/.test(body.phone.replace(/[\s\-\(\)]/g, ''))) {
      errors.phone = 'Please enter a valid phone number'
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ errors }, { status: 400 })
    }

    // In production, save to database
    // For now, return success with updated data
    const updatedProfile: UserProfile = {
      id: session.user.email,
      name: body.name?.trim() || session.user.name || 'User',
      email: session.user.email,
      bio: body.bio?.trim() || '',
      location: body.location?.trim() || '',
      timezone: body.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
      phone: body.phone?.trim() || '',
      avatar: session.user.image || '',
      verified: true,
      memberSince: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    }

    return NextResponse.json({ 
      success: true, 
      profile: updatedProfile,
      message: 'Profile updated successfully'
    })
  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
