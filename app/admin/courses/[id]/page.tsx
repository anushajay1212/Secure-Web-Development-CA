import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import Link from 'next/link'
import { ArrowLeft, Users, BookOpen, Calendar, User as UserIcon, Mail } from 'lucide-react'
import DropStudentButton from '@/components/admin/drop-student-button'
import AssignGradeButton from '@/components/admin/assign-grade-button'
import AttendanceTracker from '@/components/admin/attendance-tracker'

export default async function CourseDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/unauthorized')
  }

  const { id } = await params

  const course = await prisma.course.findUnique({
    where: { id },
    include: {
      enrollments: {
        where: {
          status: 'ACTIVE',
        },
        include: {
          user: {
            include: {
              profile: true,
            },
          },
        },
        orderBy: {
          enrolledAt: 'desc',
        },
      },
    },
  })

  if (!course) {
    redirect('/admin/courses')
  }

  const activeEnrollments = course.enrollments.length
  const availableSeats = course.capacity - activeEnrollments

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <Link
                href="/admin/courses"
                className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-2"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Courses
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">
                {course.code} - {course.name}
              </h1>
              <p className="text-gray-600 mt-1">{course.description}</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm text-gray-600">Enrollment Status</div>
                <div className="text-3xl font-bold text-blue-600">
                  {activeEnrollments}/{course.capacity}
                </div>
                <div className="text-sm text-gray-500">
                  {availableSeats > 0
                    ? `${availableSeats} seats available`
                    : 'Course Full'}
                </div>
              </div>
              <Link
                href={`/admin/courses/${course.id}/materials`}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors inline-block whitespace-nowrap"
              >
                📚 Materials
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{course.credits}</div>
                <div className="text-sm text-gray-600">Credits</div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{activeEnrollments}</div>
                <div className="text-sm text-gray-600">Enrolled Students</div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Calendar className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <div className="text-lg font-bold text-gray-900">
                  {course.schedule || 'TBA'}
                </div>
                <div className="text-sm text-gray-600">Schedule</div>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <AttendanceTracker
            courseId={course.id}
            courseName={course.name}
            students={course.enrollments.map((e) => e.user)}
          />
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Enrolled Students ({activeEnrollments})
            </h2>
            <div className="text-sm text-gray-600">
              Instructor: <span className="font-medium">{course.instructor || 'TBA'}</span>
            </div>
          </div>

          {activeEnrollments === 0 ? (
            <div className="text-center py-12">
              <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">No students enrolled yet</p>
              <p className="text-gray-500 text-sm mt-2">
                Students will appear here once they enroll in this course
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Grade
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Enrolled On
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {course.enrollments.map((enrollment) => (
                    <tr key={enrollment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <UserIcon className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {enrollment.user.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {enrollment.user.profile?.studentId || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-600">
                          <Mail className="h-4 w-4 mr-1" />
                          {enrollment.user.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {enrollment.grade ? (
                          <span className="px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            {enrollment.grade}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">Not assigned</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(enrollment.enrolledAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                        <AssignGradeButton
                          enrollmentId={enrollment.id}
                          currentGrade={enrollment.grade}
                          studentName={enrollment.user.name}
                        />
                        <DropStudentButton
                          enrollmentId={enrollment.id}
                          studentName={enrollment.user.name}
                          courseName={course.name}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

