import NextAuth from "next-auth"
import { authConfig } from "./auth.config"
import { NextResponse } from "next/server"

const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const { pathname } = req.nextUrl
  const role = (req.auth?.user as any)?.role as string | undefined

  const isApiAuthRoute = pathname.startsWith('/api/auth')
  const isPublicRoute = pathname === '/' || pathname.startsWith('/login') || pathname.startsWith('/api/patch-gym') || pathname.startsWith('/wallet')

  // Let NextAuth handle API auth routes
  if (isApiAuthRoute) return NextResponse.next()

  // Helper to build redirect URLs correctly behind proxies
  const buildRedirectUrl = (path: string) => {
    const host = req.headers.get('x-forwarded-host') || req.headers.get('host')
    const protocol = req.headers.get('x-forwarded-proto') || 'http'
    if (host) {
      return `${protocol}://${host}${path}`
    }
    return new URL(path, req.nextUrl).toString()
  }

  // Redirect unauthenticated users to login
  if (!isPublicRoute && !isLoggedIn) {
    return NextResponse.redirect(buildRedirectUrl('/login'))
  }

  // Handle authenticated users on login page
  if (isLoggedIn && pathname === '/login') {
    if (role === 'SUPER_ADMIN') {
      return NextResponse.redirect(buildRedirectUrl('/superadmin/plans'))
    }
    if (role === 'ATHLETE') {
      return NextResponse.redirect(buildRedirectUrl('/wallet'))
    }
    if (role === 'RECEPTIONIST') {
      return NextResponse.redirect(buildRedirectUrl('/admin/gatekeeper'))
    }
    return NextResponse.redirect(buildRedirectUrl('/admin/gamification'))
  }

  // Protect super admin routes
  if (pathname.startsWith('/superadmin') && role !== 'SUPER_ADMIN') {
    return NextResponse.redirect(buildRedirectUrl(role === 'ATHLETE' ? '/wallet' : '/admin/gatekeeper'))
  }

  // Protect admin routes from athletes and superadmins
  if (pathname.startsWith('/admin') && role !== 'GYM_ADMIN' && role !== 'RECEPTIONIST') {
    if (role === 'SUPER_ADMIN') {
      return NextResponse.redirect(buildRedirectUrl('/superadmin/plans'))
    }
    if (role === 'ATHLETE') {
      return NextResponse.redirect(buildRedirectUrl('/wallet'))
    }
    // Fallback if role is unknown
    return NextResponse.redirect(buildRedirectUrl('/login'))
  }

  // Protect specific GYM_ADMIN routes from RECEPTIONIST
  if (pathname.startsWith('/admin') && role === 'RECEPTIONIST') {
    const restrictedForReceptionist = [
      '/admin/gamification',
      '/admin/builder',
      '/admin/gym-health',
      '/admin/attendance',
      '/admin/inventory',
      '/admin/staff'
    ]
    if (restrictedForReceptionist.some(r => pathname.startsWith(r))) {
      return NextResponse.redirect(buildRedirectUrl('/admin/gatekeeper'))
    }
  }

  // Handle root admin and superadmin paths
  if (pathname === '/admin') {
    if (role === 'RECEPTIONIST') {
      return NextResponse.redirect(buildRedirectUrl('/admin/gatekeeper'))
    }
    return NextResponse.redirect(buildRedirectUrl('/admin/gamification'))
  }
  if (pathname === '/superadmin') {
    return NextResponse.redirect(buildRedirectUrl('/superadmin/plans'))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
}
