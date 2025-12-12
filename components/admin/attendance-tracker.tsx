'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, Check, X, AlertCircle } from 'lucide-react'

interface Student {
  id: string
  name: string
  email: string
  profile: {
    studentId: string | null
  } | null
}

interface AttendanceTrackerProps {
  courseId: string
  courseName: string
  students: Student[]
}

export default function AttendanceTracker({
  courseId,
  courseName,
  students,
}: AttendanceTrackerProps) {
  const router = useRouter()
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  )
  const [attendance, setAttendance] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleToggleAttendance = (studentId: string) => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]:
        prev[studentId] === 'PRESENT'
          ? 'ABSENT'
          : prev[studentId] === 'ABSENT'
          ? 'LATE'
          : 'PRESENT',
    }))
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setMessage(null)

    try {
      const res = await fetch('/api/admin/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId,
          date: selectedDate,
          attendance: Object.entries(attendance).map(([userId, status]) => ({
            userId,
            status,
          })),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to save attendance')
      }

      setMessage({ type: 'success', text: `Attendance saved for ${selectedDate}!` })
      setAttendance({})
      router.refresh()
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message })
    } finally {
      setIsSubmitting(false)
    }
  }

  const markAllPresent = () => {
    const allPresent: Record<string, string> = {}
    students.forEach((student) => {
      allPresent[student.id] = 'PRESENT'
    })
    setAttendance(allPresent)
  }

  const markAllAbsent = () => {
    const allAbsent: Record<string, string> = {}
    students.forEach((student) => {
      allAbsent[student.id] = 'ABSENT'
    })
    setAttendance(allAbsent)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Mark Attendance</span>
            </CardTitle>
            <CardDescription>Track student attendance for {courseName}</CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex space-x-2">
            <Button onClick={markAllPresent} variant="outline" size="sm">
              <Check className="h-4 w-4 mr-1" />
              All Present
            </Button>
            <Button onClick={markAllAbsent} variant="outline" size="sm">
              <X className="h-4 w-4 mr-1" />
              All Absent
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-2 max-h-96 overflow-y-auto">
            {students.map((student) => {
              const status = attendance[student.id] || 'PRESENT'
              return (
                <div
                  key={student.id}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-700">
                        {student.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .toUpperCase()
                          .slice(0, 2)}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{student.name}</div>
                      <div className="text-sm text-gray-500">
                        {student.profile?.studentId || 'N/A'}
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() =>
                        setAttendance((prev) => ({ ...prev, [student.id]: 'PRESENT' }))
                      }
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        status === 'PRESENT'
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <Check className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() =>
                        setAttendance((prev) => ({ ...prev, [student.id]: 'LATE' }))
                      }
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        status === 'LATE'
                          ? 'bg-yellow-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      L
                    </button>
                    <button
                      onClick={() =>
                        setAttendance((prev) => ({ ...prev, [student.id]: 'ABSENT' }))
                      }
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        status === 'ABSENT'
                          ? 'bg-red-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {message && (
            <div
              className={`p-3 rounded-md ${
                message.type === 'success'
                  ? 'bg-green-50 border border-green-200 text-green-700'
                  : 'bg-red-50 border border-red-200 text-red-700'
              }`}
            >
              <div className="flex items-center space-x-2">
                {message.type === 'success' ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <AlertCircle className="h-5 w-5" />
                )}
                <span className="text-sm">{message.text}</span>
              </div>
            </div>
          )}

          <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full">
            <Calendar className="h-4 w-4 mr-2" />
            {isSubmitting ? 'Saving...' : 'Save Attendance'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

