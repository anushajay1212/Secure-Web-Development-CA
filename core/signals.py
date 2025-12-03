# from django.contrib.auth.models import User
# from django.db.models.signals import post_save
# from django.dispatch import receiver

# from .models import Profile


# @receiver(post_save, sender=User)
# def create_or_update_user_profile(sender, instance, created, **kwargs):
#     # Create profile if new user
#     if created:
#         # Default role: STUDENT
#         Profile.objects.create(
#             user=instance,
#             full_name=instance.get_full_name() or instance.username,
#             role='STUDENT',
#         )
#     else:
#         # Ensure profile exists for existing users
#         Profile.objects.get_or_create(
#             user=instance,
#             defaults={
#                 'full_name': instance.get_full_name() or instance.username,
#                 'role': 'STUDENT',
#             },
#         )
