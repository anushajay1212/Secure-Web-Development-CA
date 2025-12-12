import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import { Navbar } from '@/components/layout/navbar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { User, Mail, Phone, MapPin, Calendar, GraduationCap, BookOpen } from 'lucide-react'
import ProfileEditForm from '@/components/student/profile-edit-form'
import PasswordChangeForm from '@/components/student/password-change-form'

export default async function StudentProfilePage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'STUDENT') {
    redirect('/unauthorized')
  }

  const [user, enrollmentHistory] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        profile: true,
      },
    }),
    prisma.enrollment.findMany({
      where: { userId: session.user.id },
      include: {
        course: true,
      },
      orderBy: { enrolledAt: 'desc' },
    }),
  ])

  if (!user) {
    redirect('/login')
  }

  const activeEnrollments = enrollmentHistory.filter((e) => e.status === 'ACTIVE')
  const completedEnrollments = enrollmentHistory.filter((e) => e.status === 'COMPLETED')
  const droppedEnrollments = enrollmentHistory.filter((e) => e.status === 'DROPPED')

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={session.user} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-1">Manage your personal information and settings</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader className="text-center">
                <div className="mx-auto w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mb-4">
                  <span className="text-white font-bold text-3xl">
                    {user.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2)}
                  </span>
                </div>
                <CardTitle className="text-2xl">{user.name}</CardTitle>
                <CardDescription className="text-base">
                  {user.profile?.studentId || 'N/A'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3 text-sm">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-700">{user.email}</span>
                </div>
                {user.profile?.phone && (
                  <div className="flex items-center space-x-3 text-sm">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-700">{user.profile.phone}</span>
                  </div>
                )}
                {user.profile?.address && (
                  <div className="flex items-center space-x-3 text-sm">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-700">{user.profile.address}</span>
                  </div>
                )}
                {user.profile?.dateOfBirth && (
                  <div className="flex items-center space-x-3 text-sm">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-700">
                      {new Date(user.profile.dateOfBirth).toLocaleDateString()}
                    </span>
                  </div>
                )}
                <div className="flex items-center space-x-3 text-sm">
                  <GraduationCap className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-700">
                    Member since {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Active Courses</span>
                  <span className="font-semibold text-blue-600">{activeEnrollments.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Completed</span>
                  <span className="font-semibold text-green-600">{completedEnrollments.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Credits</span>
                  <span className="font-semibold text-purple-600">
                    {activeEnrollments.reduce((sum, e) => sum + e.course.credits, 0)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Edit Profile</CardTitle>
                <CardDescription>Update your personal information</CardDescription>
              </CardHeader>
              <CardContent>
                <ProfileEditForm user={user} profile={user.profile} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>Update your account password</CardDescription>
              </CardHeader>
              <CardContent>
                <PasswordChangeForm />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Enrollment History</CardTitle>
                <CardDescription>View all your course enrollments</CardDescription>
              </CardHeader>
              <CardContent>
                {enrollmentHistory.length === 0 ? (
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">No enrollment history yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {enrollmentHistory.map((enrollment) => (
                      <div
                        key={enrollment.id}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
                      >
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <h4 className="font-semibold text-gray-900">
                              {enrollment.course.code} - {enrollment.course.name}
                            </h4>
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full ${
                                enrollment.status === 'ACTIVE'
                                  ? 'bg-green-100 text-green-800'
                                  : enrollment.status === 'COMPLETED'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {enrollment.status}
                            </span>
                          </div>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                            <span>{enrollment.course.credits} credits</span>
                            <span>•</span>
                            <span>Enrolled: {new Date(enrollment.enrolledAt).toLocaleDateString()}</span>
                            {enrollment.grade && (
                              <>
                                <span>•</span>
                                <span className="font-semibold text-green-600">
                                  Grade: {enrollment.grade}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}

