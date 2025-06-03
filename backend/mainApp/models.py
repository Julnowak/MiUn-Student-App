import datetime
from random import random

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
    email = models.EmailField(max_length=200, unique=True)
    student_email = models.EmailField(max_length=200, blank=True, null=True)
    username = models.CharField(max_length=50)
    telephone = models.CharField(max_length=15,blank=True, null=True)
    address = models.CharField(max_length=200,blank=True, null=True)
    name = models.CharField(max_length=200,blank=True, null=True)
    surname = models.CharField(max_length=200,blank=True, null=True)
    profile_picture = models.ImageField(blank=True, null=True, upload_to="images")
    is_verified = models.BooleanField(default=False)
    joined_at = models.DateTimeField(default=timezone.now)
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']
    objects = AppUserManager()

    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)
    is_online = models.BooleanField(default=False)

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
    ("stacjonarne", "stacjonarne"),
    ("niestacjonarne", "niestacjonarne"),
)


# Kierunek
class Field(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=300)
    faculty = models.ManyToManyField(Faculty)
    formula = models.CharField(max_length=1000, default='')
    type = models.CharField(max_length=100, default='stacjonarne', choices=STUDIES_CHOICES)
    description = models.TextField(blank=True, null=True)
    specialization = models.CharField(max_length=300, blank=True, null=True)
    G1_subject = models.ManyToManyField(MaturaSubject, blank=True, related_name="G1")
    G2_subject = models.ManyToManyField(MaturaSubject, blank=True, related_name="G2")
    level = models.CharField(max_length=300, default="I stopień")
    isActive = models.BooleanField(default=True)

    def __str__(self):
        return f"Kierunek ID-{self.id}: {self.name} ({self.type}, {self.level}, spec: {self.specialization})"


class Semester(models.Model):
    id = models.AutoField(primary_key=True)
    start_date = models.DateField(blank=True, null=True)
    end_date = models.DateField(blank=True, null=True)
    number = models.IntegerField()
    ECTS_required = models.IntegerField(default=30)

    def __str__(self):
        return f"Semestr {self.number}, ID-{self.id}"


# Tok studiów
class FieldByYear(models.Model):
    id = models.AutoField(primary_key=True)
    field = models.ForeignKey(Field, on_delete=models.CASCADE)
    start_date = models.DateField()
    end_date = models.DateField()
    students = models.ManyToManyField(AppUser)
    semesters = models.ManyToManyField(Semester)

    def __str__(self):
        return f"Kierunek ID-{self.id}: {self.field.name} {str(self.start_date.year)}-{str(self.end_date.year)}"


class Course(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=300)
    field = models.ManyToManyField(Field)
    semester = models.ManyToManyField(Semester)
    ects = models.IntegerField(default=1)
    test_type = models.CharField(max_length=300, default="egzamin")
    description = models.TextField(blank=True, null=True)
    lecturer = models.CharField(max_length=300, blank=True, null=True)
    # place = models.ForeignKey(Building, on_delete=models.CASCADE, blank=True, null=True)
    # room = models.CharField(max_length=300, blank=True, null=True)

    def __str__(self):
        return f"Kurs ID-{self.id}: {self.name}"


class CourseGrade(models.Model):
    subject = models.ForeignKey(Course, on_delete=models.CASCADE)
    grade = models.DecimalField(max_digits=4, decimal_places=2)

    def __str__(self):
        return f"{self.subject.name}: {self.grade}"


class Progress(models.Model):
    id = models.AutoField(primary_key=True)
    all_studies = models.ManyToManyField(FieldByYear)
    current_semesters = models.ManyToManyField(Semester, related_name="current_semesters")
    completed_semesters = models.ManyToManyField(Semester, related_name="completed_semesters")
    grades = models.ManyToManyField(CourseGrade)

    def __str__(self):
        return f"Progress studenta ID-{self.id}"


class Round(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=300)
    field = models.ForeignKey(Field, on_delete=models.CASCADE)
    min_threshold = models.IntegerField(default=0)
    year = models.CharField(blank=True, null=True, max_length=100)

    def __str__(self):
        return f"Tura ID-{self.id}: {self.name} - {self.year}"


# models.py
from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.core.validators import MinLengthValidator

User = get_user_model()


class EmailVerification(models.Model):
    class VerificationType(models.TextChoices):
        REGISTRATION = 'registration', 'Rejestracja konta'
        PASSWORD_RESET = 'password_reset', 'Reset hasła'
        EMAIL_CHANGE = 'email_change', 'Zmiana adresu email'

    user = models.ForeignKey(
        AppUser,
        on_delete=models.CASCADE,
        related_name='email_verifications',
        verbose_name='Użytkownik'
    )
    email = models.EmailField(
        verbose_name='Email do weryfikacji'
    )
    verification_code = models.CharField(
        max_length=6,
        validators=[MinLengthValidator(6)],
        verbose_name='Kod weryfikacyjny'
    )
    verification_type = models.CharField(
        max_length=20,
        choices=VerificationType.choices,
        default=VerificationType.REGISTRATION,
        verbose_name='Typ weryfikacji'
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Data utworzenia'
    )
    expires_at = models.DateTimeField(
        verbose_name='Data wygaśnięcia'
    )
    is_verified = models.BooleanField(
        default=False,
        verbose_name='Czy zweryfikowano'
    )
    verified_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name='Data weryfikacji'
    )

    class Meta:
        verbose_name = 'Weryfikacja email'
        verbose_name_plural = 'Weryfikacje email'
        indexes = [
            models.Index(fields=['email', 'verification_code']),
            models.Index(fields=['expires_at']),
        ]
        ordering = ['-created_at']

    def __str__(self):
        return f'Weryfikacja dla {self.email} ({self.verification_type})'

    def save(self, *args, **kwargs):
        if not self.expires_at:
            self.expires_at = timezone.now() + timezone.timedelta(minutes=15)
        super().save(*args, **kwargs)

    @property
    def is_expired(self):
        return timezone.now() > self.expires_at

    @classmethod
    def verify_code(cls, email, code):
        try:
            verification = cls.objects.get(
                email=email,
                verification_code=code,
                is_verified=False,
                expires_at__gt=timezone.now()
            )
            verification.is_verified = True
            verification.verified_at = timezone.now()
            verification.save()
            return True
        except cls.DoesNotExist:
            return False


EVENT_CHOICES = (
    ("GROUP EVENT", "group event"),
    ("USER EVENT", "user event"),
    ("FIELD EVENT", "field by year event"),
)


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
    type = models.CharField(max_length=300, choices=EVENT_CHOICES, default="USER EVENT")

    def __str__(self):
        return f"Wydarzenie ID-{self.id}: {self.name}"


class Group(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=300)
    fieldByYear = models.ForeignKey(FieldByYear, on_delete=models.CASCADE, blank=True, null=True)
    admin = models.ForeignKey(AppUser, on_delete=models.CASCADE, blank=True, null=True)
    code = models.CharField(max_length=300, default=get_random_string(32))
    isPublic = models.BooleanField(default=False)
    members = models.ManyToManyField(AppUser, related_name="members")
    moderators = models.ManyToManyField(AppUser, related_name="moderators", blank=True)
    recentActivity = models.ManyToManyField(Event, related_name="recentActivity", blank=True)
    rules = models.TextField(blank=True, null=True)
    description = models.TextField(blank=True, null=True, max_length=400)
    limit = models.IntegerField(default=150, blank=True, null=True)
    archived = models.BooleanField(default=False)
    isOfficial = models.BooleanField(default=False)
    date_created = models.DateTimeField(auto_now_add=True)
    coverImage = models.ImageField(blank=True, null=True, upload_to="group_files_cover")
    avatar = models.ImageField(blank=True, null=True, upload_to="group_files_avatar")

    def __str__(self):
        return f"Grupa ID-{self.id}: {self.name}"


NOTIFICATION_CHOICES = (
    ("NORMAL", "normal"),
    ("GROUP INVITATION", "group invitation"),
)


class Notification(models.Model):
    id = models.AutoField(primary_key=True)
    user = models.ForeignKey(AppUser, on_delete=models.CASCADE)
    title = models.CharField(max_length=300)
    isRead = models.BooleanField(default=False)
    message = models.CharField(max_length=1000)
    time_triggered = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)
    type = models.CharField(max_length=100, choices=NOTIFICATION_CHOICES, default="NORMAL")
    group = models.ForeignKey(Group, on_delete=models.CASCADE, blank=True, null=True)
    isAnswered = models.BooleanField(default=False)

    def __str__(self):
        return f"Powiadomienie ID-{self.id}: {self.title}"




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
    group = models.ForeignKey(Group, on_delete=models.CASCADE, blank=True, null=True)
    description = models.TextField(blank=True, null=True, max_length=300)
    date_added = models.DateTimeField(auto_now_add=True)
    verified = models.BooleanField(default=False)
    availability = models.CharField(choices=AVAILABILTY_CHOICES, max_length=20)
    type = models.CharField(max_length=100, default="LINK", choices=SOURCE_TYPE_CHOICES)
    link = models.URLField(blank=True, null=True)
    file = models.FileField(blank=True, null=True, upload_to="files")

    def __str__(self):
        return f"Źródło ID-{self.id}: {self.title}"


ATTACHMENT_TYPE_CHOICES = (
    ("PHOTO", "photo"),
    ("VIDEO", "video"),
)


class Attachment(models.Model):
    id = models.AutoField(primary_key=True)
    file = models.ImageField('Attachment', upload_to='attachments/')
    file_type = models.CharField('File type', choices=ATTACHMENT_TYPE_CHOICES, max_length=10)

    def __str__(self):
        return f"Załącznik {self.file_type} ID-{self.id}"


class News(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=300)
    details = models.TextField(blank=True, null=True, max_length=2000)
    author = models.ForeignKey(AppUser, on_delete=models.CASCADE)
    date_added = models.DateTimeField(auto_now_add=True)
    images = models.ManyToManyField(Attachment)
    links = models.URLField(blank=True, null=True)

    def __str__(self):
        return f"News ID-{self.id}: {self.name}"


class Like(models.Model):
    id = models.AutoField(primary_key=True)
    user = models.ForeignKey(AppUser, on_delete=models.CASCADE)
    value = models.BooleanField(null=True, blank=True)

    def __str__(self):
        return f"Like ID-{self.id}: {self.user.username}"


class Post(models.Model):
    id = models.AutoField(primary_key=True)
    user = models.ForeignKey(AppUser, on_delete=models.CASCADE)
    title = models.CharField(max_length=300)
    group = models.ForeignKey(Group, on_delete=models.CASCADE)
    content = models.TextField(blank=True, null=True)
    likes = models.ManyToManyField(Like)
    created_at = models.DateTimeField(auto_now_add=True)
    images = models.ManyToManyField(Attachment)

    def __str__(self):
        return f"Post ID-{self.id}: {self.title}"


class Comment(models.Model):
    id = models.AutoField(primary_key=True)
    user = models.ForeignKey(AppUser, on_delete=models.CASCADE)
    content = models.TextField(blank=True, null=True)
    likes = models.ManyToManyField(Like)
    created_at = models.DateTimeField(auto_now_add=True)
    visible = models.BooleanField(default=True)
    post = models.ForeignKey(Post, on_delete=models.CASCADE)

    def __str__(self):
        return f"Like ID-{self.id}: {self.user.username}"

