import type { NextAuthConfig } from "next-auth"

export const authConfig = {
  secret: process.env.AUTH_SECRET || 'secret_gym_key_2026_super_secure_offline',
  session: { strategy: "jwt" },
  providers: [], // Los providers de BD se inyectan en auth.ts (Node Runtime)
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role
        token.id = user.id
        token.gymId = (user as any).gymId
      }
      
      // CRITICAL FIX: NextAuth automatically puts user.image into token.picture.
      // If the image is a base64 webcam capture, it will create dozens of cookies
      // and crash Nginx with "400 Bad Request Request Header Or Cookie Too Large".
      if (token.picture && token.picture.length > 500) {
        delete token.picture
      }
      
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        ;(session.user as any).role = token.role as string
        ;(session.user as any).gymId = token.gymId as string | undefined
      }
      return session
    }
  }
} satisfies NextAuthConfig
