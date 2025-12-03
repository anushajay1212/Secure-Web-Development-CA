from functools import wraps

from django.contrib.auth.decorators import login_required
from django.http import HttpResponseForbidden

from .models import Profile


def admin_required(view_func):
    @wraps(view_func)
    @login_required
    def _wrapped_view(request, *args, **kwargs):
        try:
            profile = request.user.profile
        except Profile.DoesNotExist:
            return HttpResponseForbidden("No profile associated with this user.")
        if profile.role != 'ADMIN':
            return HttpResponseForbidden("You do not have permission to access this page.")
        return view_func(request, *args, **kwargs)

    return _wrapped_view


def student_required(view_func):
    @wraps(view_func)
    @login_required
    def _wrapped_view(request, *args, **kwargs):
        try:
            profile = request.user.profile
        except Profile.DoesNotExist:
            return HttpResponseForbidden("No profile associated with this user.")
        if profile.role != 'STUDENT':
            return HttpResponseForbidden("You do not have permission to access this page.")
        return view_func(request, *args, **kwargs)

    return _wrapped_view
