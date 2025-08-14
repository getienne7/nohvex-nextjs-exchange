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
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await dbService.findUserByEmail(credentials.email)

        if (!user) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name ?? undefined,
        }
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  pages: {
    signIn: '/auth/signin'
  },
  callbacks: {
    async jwt({ token, user }) {
      // Persist user id
      if (user) {
        token.id = user.id
      }
      // Enrich token with 2FA enabled flag so middleware can enforce
      if (token.email) {
        try {
          const dbUser = await dbService.findUserByEmail(token.email as string)
          token.twoFAEnabled = !!(dbUser && dbUser.twoFAEnabled && dbUser.twoFASecret)
        } catch {
          // ignore
        }
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        // Surface 2FA enabled state to client if needed
        ;(session as unknown as { twoFAEnabled?: boolean }).twoFAEnabled = Boolean((token as unknown as { twoFAEnabled?: boolean }).twoFAEnabled)
      }
      return session
    }
  }
}
