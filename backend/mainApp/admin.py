from django.contrib import admin
from .models import AppUser,Building

# Register your models here.
admin.site.register(AppUser)
admin.site.register(Building)