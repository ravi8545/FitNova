from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from accounts.serializers import ResetPasswordSerializer
from accounts.services.auth_service import reset_password
from accounts.serializers import ChangePasswordSerializer
from accounts.services.auth_service import change_password
from accounts.serializers import ForgotPasswordSerializer
from accounts.services.auth_service import forgot_password
from accounts.serializers import VerifyEmailSerializer
from accounts.services.auth_service import verify_email


class ChangePasswordAPIView(APIView):

    def post(self, request):

        serializer = ChangePasswordSerializer(data=request.data)

        serializer.is_valid(raise_exception=True)

        response = change_password(
            request.user,
            serializer.validated_data,
        )

        return Response(
            response,
            status=status.HTTP_200_OK if response["success"] else status.HTTP_400_BAD_REQUEST,
        )
    

class ForgotPasswordAPIView(APIView):
    authentication_classes = []
    permission_classes = []
        
    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        response = forgot_password(serializer.validated_data)
        return Response(response, status=status.HTTP_200_OK)
    
class ResetPasswordAPIView(APIView):

    authentication_classes = []
    permission_classes = []

    def post(self, request):

        serializer = ResetPasswordSerializer(data=request.data)

        serializer.is_valid(raise_exception=True)

        response = reset_password(serializer.validated_data)

        return Response(
            response,
            status=status.HTTP_200_OK if response["success"] else status.HTTP_400_BAD_REQUEST,
        )
    
class VerifyEmailAPIView(APIView):

    authentication_classes = []
    permission_classes = []

    def post(self, request):

        serializer = VerifyEmailSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        response = verify_email(serializer.validated_data)

        return Response(
            response,
            status=status.HTTP_200_OK if response["success"] else status.HTTP_400_BAD_REQUEST,
        )