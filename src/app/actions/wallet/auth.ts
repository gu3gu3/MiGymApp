'use server'

import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { signIn } from "@/auth"
import { AuthError } from "next-auth"

export async function registerAthlete(formData: FormData) {
  try {
    const data = Object.fromEntries(formData.entries())
    const email = data.email as string
    const password = data.password as string
    const name = data.name as string
    const gender = data.gender as string
    const weight = data.weight ? parseFloat(data.weight as string) : null
    const height = data.height ? parseFloat(data.height as string) : null
    const bmi = data.bmi ? parseFloat(data.bmi as string) : null

    if (!email || !password || !name) {
      return { error: "Todos los campos son requeridos." }
    }

    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return { error: "Este correo ya está registrado." }
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: "ATHLETE",
        isClaimed: true,
        gender,
        weight,
        height,
        bmi
      }
    })

    // Log the user in immediately after registration
    const result = await signIn('credentials', {
      email,
      password,
      redirect: false
    })

    if (result?.error) {
      return { error: "Cuenta creada pero hubo un error al iniciar sesión." }
    }

    return { url: '/wallet' }
  } catch (error) {
    console.error("Register Error:", error)
    return { error: "Error al registrar la cuenta." }
  }
}

export async function loginAthlete(formData: FormData) {
  try {
    const data = Object.fromEntries(formData.entries())
    
    // Auth.js V5 signIn with credentials
    const result = await signIn('credentials', {
      email: data.email,
      password: data.password,
      redirect: false
    })

    if (result?.error) {
      return { error: 'Credenciales incorrectas' }
    }

    return { url: '/wallet' }
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return { error: 'Credenciales inválidas.' }
        default:
          return { error: 'Algo salió mal.' }
      }
    }
    throw error
  }
}
