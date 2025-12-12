import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import { Navbar } from '@/components/layout/navbar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, Check, X, AlertTriangle, TrendingUp } from 'lucide-react'

export default async function StudentAttendancePage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'STUDENT') {
    redirect('/unauthorized')
  }

  const enrollments = await prisma.enrollment.findMany({
    where: {
      userId: session.user.id,
      status: 'ACTIVE',
    },
    include: {
      course: {
        include: {
          attendance: {
            where: {
              userId: session.user.id,
            },
            orderBy: {
              date: 'desc',
            },
          },
        },
      },
    },
  })

  const calculateAttendancePercentage = (records: any[]) => {
    if (records.length === 0) return 0
    const presentCount = records.filter(
      (r) => r.status === 'PRESENT' || r.status === 'LATE'
    ).length
    return Math.round((presentCount / records.length) * 100)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={session.user} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Attendance</h1>
          <p className="text-gray-600 mt-1">Track your attendance across all courses</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {enrollments.map((enrollment) => {
            const attendanceRecords = enrollment.course.attendance
            const percentage = calculateAttendancePercentage(attendanceRecords)
            const isLow = percentage < 75

            return (
              <Card key={enrollment.id} className={isLow ? 'border-red-300' : ''}>
                <CardHeader>
                  <CardTitle className="text-lg">{enrollment.course.code}</CardTitle>
                  <CardDescription>{enrollment.course.name}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Attendance</span>
                      <span
                        className={`text-2xl font-bold ${
                          isLow ? 'text-red-600' : 'text-green-600'
                        }`}
                      >
                        {percentage}%
                      </span>
                    </div>

                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          isLow ? 'bg-red-600' : 'bg-green-600'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-1">
                          <Check className="h-4 w-4 text-green-600" />
                        </div>
                        <div className="font-semibold">
                          {
                            attendanceRecords.filter((r) => r.status === 'PRESENT')
                              .length
                          }
                        </div>
                        <div className="text-gray-500">Present</div>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-1">
                          <AlertTriangle className="h-4 w-4 text-yellow-600" />
                        </div>
                        <div className="font-semibold">
                          {attendanceRecords.filter((r) => r.status === 'LATE').length}
                        </div>
                        <div className="text-gray-500">Late</div>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-1">
                          <X className="h-4 w-4 text-red-600" />
                        </div>
                        <div className="font-semibold">
                          {
                            attendanceRecords.filter((r) => r.status === 'ABSENT')
                              .length
                          }
                        </div>
                        <div className="text-gray-500">Absent</div>
                      </div>
                    </div>

                    {isLow && (
                      <div className="bg-red-50 border border-red-200 rounded-md p-2">
                        <p className="text-xs text-red-700 flex items-center">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Below 75% threshold
                        </p>
                      </div>
                    )}

                    <div className="pt-2 border-t border-gray-200">
                      <p className="text-xs text-gray-500">
                        Total Classes: {attendanceRecords.length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {enrollments.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">No enrolled courses yet</p>
              <p className="text-gray-500 text-sm mt-2">
                Enroll in courses to track your attendance
              </p>
            </CardContent>
          </Card>
        )}

        {enrollments.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Recent Attendance Records</CardTitle>
              <CardDescription>Latest attendance entries across all courses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {enrollments
                  .flatMap((enrollment) =>
                    enrollment.course.attendance.map((record) => ({
                      ...record,
                      courseName: enrollment.course.name,
                      courseCode: enrollment.course.code,
                    }))
                  )
                  .sort(
                    (a, b) =>
                      new Date(b.date).getTime() - new Date(a.date).getTime()
                  )
                  .slice(0, 10)
                  .map((record, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            record.status === 'PRESENT'
                              ? 'bg-green-100'
                              : record.status === 'LATE'
                              ? 'bg-yellow-100'
                              : 'bg-red-100'
                          }`}
                        >
                          {record.status === 'PRESENT' ? (
                            <Check className="h-5 w-5 text-green-600" />
                          ) : record.status === 'LATE' ? (
                            <AlertTriangle className="h-5 w-5 text-yellow-600" />
                          ) : (
                            <X className="h-5 w-5 text-red-600" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {record.courseCode} - {record.courseName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(record.date).toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </div>
                        </div>
                      </div>
                      <div
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          record.status === 'PRESENT'
                            ? 'bg-green-100 text-green-800'
                            : record.status === 'LATE'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {record.status}
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}

