import datetime

from django.db import models
from django.contrib.auth.base_user import BaseUserManager
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.utils import timezone
from datetime import timedelta

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
    profile_picture = models.ImageField(blank=True, null=True)
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


# Kierunek
class Field(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=300)
    faculty = models.ForeignKey(Faculty, on_delete=models.CASCADE)
    formula = models.TextField(max_length=1000, default='')

    def __str__(self):
        return f"Kierunek ID-{self.id}: {self.name}"


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