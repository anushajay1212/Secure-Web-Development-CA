'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/layout/navbar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Upload, Download, Users, FileSpreadsheet, AlertCircle, CheckCircle2 } from 'lucide-react'

export default function BulkOperationsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [results, setResults] = useState<{
    success: number
    failed: number
    errors: string[]
  } | null>(null)

  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!session || session.user.role !== 'ADMIN') {
    router.push('/unauthorized')
    return null
  }

  const downloadTemplate = () => {
    const csvContent = `name,email,password,role
John Doe,john@student.edu,Student@123,STUDENT
Jane Smith,jane@student.edu,Student@123,STUDENT
Bob Johnson,bob@student.edu,Student@123,STUDENT`

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'student_import_template.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setResults(null)
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setIsUploading(true)
    setResults(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/admin/bulk-import', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Upload failed')
      }

      setResults(data)
      setFile(null)
      
      const fileInput = document.getElementById('csv-file') as HTMLInputElement
      if (fileInput) fileInput.value = ''
    } catch (error: any) {
      alert(`Error: ${error.message}`)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={session.user} />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Bulk Operations</h1>
          <p className="text-gray-600 mt-1">Import students and manage data in bulk</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Download className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle>Download Template</CardTitle>
                  <CardDescription>Get CSV template for bulk import</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-700 mb-4">
                Download the CSV template with sample data. Fill it with your student information
                and upload it to create multiple accounts at once.
              </p>
              <Button onClick={downloadTemplate} variant="outline">
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Download Template
              </Button>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                  <Upload className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle>Upload Students</CardTitle>
                  <CardDescription>Import multiple students from CSV</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label htmlFor="csv-file" className="block text-sm font-medium text-gray-700 mb-2">
                    Select CSV File
                  </label>
                  <input
                    id="csv-file"
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-white focus:outline-none"
                  />
                </div>
                {file && (
                  <div className="flex items-center space-x-2 text-sm text-gray-700">
                    <FileSpreadsheet className="h-4 w-4" />
                    <span>{file.name}</span>
                  </div>
                )}
                <Button onClick={handleUpload} disabled={!file || isUploading} className="w-full">
                  <Upload className="w-4 h-4 mr-2" />
                  {isUploading ? 'Uploading...' : 'Upload & Import'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {results && (
          <Card>
            <CardHeader>
              <CardTitle>Import Results</CardTitle>
              <CardDescription>Summary of bulk import operation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <CheckCircle2 className="h-8 w-8 text-green-600" />
                    <div>
                      <div className="text-2xl font-bold text-green-900">{results.success}</div>
                      <div className="text-sm text-green-700">Students Created</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <AlertCircle className="h-8 w-8 text-red-600" />
                    <div>
                      <div className="text-2xl font-bold text-red-900">{results.failed}</div>
                      <div className="text-sm text-red-700">Failed</div>
                    </div>
                  </div>
                </div>

                {results.errors.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h4 className="font-semibold text-red-900 mb-2">Errors:</h4>
                    <ul className="space-y-1">
                      {results.errors.map((error, index) => (
                        <li key={index} className="text-sm text-red-700">
                          • {error}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm text-gray-700">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">CSV Format Requirements:</h4>
                <ul className="list-disc list-inside space-y-1">
                  <li>First row must be headers: <code className="bg-gray-100 px-1 rounded">name,email,password,role</code></li>
                  <li><strong>name:</strong> Full name of the student (required)</li>
                  <li><strong>email:</strong> Valid email address (must be unique)</li>
                  <li><strong>password:</strong> Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char</li>
                  <li><strong>role:</strong> Either STUDENT or ADMIN</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Example:</h4>
                <pre className="bg-gray-100 p-3 rounded-lg text-xs overflow-x-auto">
{`name,email,password,role
John Doe,john@student.edu,Student@123,STUDENT
Jane Smith,jane@student.edu,Student@123,STUDENT`}
                </pre>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div className="text-sm text-yellow-800">
                    <strong>Note:</strong> Student IDs will be auto-generated for all new students.
                    Duplicate emails will be skipped. All passwords will be securely hashed.
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

