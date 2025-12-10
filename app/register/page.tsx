import { RegisterForm } from '@/components/auth/register-form'
import Link from 'next/link'
import { GraduationCap, ArrowLeft } from 'lucide-react'

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <GraduationCap className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="font-bold text-lg text-gray-900">Atlas University</h1>
                <p className="text-xs text-gray-500">Student Portal</p>
              </div>
            </Link>
            <Link 
              href="/" 
              className="text-gray-600 hover:text-gray-900 text-sm flex items-center gap-1 font-medium transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Student Registration</h2>
            <p className="text-gray-600">Create your account to access the portal</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
            <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg">
              <p className="text-sm text-blue-800">
                <strong className="font-semibold">Note:</strong> Please use your official university email address for registration.
              </p>
            </div>
            
            <RegisterForm />
            
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-center text-sm text-gray-600">
                Already registered?{' '}
                <Link href="/login" className="text-blue-600 font-semibold hover:text-blue-700 transition-colors">
                  Sign in here
                </Link>
              </p>
            </div>
          </div>

          <div className="mt-6 text-center">
            <a href="#" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              Need help with registration?
            </a>
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-600">
          <p>&copy; 2025 University Portal. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
