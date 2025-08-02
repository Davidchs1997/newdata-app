import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import prisma from '@/lib/prisma'
import { compare } from 'bcryptjs'

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const user = await prisma.user.findUnique({
          where: { email: credentials?.email },
        })

        if (user && (await compare(credentials!.password, user.password))) {
          return user
        }

        return null
      },
    }),
  ],
  session: { strategy: 'jwt', maxAge: 40 * 60 }, // 40 min
  callbacks: {
    async session({ session, token }) {
      session.user.id = token.sub!
      return session
    },
  },
  pages: {
    signIn: '/(auth)/login',
  },
})

export { handler as GET, handler as POST }
