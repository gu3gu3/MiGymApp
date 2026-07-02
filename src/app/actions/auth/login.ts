'use server'

import { signIn } from "@/auth"
import { AuthError } from "next-auth"

export async function authenticate(formData: FormData) {
  try {
    const data = Object.fromEntries(formData.entries())
    
    // Auth.js V5 signIn with credentials doesn't support redirects when returning errors unless handled carefully.
    // By passing redirect: false, we get a json response we can handle in the client.
    const result = await signIn('credentials', {
      email: data.email,
      password: data.password,
      redirect: false
    })

    if (result?.error) {
      return { error: 'Credenciales incorrectas' }
    }

    return { url: '/admin' } // Assuming all gym admins go to /admin by default, the middleware will sort out SUPER_ADMIN vs GYM_ADMIN
  } catch (error: any) {
    if (error?.message?.includes("Cuenta bloqueada") || error?.cause?.err?.message?.includes("Cuenta bloqueada")) {
      return { error: 'Tu cuenta está pendiente de activación por el Super Admin. Te contactaremos pronto.' }
    }
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return { error: 'Credenciales inválidas.' }
        default:
          return { error: 'Algo salió mal.' }
      }
    }
    // If it's not an AuthError, it might be a redirect error thrown by Next.js
    throw error
  }
}
