import NextAuth, { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import { db } from '@/lib/db'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@mlbfantasy.com'

export const authOptions: NextAuthOptions = {
  providers: [
    // Google OAuth Provider - Solo para usuarios regulares
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      allowDangerousEmailAccountLinking: true,
    }),
    
    // Credentials Provider - SOLO para el administrador
    CredentialsProvider({
      id: 'admin-credentials',
      name: 'Admin',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'admin@mlbfantasy.com' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email) return null
        
        // Verificar que es el admin
        if (credentials.email !== ADMIN_EMAIL) {
          throw new Error('Solo el administrador puede usar credenciales')
        }
        
        // Buscar o crear admin
        let user = await db.user.findUnique({
          where: { email: credentials.email }
        })
        
        if (!user) {
          user = await db.user.create({
            data: {
              email: credentials.email,
              name: 'Administrador',
              role: 'admin',
              status: 'active',
              paymentStatus: 'paid',
              balance: 100000000,
              lastPaymentDate: new Date(),
            }
          })
        }
        
        if (user.status === 'banned') {
          throw new Error('Tu cuenta ha sido suspendida')
        }
        
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          image: user.image || user.avatar,
        }
      }
    }),
    
    // Development fallback - solo en desarrollo
    ...(process.env.NODE_ENV === 'development' ? [
      CredentialsProvider({
        id: 'dev-login',
        name: 'Dev Login',
        credentials: {
          email: { label: 'Email', type: 'email', placeholder: 'user@example.com' },
          name: { label: 'Name', type: 'text', placeholder: 'Tu nombre' },
        },
        async authorize(credentials) {
          if (!credentials?.email) return null
          
          // En desarrollo, el admin puede usar dev login
          const isAdmin = credentials.email === ADMIN_EMAIL
          
          let user = await db.user.findUnique({
            where: { email: credentials.email }
          })
          
          if (!user) {
            user = await db.user.create({
              data: {
                email: credentials.email,
                name: credentials.name || credentials.email.split('@')[0],
                role: isAdmin ? 'admin' : 'user',
                status: isAdmin ? 'active' : 'pending',
                paymentStatus: isAdmin ? 'paid' : 'unpaid',
                balance: 100000000,
              }
            })
          }
          
          if (user.status === 'banned' || user.status === 'expelled') {
            throw new Error('Tu cuenta ha sido suspendida o expulsada')
          }
          
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            image: user.image || user.avatar,
          }
        }
      })
    ] : []),
  ],
  callbacks: {
    async signIn({ user, account }) {
      // Si es Google OAuth
      if (account?.provider === 'google') {
        const isAdmin = user.email === ADMIN_EMAIL
        
        let dbUser = await db.user.findUnique({
          where: { email: user.email! }
        })
        
        if (!dbUser) {
          // Crear nuevo usuario - NUNCA admin (solo el email específico)
          dbUser = await db.user.create({
            data: {
              email: user.email!,
              name: user.name || user.email!.split('@')[0],
              googleId: account.providerAccountId,
              image: user.image,
              avatar: user.image,
              role: isAdmin ? 'admin' : 'user',
              status: isAdmin ? 'active' : 'pending',
              paymentStatus: isAdmin ? 'paid' : 'unpaid',
              balance: 100000000,
            }
          })
        }
        
        // Verificar estado
        if (dbUser.status === 'banned' || dbUser.status === 'expelled') {
          return false
        }
        
        // Actualizar googleId si no existe
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
    maxAge: 30 * 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
