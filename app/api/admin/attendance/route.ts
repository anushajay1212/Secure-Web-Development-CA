import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const attendanceSchema = z.object({
  courseId: z.string(),
  date: z.string(),
  attendance: z.array(
    z.object({
      userId: z.string(),
      status: z.enum(['PRESENT', 'ABSENT', 'LATE']),
    })
  ),
})

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validation = attendanceSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      )
    }

    const { courseId, date, attendance } = validation.data

    const attendanceDate = new Date(date)
    attendanceDate.setHours(0, 0, 0, 0)

    for (const record of attendance) {
      await prisma.attendance.upsert({
        where: {
          userId_courseId_date: {
            userId: record.userId,
            courseId,
            date: attendanceDate,
          },
        },
        update: {
          status: record.status,
          markedBy: session.user.id,
        },
        create: {
          userId: record.userId,
          courseId,
          date: attendanceDate,
          status: record.status,
          markedBy: session.user.id,
        },
      })
    }

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'MARK_ATTENDANCE',
        entity: 'ATTENDANCE',
        entityId: courseId,
        details: `Marked attendance for ${attendance.length} students on ${date}`,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Attendance save error:', error)
    return NextResponse.json(
      { error: 'Failed to save attendance' },
      { status: 500 }
    )
  }
}

