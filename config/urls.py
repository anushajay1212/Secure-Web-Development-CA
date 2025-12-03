from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),

    # include the core app URLs
    path('', include('core.urls')),
]
