'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/layout/navbar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Megaphone, Plus, Trash2, X, AlertCircle, Info } from 'lucide-react'

interface Announcement {
  id: string
  title: string
  content: string
  priority: string
  isActive: boolean
  courseId: string | null
  course: { name: string; code: string } | null
  createdAt: string
}

interface Course {
  id: string
  code: string
  name: string
}

export default function AdminAnnouncementsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    priority: 'NORMAL',
    courseId: '',
    isActive: true,
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (session?.user.role !== 'ADMIN') {
      router.push('/unauthorized')
    } else {
      fetchData()
    }
  }, [session, status, router])

  const fetchData = async () => {
    try {
      const [announcementsRes, coursesRes] = await Promise.all([
        fetch('/api/admin/announcements'),
        fetch('/api/admin/courses'),
      ])

      if (announcementsRes.ok) {
        const data = await announcementsRes.json()
        setAnnouncements(data)
      }

      if (coursesRes.ok) {
        const data = await coursesRes.json()
        setCourses(data)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await fetch('/api/admin/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          courseId: formData.courseId || null,
        }),
      })

      if (response.ok) {
        fetchData()
        resetForm()
      }
    } catch (error) {
      console.error('Error creating announcement:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return

    try {
      const response = await fetch(`/api/admin/announcements/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchData()
      }
    } catch (error) {
      console.error('Error deleting announcement:', error)
    }
  }

  const resetForm = () => {
    setShowForm(false)
    setFormData({
      title: '',
      content: '',
      priority: 'NORMAL',
      courseId: '',
      isActive: true,
    })
  }

  if (status === 'loading' || isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!session) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={session.user} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Announcements</h1>
            <p className="text-gray-600 mt-1">Manage system and course announcements</p>
          </div>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Announcement
          </Button>
        </div>

        {showForm && (
          <Card className="mb-8">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Create Announcement</CardTitle>
                  <CardDescription>Post a new announcement to students</CardDescription>
                </div>
                <Button variant="ghost" size="icon" onClick={resetForm}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    placeholder="e.g., Midterm Exam Schedule"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="content">Content *</Label>
                  <textarea
                    id="content"
                    className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    required
                    placeholder="Enter announcement details..."
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority *</Label>
                    <select
                      id="priority"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    >
                      <option value="NORMAL">Normal</option>
                      <option value="HIGH">High</option>
                      <option value="URGENT">Urgent</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="courseId">Course (Optional)</Label>
                    <select
                      id="courseId"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={formData.courseId}
                      onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                    >
                      <option value="">All Students (Global)</option>
                      {courses.map((course) => (
                        <option key={course.id} value={course.id}>
                          {course.code} - {course.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="isActive">Active (visible to students)</Label>
                </div>
                <div className="flex gap-3">
                  <Button type="submit">Post Announcement</Button>
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          {announcements.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Megaphone className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 text-lg">No announcements yet</p>
                <p className="text-gray-500 text-sm mt-2">
                  Create your first announcement to notify students
                </p>
              </CardContent>
            </Card>
          ) : (
            announcements.map((announcement) => (
              <Card key={announcement.id}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {announcement.priority === 'URGENT' && (
                          <AlertCircle className="h-5 w-5 text-red-500" />
                        )}
                        {announcement.priority === 'HIGH' && (
                          <AlertCircle className="h-5 w-5 text-orange-500" />
                        )}
                        {announcement.priority === 'NORMAL' && (
                          <Info className="h-5 w-5 text-blue-500" />
                        )}
                        <h3 className="text-xl font-semibold text-gray-900">
                          {announcement.title}
                        </h3>
                      </div>
                      <p className="text-gray-700 mb-4 whitespace-pre-wrap">
                        {announcement.content}
                      </p>
                      <div className="flex flex-wrap gap-2 items-center text-sm text-gray-600">
                        <Badge
                          variant={
                            announcement.priority === 'URGENT'
                              ? 'destructive'
                              : announcement.priority === 'HIGH'
                              ? 'warning'
                              : 'default'
                          }
                        >
                          {announcement.priority}
                        </Badge>
                        {announcement.course ? (
                          <Badge variant="secondary">
                            {announcement.course.code} - {announcement.course.name}
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Global</Badge>
                        )}
                        {announcement.isActive ? (
                          <Badge variant="success">Active</Badge>
                        ) : (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                        <span className="text-xs text-gray-500">
                          Posted: {new Date(announcement.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(announcement.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  )
}

