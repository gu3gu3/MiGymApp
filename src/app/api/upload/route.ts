import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { Storage } from '@google-cloud/storage'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
    const extension = file.name.split('.').pop()
    const filename = `${uniqueSuffix}.${extension}`

    // Si existen las variables de GCS, subir a la nube
    if (process.env.GCS_BUCKET_NAME && process.env.GCS_CLIENT_EMAIL && process.env.GCS_PRIVATE_KEY) {
      const storage = new Storage({
        projectId: process.env.GCS_PROJECT_ID,
        credentials: {
          client_email: process.env.GCS_CLIENT_EMAIL,
          private_key: process.env.GCS_PRIVATE_KEY.replace(/\\n/g, '\n'), // Fix para .env
        },
      })

      const bucket = storage.bucket(process.env.GCS_BUCKET_NAME)
      const gcsFile = bucket.file(`gym-assets/${filename}`)
      
      await gcsFile.save(buffer, {
        metadata: { contentType: file.type }
      })

      // Hacerlo público si el bucket no lo es por defecto (Opcional, depende de tu config de bucket)
      // await gcsFile.makePublic();

      const publicUrl = `https://storage.googleapis.com/${process.env.GCS_BUCKET_NAME}/gym-assets/${filename}`
      return NextResponse.json({ url: publicUrl })
    } else {
      // Fallback Local (Desarrollo)
      const uploadDir = join(process.cwd(), 'public', 'uploads')
      
      if (!existsSync(uploadDir)) {
        await mkdir(uploadDir, { recursive: true })
      }
      
      const filepath = join(uploadDir, filename)
      await writeFile(filepath, buffer)
      
      return NextResponse.json({ url: `/uploads/${filename}` })
    }

  } catch (error) {
    console.error('Error uploading file:', error)
    return NextResponse.json({ error: 'Error interno del servidor al subir la imagen' }, { status: 500 })
  }
}
