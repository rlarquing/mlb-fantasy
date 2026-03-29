import NextAuth, { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import { db } from '@/lib/db'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@mlbfantasy.com'

export const authOptions: NextAuthOptions = {
  providers: [
    // Google OAuth Provider
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    // Development Fallback - Credentials Provider
    CredentialsProvider({
      id: 'dev-login',
      name: 'Dev Login',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'user@example.com' },
        name: { label: 'Name', type: 'text', placeholder: 'Tu nombre' },
      },
      async authorize(credentials) {
        if (!credentials?.email) return null
        
        // Check if this is the admin email
        const isAdmin = credentials.email === ADMIN_EMAIL
        
        // Find or create user
        let user = await db.user.findUnique({
          where: { email: credentials.email }
        })
        
        if (!user) {
          // Check if this is the first user (will be admin)
          const userCount = await db.user.count()
          const shouldBeAdmin = isAdmin || userCount === 0
          
          user = await db.user.create({
            data: {
              email: credentials.email,
              name: credentials.name || credentials.email.split('@')[0],
              role: shouldBeAdmin ? 'admin' : 'user',
              isAdmin: shouldBeAdmin,
              status: shouldBeAdmin ? 'active' : 'pending',
              paymentStatus: shouldBeAdmin ? 'paid' : 'unpaid',
              balance: 100000000, // 100 million pesos
            }
          })
        }
        
        // Check if user is banned
        if (user.status === 'banned') {
          throw new Error('Tu cuenta ha sido baneada')
        }
        
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          image: user.image,
        }
      }
    })
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        const isAdmin = user.email === ADMIN_EMAIL
        
        // Find or create user in database
        let dbUser = await db.user.findUnique({
          where: { email: user.email! }
        })
        
        if (!dbUser) {
          const userCount = await db.user.count()
          const shouldBeAdmin = isAdmin || userCount === 0
          
          dbUser = await db.user.create({
            data: {
              email: user.email!,
              name: user.name || user.email!.split('@')[0],
              googleId: account.providerAccountId,
              image: user.image,
              role: shouldBeAdmin ? 'admin' : 'user',
              isAdmin: shouldBeAdmin,
              status: shouldBeAdmin ? 'active' : 'pending',
              paymentStatus: shouldBeAdmin ? 'paid' : 'unpaid',
              balance: 100000000,
            }
          })
        }
        
        // Check if banned
        if (dbUser.status === 'banned') {
          return false
        }
        
        // Update googleId if not set
        if (!dbUser.googleId) {
          await db.user.update({
            where: { id: dbUser.id },
            data: { googleId: account.providerAccountId }
          })
        }
        
        user.id = dbUser.id
        user.role = dbUser.role
      }
      return true
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        
        // Get fresh user data from DB
        const dbUser = await db.user.findUnique({
          where: { email: user.email! }
        })
        
        if (dbUser) {
          token.id = dbUser.id
          token.role = dbUser.role
          token.status = dbUser.status
          token.paymentStatus = dbUser.paymentStatus
          token.balance = dbUser.balance
          token.totalPoints = dbUser.totalPoints
        }
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.status = token.status as string
        session.user.paymentStatus = token.paymentStatus as string
        session.user.balance = token.balance as number
        session.user.totalPoints = token.totalPoints as number
      }
      return session
    }
  },
  pages: {
    signIn: '/',
    error: '/',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
