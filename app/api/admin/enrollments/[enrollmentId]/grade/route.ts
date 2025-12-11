import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const gradeSchema = z.object({
  grade: z.string().min(1, 'Grade is required').max(10, 'Grade too long'),
})

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ enrollmentId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { enrollmentId } = await params

    const body = await request.json()
    const validation = gradeSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      )
    }

    const { grade } = validation.data

    const enrollment = await prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        user: true,
        course: true,
      },
    })

    if (!enrollment) {
      return NextResponse.json({ error: 'Enrollment not found' }, { status: 404 })
    }

    await prisma.enrollment.update({
      where: { id: enrollmentId },
      data: { grade },
    })

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'ASSIGN_GRADE',
        entity: 'ENROLLMENT',
        entityId: enrollmentId,
        details: `Assigned grade ${grade} to ${enrollment.user.name} for ${enrollment.course.name}`,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Assign grade error:', error)
    return NextResponse.json(
      { error: 'Failed to assign grade' },
      { status: 500 }
    )
  }
}

