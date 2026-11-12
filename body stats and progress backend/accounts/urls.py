from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    RegisterAPIView,
    LoginAPIView,
    MeAPIView,
    LogoutAPIView,
    ChangePasswordAPIView,
    ForgotPasswordAPIView,
    ResetPasswordAPIView,
    VerifyEmailAPIView,
)

urlpatterns = [

    path(
        "register/",
        RegisterAPIView.as_view(),
        name="register",
    ),

    path(
        "login/",
        LoginAPIView.as_view(),
        name="login",
    ),

    path(
        "me/",
        MeAPIView.as_view(),
        name="me",
    ),

    path(
    "token/refresh/",
    TokenRefreshView.as_view(),
    name="token_refresh",
    ),

    path(
    "logout/",
    LogoutAPIView.as_view(),
    name="logout",
    ),

    path(
    "change-password/",
    ChangePasswordAPIView.as_view(),
    name="change_password",
    ),

    path(
    "forgot-password/",
    ForgotPasswordAPIView.as_view(),
    name="forgot_password",
    ),

    path(
    "reset-password/",
    ResetPasswordAPIView.as_view(),
    name="reset_password",
    ),

    path(
    "verify-email/",
    VerifyEmailAPIView.as_view(),
    name="verify_email",
    ),
]