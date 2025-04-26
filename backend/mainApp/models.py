import datetime

from django.db import models
from django.contrib.auth.base_user import BaseUserManager
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.utils import timezone
from datetime import timedelta
from django.utils.crypto import get_random_string


# Create your models here.
class AppUserManager(BaseUserManager):
    def create_user(self, email, username, password=None):
        if not email:
            raise ValueError('An email is required.')
        if not password:
            raise ValueError('A password is required.')
        email = self.normalize_email(email)
        user = self.model(email=email, username=username)
        user.set_password(password)
        user.save()
        return user

    def create_superuser(self, email, username, password):
        """
        Creates and saves a superuser with the given email and password.
        """
        user = self.create_user(
            email,
            username=username,
            password=password,
        )
        user.is_staff = True
        user.is_superuser = True
        user.save(using=self._db)
        return user


class AppUser(AbstractBaseUser, PermissionsMixin):
    id = models.AutoField(primary_key=True)
    email = models.EmailField(max_length=50, unique=True)
    username = models.CharField(max_length=50)
    telephone = models.CharField(max_length=15,blank=True, null=True)
    address = models.CharField(max_length=200,blank=True, null=True)
    name = models.CharField(max_length=200,blank=True, null=True)
    surname = models.CharField(max_length=200,blank=True, null=True)
    profile_picture = models.ImageField(blank=True, null=True, upload_to="images")
    is_verified = models.BooleanField(default=False)
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']
    objects = AppUserManager()

    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)

    def __str__(self):
        return self.username


class Building(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=300)
    address = models.CharField(max_length=500, null=True, blank=True)
    symbol = models.CharField(max_length=100, null=True, blank=True)
    abbreviation = models.CharField(max_length=100, null=True, blank=True) # new symbol
    function = models.CharField(max_length=100, null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    latitude = models.FloatField(null=True, blank=True)

    def __str__(self):
        return f"Budynek ID-{self.id}: {self.name}"


class Notification(models.Model):
    id = models.AutoField(primary_key=True)
    user = models.ForeignKey(AppUser, on_delete=models.CASCADE)
    title = models.CharField(max_length=300)
    isRead = models.BooleanField(default=False)
    message = models.CharField(max_length=1000)
    time_triggered = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Powiadomienie ID-{self.id}: {self.title}"


class Faculty(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=300)
    building = models.ForeignKey(Building, on_delete=models.CASCADE)

    def __str__(self):
        return f"Wydział ID-{self.id}: {self.name}"


SUBJECT_TYPE_CHOICES = (
    ("PD", "podstawowy"),
    ("ROZ", "rozszerzony"),
)


class MaturaSubject(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=300)
    level = models.CharField(max_length=300, choices=SUBJECT_TYPE_CHOICES, default="ROZ")

    def __str__(self):
        return f"Przedmiot maturalny ID-{self.id}: {self.name} {self.level}"


STUDIES_CHOICES = (
    ("STACJONARNE", "for all users"),
    ("NIESTACJONARNE", "for me and my group-mates"),
)


# Kierunek
class Field(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=300)
    faculty = models.ForeignKey(Faculty, on_delete=models.CASCADE)
    formula = models.CharField(max_length=1000, default='')
    type = models.CharField(max_length=100, default='stacjonarne', choices=STUDIES_CHOICES)
    description = models.TextField(blank=True, null=True)
    specialization = models.CharField(max_length=300, blank=True, null=True)
    G1_subject = models.ManyToManyField(MaturaSubject, blank=True, related_name="G1")
    G2_subject = models.ManyToManyField(MaturaSubject, blank=True, related_name="G2")

    def __str__(self):
        return f"Kierunek ID-{self.id}: {self.name}"


class FieldByYear(models.Model):
    id = models.AutoField(primary_key=True)
    field = models.ForeignKey(Field, on_delete=models.CASCADE)
    start_date = models.DateField()
    end_date = models.DateField()

    def __str__(self):
        return f"Kierunek ID-{self.id}: {self.name} {str(self.start_date.year)}"


class Semester(models.Model):
    id = models.AutoField(primary_key=True)
    field_by_year = models.ForeignKey(FieldByYear, on_delete=models.CASCADE)
    number = models.IntegerField()
    ECTS_required = models.IntegerField(default=30)

    def __str__(self):
        return f"Semestr {self.number}, ID-{self.id}: {self.field_by_year.field.name}"


class Round(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=300)
    field = models.ForeignKey(Field, on_delete=models.CASCADE)
    min_threshold = models.IntegerField(default=0)
    year = models.CharField(blank=True, null=True, max_length=100)

    def __str__(self):
        return f"Tura ID-{self.id}: {self.name} - {self.year}"


class VerificationCode(models.Model):
    user = models.ForeignKey(AppUser, on_delete=models.CASCADE)
    student_id = models.CharField(max_length=6)
    code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)

    def is_expired(self):
        return timezone.now() > self.created_at + timedelta(hours=1)

    def __str__(self):
        return f"{self.user.email} - {self.code}"


class Course(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=300)
    field = models.ManyToManyField(Field)
    semester = models.ManyToManyField(Semester, null=True)
    ECTS = models.IntegerField(default=1)
    test_type = models.CharField(max_length=300, default="egzamin")
    additional_info = models.TextField(blank=True, null=True)
    lecturer = models.CharField(max_length=300, blank=True, null=True)

    def __str__(self):
        return f"Kurs ID-{self.id}: {self.name}"


class Event(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=300)
    start = models.DateTimeField()
    end = models.DateTimeField()
    color = models.CharField(max_length=300)
    additional_info = models.TextField(blank=True, null=True)
    recurrent = models.BooleanField(default=False)
    recurrency_details = models.JSONField(blank=True, null=True) # {'num': 2, 'type': "days", until: DATE}
    user = models.ForeignKey(AppUser, on_delete=models.CASCADE)

    def __str__(self):
        return f"Wydarzenie ID-{self.id}: {self.name}"


class Group(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=300)
    fieldByYear = models.ForeignKey(FieldByYear, on_delete=models.CASCADE)
    admin = models.ForeignKey(AppUser, on_delete=models.CASCADE, blank=True, null=True)
    code = models.CharField(max_length=300, default=get_random_string(32))

    def __str__(self):
        return f"Grupa ID-{self.id}: {self.name}"


AVAILABILTY_CHOICES = (
    ("PUBLIC", "for all users"),
    ("RESTRICTED", "for me and my group-mates"),
    ("PRIVATE", "only for me"),
)

SOURCE_TYPE_CHOICES = (
    ("LINK", "link"),
    ("FILE", "file"),
)


class Source(models.Model):
    id = models.AutoField(primary_key=True)
    title = models.CharField(max_length=500)
    field = models.ForeignKey(Field, on_delete=models.CASCADE)
    course = models.ForeignKey(Course, on_delete=models.CASCADE, null=True, blank=True)
    added_by = models.ForeignKey(AppUser, on_delete=models.CASCADE)
    date_added = models.DateTimeField(auto_now_add=True)
    verified = models.BooleanField(default=False)
    availability = models.CharField(choices=AVAILABILTY_CHOICES, max_length=20)
    type = models.CharField(max_length=100, default="LINK", choices=SOURCE_TYPE_CHOICES)
    link = models.URLField(blank=True, null=True)
    file = models.FileField(blank=True, null=True, upload_to="files")

    def __str__(self):
        return f"Źródło ID-{self.id}: {self.title}"
