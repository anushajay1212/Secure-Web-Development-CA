import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    const text = await file.text()
    const lines = text.split('\n').filter((line) => line.trim())

    if (lines.length < 2) {
      return NextResponse.json(
        { error: 'CSV file must contain headers and at least one student' },
        { status: 400 }
      )
    }

    const headers = lines[0].split(',').map((h) => h.trim().toLowerCase())
    const requiredHeaders = ['name', 'email', 'password', 'role']

    for (const header of requiredHeaders) {
      if (!headers.includes(header)) {
        return NextResponse.json(
          { error: `Missing required header: ${header}` },
          { status: 400 }
        )
      }
    }

    let successCount = 0
    let failedCount = 0
    const errors: string[] = []

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue

      const values = line.split(',').map((v) => v.trim())
      const row: Record<string, string> = {}

      headers.forEach((header, index) => {
        row[header] = values[index] || ''
      })

      try {
        const { name, email, password, role } = row

        if (!name || !email || !password || !role) {
          throw new Error(`Row ${i + 1}: Missing required fields`)
        }

        if (!['STUDENT', 'ADMIN'].includes(role.toUpperCase())) {
          throw new Error(`Row ${i + 1}: Invalid role "${role}"`)
        }

        if (password.length < 8) {
          throw new Error(`Row ${i + 1}: Password must be at least 8 characters`)
        }

        const existingUser = await prisma.user.findUnique({
          where: { email },
        })

        if (existingUser) {
          throw new Error(`Row ${i + 1}: Email "${email}" already exists`)
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const user = await prisma.user.create({
          data: {
            name,
            email,
            password: hashedPassword,
            role: role.toUpperCase() as 'STUDENT' | 'ADMIN',
          },
        })

        if (role.toUpperCase() === 'STUDENT') {
          const studentIdNumber = Math.floor(100000 + Math.random() * 900000)
          const studentId = `STU${studentIdNumber}`

          await prisma.profile.create({
            data: {
              userId: user.id,
              studentId,
            },
          })
        }

        await prisma.auditLog.create({
          data: {
            userId: session.user.id,
            action: 'BULK_IMPORT',
            entity: 'USER',
            entityId: user.id,
            details: `Bulk imported user: ${name} (${email})`,
          },
        })

        successCount++
      } catch (error: unknown) {
        failedCount++
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        errors.push(errorMessage)
      }
    }

    return NextResponse.json({
      success: successCount,
      failed: failedCount,
      errors,
    })
  } catch (error) {
    console.error('Bulk import error:', error)
    return NextResponse.json(
      { error: 'Failed to process bulk import' },
      { status: 500 }
    )
  }
}

