from django.contrib import admin
from .models import (AppUser, Building, Notification, Faculty, Field, Source, Course, Event, FieldByYear,
                     EmailVerification, Semester, Group, MaturaSubject, News, Round, Attachment)

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
admin.site.register(EmailVerification)
admin.site.register(Group)
admin.site.register(MaturaSubject)
admin.site.register(News)
admin.site.register(Round)
admin.site.register(Attachment)
