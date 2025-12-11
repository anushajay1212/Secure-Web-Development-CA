'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { UserMinus } from 'lucide-react'

interface DropStudentButtonProps {
  enrollmentId: string
  studentName: string
  courseName: string
}

export default function DropStudentButton({
  enrollmentId,
  studentName,
  courseName,
}: DropStudentButtonProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const handleDrop = async () => {
    if (
      !confirm(
        `Are you sure you want to drop ${studentName} from ${courseName}? This action cannot be undone.`
      )
    ) {
      return
    }

    setIsSubmitting(true)

    try {
      const res = await fetch(`/api/admin/enrollments/${enrollmentId}/drop`, {
        method: 'PATCH',
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to drop student')
      }

      router.refresh()
    } catch (err: any) {
      alert(`Error: ${err.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <button
      onClick={handleDrop}
      disabled={isSubmitting}
      className="inline-flex items-center px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors"
    >
      <UserMinus className="h-3 w-3 mr-1" />
      {isSubmitting ? 'Dropping...' : 'Drop Student'}
    </button>
  )
}

