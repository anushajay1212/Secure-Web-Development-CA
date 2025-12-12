import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import { Navbar } from '@/components/layout/navbar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, Download, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default async function StudentMaterialsPage({
  params,
}: {
  params: Promise<{ courseId: string }>
}) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'STUDENT') {
    redirect('/unauthorized')
  }

  const { courseId } = await params

  const enrollment = await prisma.enrollment.findFirst({
    where: {
      userId: session.user.id,
      courseId,
      status: 'ACTIVE',
    },
    include: {
      course: {
        include: {
          courseMaterials: {
            where: { isActive: true },
            orderBy: [{ week: 'asc' }, { createdAt: 'desc' }],
          },
        },
      },
    },
  })

  if (!enrollment) {
    redirect('/student/courses')
  }

  const groupedMaterials = enrollment.course.courseMaterials.reduce(
    (acc, material) => {
      const key = material.week ? `Week ${material.week}` : 'General'
      if (!acc[key]) acc[key] = []
      acc[key].push(material)
      return acc
    },
    {} as Record<string, typeof enrollment.course.courseMaterials>
  )

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={session.user} />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link
            href="/student/courses"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Courses
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Course Materials</h1>
          <p className="text-gray-600 mt-1">
            {enrollment.course.code} - {enrollment.course.name}
          </p>
        </div>

        {enrollment.course.courseMaterials.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">No materials available yet</p>
              <p className="text-gray-500 text-sm mt-2">
                Check back later for course materials
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedMaterials).map(([category, materials]) => (
              <Card key={category}>
                <CardHeader>
                  <CardTitle>{category}</CardTitle>
                  <CardDescription>{materials.length} materials</CardDescription>
                </CardHeader>
                <CardContent>
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
                              <p className="text-sm text-gray-600 mt-1">
                                {material.description}
                              </p>
                            )}
                            <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                              <span>{material.fileName}</span>
                              <span>•</span>
                              <span>{formatFileSize(material.fileSize)}</span>
                              {material.module && (
                                <>
                                  <span>•</span>
                                  <span>{material.module}</span>
                                </>
                              )}
                              <span>•</span>
                              <span>
                                Added {new Date(material.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <a
                          href={`/api/student/materials/${material.id}/download`}
                          download
                          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium transition-colors"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </a>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

