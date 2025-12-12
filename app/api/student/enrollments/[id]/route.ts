import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const enrollment = await prisma.enrollment.findUnique({
      where: { id },
    })

    if (!enrollment || enrollment.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Enrollment not found' },
        { status: 404 }
      )
    }

    await prisma.enrollment.update({
      where: { id },
      data: { status: 'DROPPED' },
    })

    return NextResponse.json({ message: 'Course dropped successfully' })
  } catch (error) {
    console.error('Error dropping course:', error)
    return NextResponse.json(
      { error: 'Failed to drop course' },
      { status: 500 }
    )
  }
}

