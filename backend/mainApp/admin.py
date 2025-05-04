from django.contrib import admin
from .models import (AppUser,Building, Notification, Faculty, Field, Source, Course, Event, FieldByYear,
                     VerificationCode, Semester, Group, MaturaSubject)

# Register your models here.
admin.site.register(AppUser)
admin.site.register(Building)
admin.site.register(Notification)
admin.site.register(Faculty)
admin.site.register(Field)
admin.site.register(Course)
admin.site.register(Source)
admin.site.register(Event)
admin.site.register(FieldByYear)
admin.site.register(Semester)
admin.site.register(VerificationCode)
admin.site.register(Group)
admin.site.register(MaturaSubject)