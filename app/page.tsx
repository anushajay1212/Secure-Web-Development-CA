import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Link from 'next/link'
import { GraduationCap, BookOpen, Calendar, Bell, FileText, TrendingUp, ChevronRight } from 'lucide-react'

export default async function Home() {
  const session = await getServerSession(authOptions)

  if (session) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <GraduationCap className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="font-bold text-lg text-gray-900">Atlas University</h1>
                <p className="text-xs text-gray-500">Student Portal</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link 
                href="/login" 
                className="text-gray-700 hover:text-gray-900 px-4 py-2 text-sm font-medium transition-colors"
              >
                Sign In
              </Link>
              <Link 
                href="/register" 
                className="bg-blue-600 text-white hover:bg-blue-700 px-5 py-2.5 rounded-lg text-sm font-semibold shadow-sm transition-all hover:shadow-md"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome to Student Portal
              </h2>
              <p className="text-gray-600 text-lg">
                Manage your academic journey. Access courses, view grades, and stay connected.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1 text-lg">Course Catalog</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Browse and enroll in available courses for the semester
                    </p>
                    <Link href="/register" className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 font-medium group">
                      View Courses 
                      <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1 text-lg">Academic Calendar</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      View important dates and upcoming deadlines
                    </p>
                    <Link href="/register" className="inline-flex items-center text-sm text-green-600 hover:text-green-700 font-medium group">
                      View Calendar 
                      <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1 text-lg">My Progress</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Track your grades and academic performance
                    </p>
                    <Link href="/login" className="inline-flex items-center text-sm text-purple-600 hover:text-purple-700 font-medium group">
                      Sign In 
                      <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="w-6 h-6 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1 text-lg">Resources</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Access student resources and support services
                    </p>
                    <Link href="/register" className="inline-flex items-center text-sm text-orange-600 hover:text-orange-700 font-medium group">
                      Explore 
                      <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-8 text-white shadow-lg">
              <h3 className="text-2xl font-bold mb-2">New to the Portal?</h3>
              <p className="text-blue-100 mb-6 text-lg">
                Create your student account to access courses, manage enrollments, and track your academic progress.
              </p>
              <Link 
                href="/register" 
                className="inline-flex items-center bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors shadow-md"
              >
                Create Account
                <ChevronRight className="w-5 h-5 ml-2" />
              </Link>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <Bell className="w-5 h-5 text-gray-600" />
                <h3 className="font-semibold text-gray-900">Quick Links</h3>
              </div>
              <div className="space-y-2">
                <Link 
                  href="/login" 
                  className="block p-3 rounded-lg hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200"
                >
                  <div className="font-medium text-gray-900 text-sm">Student Login</div>
                  <div className="text-xs text-gray-500 mt-0.5">Access your dashboard</div>
                </Link>
                <Link 
                  href="/register" 
                  className="block p-3 rounded-lg hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200"
                >
                  <div className="font-medium text-gray-900 text-sm">New Student Registration</div>
                  <div className="text-xs text-gray-500 mt-0.5">Create your account</div>
                </Link>
                <Link 
                  href="/login" 
                  className="block p-3 rounded-lg hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200"
                >
                  <div className="font-medium text-gray-900 text-sm">Admin Portal</div>
                  <div className="text-xs text-gray-500 mt-0.5">For administrators</div>
                </Link>
              </div>
            </div>

            <div className="bg-green-50 rounded-xl p-6 border border-green-200">
              <h3 className="font-semibold text-gray-900 mb-4">System Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">Portal Status</span>
                  <span className="flex items-center gap-2 text-green-700 font-medium">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    Online
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">Last Updated</span>
                  <span className="text-gray-900 font-medium">Just now</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-3">Need Help?</h3>
              <p className="text-sm text-gray-600 mb-4">
                Contact our support team for assistance with your account or technical issues.
              </p>
              <a 
                href="#" 
                className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 font-medium group"
              >
                Contact Support 
                <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-6 h-6 text-blue-600" />
              <span className="text-sm text-gray-600">
                &copy; 2025 University Portal. All rights reserved.
              </span>
            </div>
            <div className="flex gap-6 text-sm text-gray-600">
              <Link href="#" className="hover:text-gray-900 transition-colors">Privacy Policy</Link>
              <Link href="#" className="hover:text-gray-900 transition-colors">Terms of Service</Link>
              <Link href="#" className="hover:text-gray-900 transition-colors">Help</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
