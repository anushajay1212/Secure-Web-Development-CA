'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Edit, Save, X } from 'lucide-react'

interface AssignGradeButtonProps {
  enrollmentId: string
  currentGrade: string | null
  studentName: string
}

export default function AssignGradeButton({
  enrollmentId,
  currentGrade,
  studentName,
}: AssignGradeButtonProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [grade, setGrade] = useState(currentGrade || '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async () => {
    if (!grade.trim()) {
      setError('Grade is required')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      const res = await fetch(`/api/admin/enrollments/${enrollmentId}/grade`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ grade }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to assign grade')
      }

      setIsEditing(false)
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isEditing) {
    return (
      <div className="inline-flex items-center space-x-2">
        <input
          type="text"
          value={grade}
          onChange={(e) => setGrade(e.target.value)}
          placeholder="e.g., A, B+, 85"
          className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-24"
          disabled={isSubmitting}
        />
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="p-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
          title="Save grade"
        >
          <Save className="h-4 w-4" />
        </button>
        <button
          onClick={() => {
            setIsEditing(false)
            setGrade(currentGrade || '')
            setError('')
          }}
          disabled={isSubmitting}
          className="p-1.5 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50"
          title="Cancel"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setIsEditing(true)}
      className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-md hover:bg-blue-700 transition-colors"
    >
      <Edit className="h-3 w-3 mr-1" />
      {currentGrade ? 'Edit Grade' : 'Assign Grade'}
    </button>
  )
}

