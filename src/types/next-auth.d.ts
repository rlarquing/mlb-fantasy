import NextAuth from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name: string
      email: string
      image?: string | null
      role: string
      status: string
      paymentStatus: string
      balance: number
      totalPoints: number
    }
  }

  interface User {
    id: string
    role: string
    status?: string
    paymentStatus?: string
    balance?: number
    totalPoints?: number
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: string
    status: string
    paymentStatus: string
    balance: number
    totalPoints: number
  }
}
