'use server'

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"

export async function getSalesMetrics(gymId: string) {
  const now = new Date()
  
  // Today start
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  
  // Week start (assuming Monday as start of week)
  const day = now.getDay()
  const diff = now.getDate() - day + (day === 0 ? -6 : 1)
  const startOfWeek = new Date(now.getFullYear(), now.getMonth(), diff)
  
  // Month start
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const [todaySales, weekSales, monthSales] = await Promise.all([
    prisma.sale.aggregate({
      where: { gymId, createdAt: { gte: startOfToday } },
      _sum: { total: true }
    }),
    prisma.sale.aggregate({
      where: { gymId, createdAt: { gte: startOfWeek } },
      _sum: { total: true }
    }),
    prisma.sale.aggregate({
      where: { gymId, createdAt: { gte: startOfMonth } },
      _sum: { total: true }
    })
  ])

  return {
    today: Number(todaySales._sum.total || 0),
    week: Number(weekSales._sum.total || 0),
    month: Number(monthSales._sum.total || 0)
  }
}

export async function getProducts(gymId: string, onlyActive: boolean = false) {
  const whereClause: any = { gymId }
  if (onlyActive) {
    whereClause.isActive = true
  }

  const products = await prisma.product.findMany({
    where: whereClause,
    orderBy: { name: 'asc' }
  })
  
  return products.map(p => ({
    id: p.id,
    gymId: p.gymId,
    name: p.name,
    price: Number(p.price),
    costPrice: p.costPrice ? Number(p.costPrice) : null,
    stock: p.stock,
    minStock: p.minStock,
    photoUrl: p.photoUrl,
    isActive: p.isActive
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

    const gym = await prisma.gym.findUnique({
      where: { id: gymId },
      select: { posPlan: true, _count: { select: { products: true } } }
    })

    if (!gym) throw new Error('Gimnasio no encontrado')

    const currentCount = gym._count.products
    let maxLimit = 10 // KIOSKO
    if (gym.posPlan === 'TIENDITA') maxLimit = 30
    if (gym.posPlan === 'SMART_BAR') maxLimit = 100

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

    if (currentCount + dataToInsert.length > maxLimit) {
      throw new Error(`Límite de productos excedido. El plan ${gym.posPlan} permite hasta ${maxLimit} productos. Tienes ${currentCount} actualmente.`)
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

export type ProductCreateDTO = {
  name: string
  price: number
  costPrice?: number | null
  stock: number
  minStock: number
  photoUrl?: string | null
}

export async function createProduct(product: ProductCreateDTO) {
  const session = await auth()
  const user = session?.user as any
  
  if (!user || user.role !== 'GYM_ADMIN' || !user.gymId) {
    throw new Error('No autorizado o sin gimnasio asignado')
  }

  const gymId = user.gymId

  try {
    const gym = await prisma.gym.findUnique({
      where: { id: gymId },
      select: { posPlan: true, _count: { select: { products: true } } }
    })

    if (!gym) throw new Error('Gimnasio no encontrado')

    const currentCount = gym._count.products
    let maxLimit = 10
    if (gym.posPlan === 'TIENDITA') maxLimit = 30
    if (gym.posPlan === 'SMART_BAR') maxLimit = 100

    if (currentCount >= maxLimit) {
      throw new Error(`Límite de productos excedido. El plan ${gym.posPlan} permite hasta ${maxLimit} productos. Tienes ${currentCount} actualmente.`)
    }

    const result = await prisma.product.create({
      data: {
        gymId,
        name: product.name.trim(),
        price: isNaN(Number(product.price)) ? 0 : Number(product.price),
        costPrice: product.costPrice && !isNaN(Number(product.costPrice)) ? Number(product.costPrice) : null,
        stock: isNaN(Number(product.stock)) ? 0 : Number(product.stock),
        minStock: isNaN(Number(product.minStock)) ? 0 : Number(product.minStock),
        photoUrl: product.photoUrl || null
      }
    })

    revalidatePath('/admin/inventory')
    revalidatePath('/admin/pos')

    return { 
      success: true, 
      product: {
        id: result.id,
        gymId: result.gymId,
        name: result.name,
        price: Number(result.price),
        costPrice: result.costPrice ? Number(result.costPrice) : null,
        stock: result.stock,
        minStock: result.minStock,
        photoUrl: result.photoUrl,
        isActive: result.isActive
      }
    }
  } catch (error: any) {
    console.error('Error creando producto:', error)
    return { success: false, error: error.message || 'Error desconocido al crear producto.' }
  }
}

export type ProductUpdateDTO = {
  id: string
  name: string
  price: number
  costPrice?: number | null
  stock: number
  minStock: number
  photoUrl?: string | null
  isActive?: boolean
}

export async function updateProduct(product: ProductUpdateDTO) {
  const session = await auth()
  const user = session?.user as any
  
  if (!user || user.role !== 'GYM_ADMIN' || !user.gymId) {
    throw new Error('No autorizado o sin gimnasio asignado')
  }

  const gymId = user.gymId

  try {
    // Verify ownership
    const existing = await prisma.product.findUnique({
      where: { id: product.id }
    })

    if (!existing || existing.gymId !== gymId) {
      throw new Error('Producto no encontrado o no autorizado')
    }

    const result = await prisma.product.update({
      where: { id: product.id },
      data: {
        name: product.name.trim(),
        price: isNaN(Number(product.price)) ? 0 : Number(product.price),
        costPrice: product.costPrice && !isNaN(Number(product.costPrice)) ? Number(product.costPrice) : null,
        stock: isNaN(Number(product.stock)) ? 0 : Number(product.stock),
        minStock: isNaN(Number(product.minStock)) ? 0 : Number(product.minStock),
        ...(product.photoUrl !== undefined ? { photoUrl: product.photoUrl } : {}),
        ...(product.isActive !== undefined ? { isActive: product.isActive } : {})
      }
    })

    revalidatePath('/admin/inventory')
    revalidatePath('/admin/pos')

    return { 
      success: true, 
      product: {
        id: result.id,
        gymId: result.gymId,
        name: result.name,
        price: Number(result.price),
        costPrice: result.costPrice ? Number(result.costPrice) : null,
        stock: result.stock,
        minStock: result.minStock,
        photoUrl: result.photoUrl,
        isActive: result.isActive
      }
    }
  } catch (error: any) {
    console.error('Error actualizando producto:', error)
    return { success: false, error: error.message || 'Error desconocido al actualizar producto.' }
  }
}
