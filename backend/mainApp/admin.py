from django.contrib import admin
from .models import AppUser,Building, Notification, Faculty, Field

# Register your models here.
admin.site.register(AppUser)
admin.site.register(Building)
admin.site.register(Notification)
admin.site.register(Faculty)
admin.site.register(Field)