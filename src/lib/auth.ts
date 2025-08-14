import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { dbService } from '@/lib/db-service'
import bcrypt from 'bcryptjs'
export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET || 'fallback-secret-for-build',
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        console.log('🔐 NextAuth authorize called with:', {
          email: credentials?.email,
          hasPassword: !!credentials?.password
        })
        
        if (!credentials?.email || !credentials?.password) {
          console.log('❌ Missing credentials')
          return null
        }

        console.log('🔍 Looking up user:', credentials.email)
        const user = await dbService.findUserByEmail(credentials.email)
        
        console.log('👤 User lookup result:', {
          found: !!user,
          hasPassword: !!user?.password,
          updatedAt: user?.updatedAt
        })

        if (!user) {
          console.log('❌ User not found')
          return null
        }

        if (!user.password) {
          console.log('❌ User has no password')
          return null
        }

        console.log('🔐 Comparing passwords...')
        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )
        
        console.log('🔐 Password comparison result:', isPasswordValid)

        if (!isPasswordValid) {
          console.log('❌ Password does not match')
          return null
        }

        console.log('✅ Authentication successful for:', user.email)
        return {
          id: user.id,
          email: user.email,
          name: user.name,
        }
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  pages: {
    signIn: '/auth/signin',
    signUp: '/auth/signup'
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
      }
      return session
    }
  }
}
