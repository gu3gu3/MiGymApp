'use server'

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"

export async function getProducts(gymId: string) {
  const products = await prisma.product.findMany({
    where: { gymId },
    orderBy: { name: 'asc' }
  })
  
  return products.map(p => ({
    ...p,
    price: Number(p.price)
  }))
}

export type ProductImportDTO = {
  name: string
  price: number
  stock: number
  minStock: number
}

export async function importProductsCSV(products: ProductImportDTO[]) {
  const session = await auth()
  const user = session?.user as any
  
  if (!user || user.role !== 'GYM_ADMIN' || !user.gymId) {
    throw new Error('No autorizado o sin gimnasio asignado')
  }

  const gymId = user.gymId

  try {
    // Validar que vengan datos
    if (!products || products.length === 0) {
      throw new Error('El archivo CSV está vacío o no es válido.')
    }

    // Preparar el array para crear, limpiando y forzando tipos numéricos por seguridad
    const dataToInsert = products.map(p => ({
      gymId,
      name: p.name.trim(),
      price: isNaN(Number(p.price)) ? 0 : Number(p.price),
      stock: isNaN(Number(p.stock)) ? 0 : Number(p.stock),
      minStock: isNaN(Number(p.minStock)) ? 0 : Number(p.minStock),
    })).filter(p => p.name.length > 0)

    if (dataToInsert.length === 0) {
      throw new Error('No se encontraron productos válidos en el archivo.')
    }

    // Inserción atómica en bloque
    const result = await prisma.product.createMany({
      data: dataToInsert,
      skipDuplicates: false, // Opcional: si hay duplicados permitimos insertarlos (el MVP no tiene restricción de nombre único)
    })

    // Revalidar las rutas pertinentes
    revalidatePath('/admin/inventory')
    revalidatePath('/admin/pos')

    return { success: true, count: result.count }
  } catch (error: any) {
    console.error('Error importando CSV:', error)
    return { success: false, error: error.message || 'Error desconocido al importar el archivo.' }
  }
}
