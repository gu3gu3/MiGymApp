import { NextResponse } from 'next/server'
import { join } from 'path'
import { readFile } from 'fs/promises'
import { existsSync } from 'fs'

export async function GET(req: Request, props: { params: Promise<{ filename: string }> }) {
  try {
    const { filename } = await props.params
    const filepath = join(process.cwd(), 'public', 'uploads', filename)

    if (!existsSync(filepath)) {
      return new NextResponse('File not found', { status: 404 })
    }

    const buffer = await readFile(filepath)
    
    // Determine content type
    let contentType = 'image/jpeg'
    if (filename.endsWith('.png')) contentType = 'image/png'
    else if (filename.endsWith('.gif')) contentType = 'image/gif'
    else if (filename.endsWith('.webp')) contentType = 'image/webp'
    else if (filename.endsWith('.svg')) contentType = 'image/svg+xml'

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable'
      }
    })
  } catch (error) {
    console.error('Error serving file:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
