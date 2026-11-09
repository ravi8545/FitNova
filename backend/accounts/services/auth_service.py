from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.core.exceptions import ValidationError
from django.utils.encoding import force_bytes, force_str
from django.utils.http import (
    urlsafe_base64_decode,
    urlsafe_base64_encode,
)

from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import RefreshToken

from accounts.services.email_service import send_html_email

User = get_user_model()


def register_user(validated_data):

    validated_data.pop("confirm_password")
    password = validated_data.pop("password")

    user = User.objects.create_user(
        password=password,
        **validated_data
    )

    uid = urlsafe_base64_encode(force_bytes(user.pk))
    token = PasswordResetTokenGenerator().make_token(user)

    verification_link = (
        f"{settings.FRONTEND_URL}/verify-email/{uid}/{token}/"
    )

    send_html_email(
        subject="Verify your FitNova account",
        template_name="emails/verify_email.html",
        context={
            "user": user,
            "verification_link": verification_link,
        },
        recipient=user.email,
    )

    return user


def verify_email(validated_data):

    try:
        uid = force_str(
            urlsafe_base64_decode(validated_data["uid"])
        )

        user = User.objects.get(pk=uid)

    except Exception:
        return {
            "success": False,
            "message": "Invalid verification link."
        }

    token_generator = PasswordResetTokenGenerator()

    if not token_generator.check_token(user, validated_data["token"]):
        return {
            "success": False,
            "message": "Verification link is invalid or expired."
        }

    if user.is_email_verified:
        return {
            "success": True,
            "message": "Email is already verified."
        }

    user.is_email_verified = True
    user.save(update_fields=["is_email_verified"])

    return {
        "success": True,
        "message": "Email verified successfully."
    }

def login_user(user):

    refresh = RefreshToken.for_user(user)

    return {

        "success": True,

        "message": "Login successful.",

        "user": {

            "id": user.id,

            "email": user.email,

            "first_name": user.first_name,

            "last_name": user.last_name,

            "is_email_verified": user.is_email_verified,

        },

        "tokens": {

            "access": str(refresh.access_token),

            "refresh": str(refresh),

        }

    }

def logout_user(refresh_token):

    try:

        token = RefreshToken(refresh_token)

        token.blacklist()

        return {
            "success": True,
            "message": "Logged out successfully."
        }

    except TokenError:

        return {
            "success": False,
            "message": "Token is already blacklisted or invalid."
        }
    

def change_password(user, validated_data):

    if not user.check_password(validated_data["old_password"]):

        return {
            "success": False,
            "message": "Old password is incorrect."
        }
    
    validate_password(validated_data["new_password"], user)
    
    user.set_password(validated_data["new_password"])
    
    user.save()
    
    return {
        "success": True,
        "message": "Password changed successfully."
    }


def forgot_password(validated_data):
    email = validated_data["email"]

    try:
        user = User.objects.get(email=email)

        uid = urlsafe_base64_encode(force_bytes(user.pk))

        token = PasswordResetTokenGenerator().make_token(user)

        reset_link = (
            f"{settings.FRONTEND_URL}"
            f"/reset-password/{uid}/{token}/"
        )

        send_html_email(
            subject="Reset your FitNova password",
            template_name="emails/forgot_password.html",
            context={
                "user": user,
                "reset_link": reset_link,
            },
            recipient=user.email,
        )

    except User.DoesNotExist:
        # Don't reveal whether the email exists
        pass

    return {
        "success": True,
        "message": (
            "If an account with that email exists, "
            "a password reset link has been sent."
        ),
    }

def reset_password(validated_data):

    try:
        uid = force_str(
            urlsafe_base64_decode(validated_data["uid"])
        )

        user = User.objects.get(pk=uid)

    except Exception:
        return {
            "success": False,
            "message": "Invalid reset link."
        }

    token_generator = PasswordResetTokenGenerator()

    if not token_generator.check_token(user, validated_data["token"]):
        return {
            "success": False,
            "message": "Reset link has expired or is invalid."
        }

    validate_password(validated_data["new_password"], user)

    user.set_password(validated_data["new_password"])
    user.save()

    return {
        "success": True,
        "message": "Password reset successfully."
    }