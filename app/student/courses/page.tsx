'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/layout/navbar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BookOpen, Users, CheckCircle, XCircle, FileText } from 'lucide-react'
import Link from 'next/link'

interface Course {
  id: string
  code: string
  name: string
  description: string | null
  credits: number
  capacity: number
  instructor: string | null
  schedule: string | null
  isActive: boolean
  isEnrolled: boolean
  availableSeats: number
  _count: {
    enrollments: number
  }
}

interface Enrollment {
  id: string
  status: string
  course: {
    id: string
    name: string
  }
}

export default function StudentCoursesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [courses, setCourses] = useState<Course[]>([])
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (session?.user.role !== 'STUDENT') {
      router.push('/unauthorized')
    } else {
      fetchData()
    }
  }, [session, status, router])

  const fetchData = async () => {
    try {
      const [coursesRes, enrollmentsRes] = await Promise.all([
        fetch('/api/student/courses'),
        fetch('/api/student/enrollments'),
      ])

      if (coursesRes.ok) {
        const coursesData = await coursesRes.json()
        setCourses(coursesData)
      }

      if (enrollmentsRes.ok) {
        const enrollmentsData = await enrollmentsRes.json()
        setEnrollments(enrollmentsData)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEnroll = async (courseId: string) => {
    try {
      const response = await fetch('/api/student/enrollments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId }),
      })

      if (response.ok) {
        fetchData()
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to enroll')
      }
    } catch (error) {
      console.error('Error enrolling:', error)
      alert('An error occurred')
    }
  }

  const handleDrop = async (enrollmentId: string) => {
    if (!confirm('Are you sure you want to drop this course?')) return

    try {
      const response = await fetch(`/api/student/enrollments/${enrollmentId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchData()
      }
    } catch (error) {
      console.error('Error dropping course:', error)
    }
  }

  if (status === 'loading' || isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!session) return null

  const availableCourses = courses.filter(c => !c.isEnrolled)
  const enrolledCourses = courses.filter(c => c.isEnrolled)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={session.user} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Course Catalog</h1>
          <p className="text-gray-600 mt-1">Browse and enroll in available courses</p>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">My Enrolled Courses</h2>
          {enrolledCourses.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-gray-500">
                You haven&apos;t enrolled in any courses yet
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {enrolledCourses.map((course) => {
                const enrollment = enrollments.find(e => e.course.id === course.id)
                return (
                  <Card key={course.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{course.name}</CardTitle>
                          <CardDescription>{course.code}</CardDescription>
                        </div>
                        <Badge variant="success">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Enrolled
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {course.description && (
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                          {course.description}
                        </p>
                      )}
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center justify-between">
                          <span>Credits:</span>
                          <span className="font-medium">{course.credits}</span>
                        </div>
                        {course.instructor && (
                          <div className="flex items-center justify-between">
                            <span>Instructor:</span>
                            <span className="font-medium">{course.instructor}</span>
                          </div>
                        )}
                        {course.schedule && (
                          <div className="text-xs text-gray-500 mt-2">{course.schedule}</div>
                        )}
                      </div>
                      {enrollment && (
                        <div className="mt-4 space-y-2">
                          <Link href={`/student/materials/${course.id}`}>
                            <Button variant="outline" size="sm" className="w-full">
                              <FileText className="w-4 h-4 mr-2" />
                              View Materials
                            </Button>
                          </Link>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="w-full"
                            onClick={() => handleDrop(enrollment.id)}
                          >
                            Drop Course
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Available Courses</h2>
          {availableCourses.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-gray-500">
                No available courses at the moment
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableCourses.map((course) => {
                const isFull = course.availableSeats <= 0
                return (
                  <Card key={course.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-lg">{course.name}</CardTitle>
                      <CardDescription>{course.code}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {course.description && (
                        <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                          {course.description}
                        </p>
                      )}
                      <div className="space-y-2 text-sm text-gray-600 mb-4">
                        <div className="flex items-center justify-between">
                          <span>Credits:</span>
                          <span className="font-medium">{course.credits}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Available Seats:</span>
                          <span className={`font-medium ${isFull ? 'text-red-600' : 'text-green-600'}`}>
                            {course.availableSeats} / {course.capacity}
                          </span>
                        </div>
                        {course.instructor && (
                          <div className="flex items-center justify-between">
                            <span>Instructor:</span>
                            <span className="font-medium">{course.instructor}</span>
                          </div>
                        )}
                        {course.schedule && (
                          <div className="text-xs text-gray-500 mt-2">{course.schedule}</div>
                        )}
                      </div>
                      <Button
                        className="w-full"
                        onClick={() => handleEnroll(course.id)}
                        disabled={isFull}
                      >
                        {isFull ? 'Course Full' : 'Enroll Now'}
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

