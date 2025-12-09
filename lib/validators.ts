import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  role: z.enum(['ADMIN', 'STUDENT']),
})

export const courseSchema = z.object({
  code: z.string().min(3, 'Course code must be at least 3 characters').max(20),
  name: z.string().min(3, 'Course name must be at least 3 characters').max(200),
  description: z.string().max(1000).optional(),
  credits: z.number().int().min(1).max(10),
  capacity: z.number().int().min(1).max(500),
  instructor: z.string().max(100).optional(),
  schedule: z.string().max(200).optional(),
  isActive: z.boolean().default(true),
})

export const updateCourseSchema = courseSchema.partial().extend({
  id: z.string(),
})

export const profileSchema = z.object({
  studentId: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().max(500).optional(),
  dateOfBirth: z.string().optional(),
  bio: z.string().max(1000).optional(),
})

export const enrollmentSchema = z.object({
  courseId: z.string(),
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type CourseInput = z.infer<typeof courseSchema>
export type UpdateCourseInput = z.infer<typeof updateCourseSchema>
export type ProfileInput = z.infer<typeof profileSchema>
export type EnrollmentInput = z.infer<typeof enrollmentSchema>

