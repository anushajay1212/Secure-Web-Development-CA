import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const courses = await prisma.course.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: { enrollments: true },
        },
      },
      orderBy: { name: 'asc' },
    })

    const enrolledCourses = await prisma.enrollment.findMany({
      where: { userId: session.user.id },
      select: { courseId: true },
    })

    const enrolledCourseIds = new Set(enrolledCourses.map((e) => e.courseId))

    const coursesWithEnrollmentStatus = courses.map((course) => ({
      ...course,
      isEnrolled: enrolledCourseIds.has(course.id),
      availableSeats: course.capacity - course._count.enrollments,
    }))

    return NextResponse.json(coursesWithEnrollmentStatus)
  } catch (error) {
    console.error('Error fetching courses:', error)
    return NextResponse.json(
      { error: 'Failed to fetch courses' },
      { status: 500 }
    )
  }
}

