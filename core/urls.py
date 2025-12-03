from django.urls import path
from django.contrib.auth import views as auth_views
from . import views

urlpatterns = [
    # Home
    path('', views.home_page, name='home'),

    # Authentication
    path('student/login/', views.student_login, name='student_login'),
    path('student/register/', views.student_register, name='student_register'),

    path('admin-panel/login/', views.admin_login, name='admin_login'),
    path('admin-panel/register/', views.admin_register, name='admin_register'),

    # Logout
    path('logout/', auth_views.LogoutView.as_view(), name='logout'),

    # Dashboards
    path('dashboard/', views.dashboard_redirect, name='dashboard'),
    path('student-dashboard/', views.student_dashboard, name='student_dashboard'),
    path('admin-panel/dashboard/', views.admin_dashboard, name='admin_dashboard'),

    # Student self-enroll
    path('student/enroll/<int:course_id>/', views.student_enroll_course, name='student_enroll'),

    # Course CRUD (Admin)
    path('admin-panel/courses/', views.course_list, name='course_list'),
    path('admin-panel/courses/create/', views.course_create, name='course_create'),
    path('admin-panel/courses/<int:pk>/edit/', views.course_update, name='course_update'),
    path('admin-panel/courses/<int:pk>/delete/', views.course_delete, name='course_delete'),

    # Student CRUD (Admin)
    path('admin-panel/students/', views.student_list, name='student_list'),
    path('admin-panel/students/create/', views.student_create, name='student_create'),
    path('admin-panel/students/<int:pk>/edit/', views.student_update, name='student_update'),
    path('admin-panel/students/<int:pk>/delete/', views.student_delete, name='student_delete'),

    # Enrollment CRUD (Admin)
    path('admin-panel/enrollments/', views.enrollment_list, name='enrollment_list'),
    path('admin-panel/enrollments/create/', views.enrollment_create, name='enrollment_create'),
    path('admin-panel/enrollments/<int:pk>/delete/', views.enrollment_delete, name='enrollment_delete'),
]
