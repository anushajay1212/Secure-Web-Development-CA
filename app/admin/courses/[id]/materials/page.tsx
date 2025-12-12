'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { Navbar } from '@/components/layout/navbar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Upload, FileText, Download, Trash2, ArrowLeft, X, Plus } from 'lucide-react'
import Link from 'next/link'

interface CourseMaterial {
  id: string
  title: string
  description: string | null
  fileName: string
  fileType: string
  fileSize: number
  week: number | null
  module: string | null
  createdAt: string
}

export default function CourseMaterialsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const courseId = params.id as string
  const [materials, setMaterials] = useState<CourseMaterial[]>([])
  const [courseName, setCourseName] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    week: '',
    module: '',
    file: null as File | null,
  })

  useEffect(() => {
    fetchMaterials()
  }, [])

  const fetchMaterials = async () => {
    try {
      const res = await fetch(`/api/admin/courses/${courseId}/materials`)
      if (res.ok) {
        const data = await res.json()
        setMaterials(data.materials)
        setCourseName(data.courseName)
      }
    } catch (error) {
      console.error('Error fetching materials:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.file) return

    setIsUploading(true)

    try {
      const reader = new FileReader()
      reader.readAsDataURL(formData.file)
      
      reader.onload = async () => {
        const res = await fetch(`/api/admin/courses/${courseId}/materials`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: formData.title,
            description: formData.description || null,
            week: formData.week ? parseInt(formData.week) : null,
            module: formData.module || null,
            fileName: formData.file!.name,
            fileType: formData.file!.type,
            fileSize: formData.file!.size,
            fileData: reader.result,
          }),
        })

        if (res.ok) {
          fetchMaterials()
          setFormData({
            title: '',
            description: '',
            week: '',
            module: '',
            file: null,
          })
          setShowForm(false)
        } else {
          const data = await res.json()
          alert(data.error || 'Upload failed')
        }
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('Failed to upload material')
    } finally {
      setIsUploading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this material?')) return

    try {
      const res = await fetch(`/api/admin/courses/${courseId}/materials/${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        fetchMaterials()
      }
    } catch (error) {
      console.error('Delete error:', error)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  if (status === 'loading' || isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!session || session.user.role !== 'ADMIN') {
    router.push('/unauthorized')
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={session.user} />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link
            href={`/admin/courses/${courseId}`}
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Course Details
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Course Materials</h1>
          <p className="text-gray-600 mt-1">{courseName}</p>
        </div>

        <div className="mb-6">
          <Button onClick={() => setShowForm(!showForm)}>
            {showForm ? (
              <>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Add Material
              </>
            )}
          </Button>
        </div>

        {showForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Upload Course Material</CardTitle>
              <CardDescription>Add PDFs, slides, or documents for students</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpload} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    placeholder="e.g., Lecture 1: Introduction"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <textarea
                    id="description"
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of the material..."
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="week">Week (Optional)</Label>
                    <Input
                      id="week"
                      type="number"
                      min="1"
                      value={formData.week}
                      onChange={(e) => setFormData({ ...formData, week: e.target.value })}
                      placeholder="e.g., 1"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="module">Module (Optional)</Label>
                    <Input
                      id="module"
                      value={formData.module}
                      onChange={(e) => setFormData({ ...formData, module: e.target.value })}
                      placeholder="e.g., Introduction"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="file">File * (Max 2MB)</Label>
                  <input
                    id="file"
                    type="file"
                    onChange={(e) =>
                      setFormData({ ...formData, file: e.target.files?.[0] || null })
                    }
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.jpg,.png"
                    required
                    className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-white"
                  />
                  <p className="text-xs text-gray-500">
                    Accepted: PDF, DOC, DOCX, PPT, PPTX, TXT, JPG, PNG
                  </p>
                </div>

                <Button type="submit" disabled={isUploading || !formData.file}>
                  <Upload className="h-4 w-4 mr-2" />
                  {isUploading ? 'Uploading...' : 'Upload Material'}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>All Materials ({materials.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {materials.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No materials uploaded yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {materials.map((material) => (
                  <div
                    key={material.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FileText className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{material.title}</h4>
                        {material.description && (
                          <p className="text-sm text-gray-600 mt-1">{material.description}</p>
                        )}
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          <span>{material.fileName}</span>
                          <span>•</span>
                          <span>{formatFileSize(material.fileSize)}</span>
                          {material.week && (
                            <>
                              <span>•</span>
                              <span>Week {material.week}</span>
                            </>
                          )}
                          {material.module && (
                            <>
                              <span>•</span>
                              <span>{material.module}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <a
                        href={`/api/admin/courses/${courseId}/materials/${material.id}/download`}
                        download
                        className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                      >
                        <Download className="h-4 w-4" />
                      </a>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(material.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

