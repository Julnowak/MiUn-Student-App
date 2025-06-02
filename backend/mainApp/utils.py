import random
from django.core.mail import send_mail
from django.conf import settings
from .models import VerificationCode
from django.utils import timezone

def generate_verification_code():
    return f"{random.randint(100000, 999999)}"

def send_verification_email(user, student_id):
    code = generate_verification_code()

    # Save the code to the database
    VerificationCode.objects.create(user=user, student_id=student_id, code=code)

    # Simulated email sending (no actual sending)
    email = f"{student_id}@student.agh.edu.pl"
    subject = "Your Verification Code"
    message = f"Your verification code is: {code}\nIt is valid for 1 hour."

    # Uncomment the following line only if email settings configured:
    # send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [email])

    return code  # <-- Important: return the code directly


