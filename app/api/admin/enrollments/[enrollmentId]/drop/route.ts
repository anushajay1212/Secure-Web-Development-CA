import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

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
      data: { status: 'DROPPED' },
    })

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'DROP_STUDENT',
        entity: 'ENROLLMENT',
        entityId: enrollmentId,
        details: `Dropped ${enrollment.user.name} from ${enrollment.course.name}`,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Drop student error:', error)
    return NextResponse.json(
      { error: 'Failed to drop student' },
      { status: 500 }
    )
  }
}

