import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const materialSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().nullable(),
  week: z.number().nullable(),
  module: z.string().nullable(),
  fileName: z.string(),
  fileType: z.string(),
  fileSize: z.number(),
  fileData: z.string(),
})

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: courseId } = await params

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { name: true },
    })

    const materials = await prisma.courseMaterial.findMany({
      where: { courseId, isActive: true },
      orderBy: [{ week: 'asc' }, { createdAt: 'desc' }],
      select: {
        id: true,
        title: true,
        description: true,
        fileName: true,
        fileType: true,
        fileSize: true,
        week: true,
        module: true,
        createdAt: true,
      },
    })

    return NextResponse.json({
      courseName: course?.name || 'Unknown Course',
      materials,
    })
  } catch (error) {
    console.error('Fetch materials error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch materials' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: courseId } = await params
    const body = await request.json()
    const validation = materialSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      )
    }

    const { title, description, week, module, fileName, fileType, fileSize, fileData } = validation.data

    if (fileSize > 2 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be less than 2MB' },
        { status: 400 }
      )
    }

    const material = await prisma.courseMaterial.create({
      data: {
        courseId,
        title,
        description,
        week,
        module,
        fileName,
        fileType,
        fileSize,
        fileUrl: fileData,
        uploadedBy: session.user.id,
      },
    })

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'UPLOAD',
        entity: 'COURSE_MATERIAL',
        entityId: material.id,
        details: `Uploaded material: ${title}`,
      },
    })

    return NextResponse.json(material)
  } catch (error) {
    console.error('Upload material error:', error)
    return NextResponse.json(
      { error: 'Failed to upload material' },
      { status: 500 }
    )
  }
}

