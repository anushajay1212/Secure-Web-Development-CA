from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator


# Profile Model (User Roles)

class Profile(models.Model):
    ROLE_CHOICES = (
        ('ADMIN', 'Admin'),
        ('STUDENT', 'Student'),
    )

    user = models.OneToOneField(User, on_delete=models.CASCADE)
    full_name = models.CharField(max_length=100)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)
    student_id = models.CharField(max_length=20, unique=True, blank=True, null=True)

    def __str__(self):
        return f"{self.full_name} ({self.role})"


# Course Model

class Course(models.Model):
    name = models.CharField(max_length=200)
    code = models.CharField(max_length=20, unique=True)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.code} - {self.name}"


# Enrollment Model

class Enrollment(models.Model):
    student = models.ForeignKey(Profile, on_delete=models.CASCADE)
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    date_enrolled = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('student', 'course')

    def __str__(self):
        return f"{self.student.full_name} enrolled in {self.course.code}"


# Grade Model

class Grade(models.Model):
    enrollment = models.OneToOneField(Enrollment, on_delete=models.CASCADE)
    value = models.IntegerField(
        validators=[
            MinValueValidator(0),
            MaxValueValidator(100)
        ]
    )
    date_graded = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.enrollment.student.full_name} - {self.enrollment.course.code}: {self.value}"