from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib.auth import authenticate, login
from django.contrib.auth.models import User
from django.contrib import messages

from .decorators import admin_required, student_required
from .models import Profile, Course, Enrollment
from .forms import (
    CourseForm,
    StudentForm,
    StudentRegisterForm,
    AdminRegisterForm,
    EnrollmentForm,
)

# HOME PAGE

def home_page(request):
    return render(request, "home.html")


# DASHBOARD REDIRECT  (FIXED / RESTORED)

@login_required
def dashboard_redirect(request):
    role = request.user.profile.role

    if role == "ADMIN":
        return redirect("admin_dashboard")

    return redirect("student_dashboard")


# STUDENT LOGIN

def student_login(request):
    if request.method == 'POST':
        username = request.POST.get('username') or ''
        password = request.POST.get('password') or ''

        user = authenticate(request, username=username, password=password)
        if user and hasattr(user, 'profile') and user.profile.role == 'STUDENT':
            login(request, user)
            return redirect('student_dashboard')

        return render(request, 'auth/student_login.html', {
            'error': 'Invalid student credentials'
        })

    return render(request, 'auth/student_login.html')



# ADMIN LOGIN

def admin_login(request):
    if request.method == 'POST':
        username = request.POST.get('username') or ''
        password = request.POST.get('password') or ''

        user = authenticate(request, username=username, password=password)
        if user and hasattr(user, 'profile') and user.profile.role == 'ADMIN':
            login(request, user)
            return redirect('admin_dashboard')

        return render(request, 'auth/admin_login.html', {
            'error': 'Invalid admin credentials'
        })

    return render(request, 'auth/admin_login.html')



# STUDENT REGISTER

def student_register(request):
    if request.method == 'POST':
        form = StudentRegisterForm(request.POST)
        if form.is_valid():
            user = User.objects.create_user(
                # Secure version: generate a unique password and check for conflicts
                username=form.cleaned_data['username'],
                email=form.cleaned_data['email'],
                password=form.cleaned_data['password'],
            )
            Profile.objects.create(
                user=user,
                full_name=form.cleaned_data['full_name'],
                student_id=form.cleaned_data['student_id'],
                role='STUDENT',
            )
            return redirect('student_login')

    else:
        form = StudentRegisterForm()

    return render(request, 'auth/student_register.html', {'form': form})


# ADMIN REGISTER

def admin_register(request):
    if request.method == 'POST':
        form = AdminRegisterForm(request.POST)
        if form.is_valid():
            user = User.objects.create_user(
                username=form.cleaned_data['username'],
                email=form.cleaned_data['email'],
                password=form.cleaned_data['password'],
            )
            Profile.objects.create(
                user=user,
                full_name=form.cleaned_data['username'],
                role='ADMIN',
            )
            return redirect('admin_login')

    else:
        form = AdminRegisterForm()

    return render(request, 'auth/admin_register.html', {'form': form})


# STUDENT DASHBOARD  (with available courses)

@student_required
def student_dashboard(request):
    student_profile = request.user.profile

    # Already enrolled
    enrollments = Enrollment.objects.filter(student=student_profile)

    # Courses NOT enrolled
    enrolled_ids = enrollments.values_list("course_id", flat=True)
    available_courses = Course.objects.exclude(id__in=enrolled_ids)

    return render(
        request,
        'dashboard/student_dashboard.html',
        {
            'enrollments': enrollments,
            'available_courses': available_courses,
        }
    )



# STUDENT SELF COURSE ENROLL

@student_required
def student_enroll_course(request, course_id):
    student_profile = request.user.profile
    course = get_object_or_404(Course, pk=course_id)

    # Prevent duplicates
    if Enrollment.objects.filter(student=student_profile, course=course).exists():
        messages.warning(request, "You are already enrolled in this course.")
    else:
        Enrollment.objects.create(student=student_profile, course=course)
        messages.success(request, f"You have been enrolled in: {course.name}")

    return redirect('student_dashboard')


# ADMIN DASHBOARD

@admin_required
def admin_dashboard(request):
    return render(request, 'dashboard/admin_dashboard.html')


# COURSE CRUD (ADMIN)

@admin_required
def course_list(request):
    courses = Course.objects.all().order_by('code')
    return render(request, 'admin/courses_list.html', {'courses': courses})


@admin_required
def course_create(request):
    if request.method == 'POST':
        form = CourseForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('course_list')
    else:
        form = CourseForm()

    return render(
        request,
        'admin/course_form.html',
        {'form': form, 'title': 'Create Course'},
    )


@admin_required
def course_update(request, pk):
    course = get_object_or_404(Course, pk=pk)

    if request.method == 'POST':
        form = CourseForm(request.POST, instance=course)
        if form.is_valid():
            form.save()
            return redirect('course_list')
    else:
        form = CourseForm(instance=course)

    return render(
        request,
        'admin/course_form.html',
        {'form': form, 'title': 'Edit Course'},
    )


@admin_required
def course_delete(request, pk):
    course = get_object_or_404(Course, pk=pk)

    if request.method == 'POST':
        course.delete()
        return redirect('course_list')

    return render(
        request,
        'admin/course_confirm_delete.html',
        {'course': course},
    )



# STUDENT CRUD (ADMIN)

@admin_required
def student_list(request):
    students = (
        Profile.objects.filter(role='STUDENT')
        .select_related('user')
        .order_by('student_id')
    )
    return render(request, 'admin/students_list.html', {'students': students})


@admin_required
def student_create(request):
    if request.method == 'POST':
        form = StudentForm(request.POST)
        if form.is_valid():

            # Insecure version – hardcoded password + no validation
            user = User.objects.create(
                username=form.cleaned_data['username'],
                email=form.cleaned_data['email'],
            )
            user.set_password('12345678')
            user.save()

            Profile.objects.create(
                user=user,
                full_name=form.cleaned_data['full_name'],
                student_id=form.cleaned_data['student_id'],
                role='STUDENT',
            )

            return redirect('student_list')

    else:
        form = StudentForm()

    return render(
        request,
        'admin/student_form.html',
        {'form': form, 'title': 'Create Student'},
    )


@admin_required
def student_update(request, pk):
    profile = get_object_or_404(Profile, pk=pk, role='STUDENT')
    user = profile.user

    if request.method == 'POST':
        form = StudentForm(request.POST)
        if form.is_valid():
            user.username = form.cleaned_data['username']
            user.email = form.cleaned_data['email']
            user.save()

            profile.full_name = form.cleaned_data['full_name']
            profile.student_id = form.cleaned_data['student_id']
            profile.save()

            return redirect('student_list')

    else:
        form = StudentForm(
            initial={
                'username': user.username,
                'email': user.email,
                'full_name': profile.full_name,
                'student_id': profile.student_id,
            }
        )

    return render(
        request,
        'admin/student_form.html',
        {'form': form, 'title': 'Edit Student'},
    )


@admin_required
def student_delete(request, pk):
    profile = get_object_or_404(Profile, pk=pk, role='STUDENT')
    user = profile.user

    if request.method == 'POST':
        user.delete()
        return redirect('student_list')

    return render(
        request,
        'admin/student_confirm_delete.html',
        {'profile': profile},
    )


# ENROLLMENT CRUD (ADMIN)

@admin_required
def enrollment_list(request):
    enrollments = Enrollment.objects.select_related('student', 'course')
    return render(
        request,
        'admin/enrollment_list.html',
        {'enrollments': enrollments},
    )


@admin_required
def enrollment_create(request):
    if request.method == 'POST':
        form = EnrollmentForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('enrollment_list')
    else:
        form = EnrollmentForm()

    return render(
        request,
        'admin/enrollment_form.html',
        {'form': form, 'title': 'Enroll Student in Course'},
    )


@admin_required
def enrollment_delete(request, pk):
    enrollment = get_object_or_404(Enrollment, pk=pk)

    if request.method == 'POST':
        enrollment.delete()
        return redirect('enrollment_list')

    return render(
        request,
        'admin/enrollment_confirm_delete.html',
        {'enrollment': enrollment},
    )
