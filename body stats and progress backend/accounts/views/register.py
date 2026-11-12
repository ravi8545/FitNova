from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from accounts.services.auth_service import register_user

from accounts.serializers import RegisterSerializer


class RegisterAPIView(APIView):

    permission_classes = [AllowAny]

    def post(self, request):

        serializer = RegisterSerializer(data=request.data)

        if serializer.is_valid():

            user = register_user(
                serializer.validated_data
                )

            return Response(

                {

                    "success": True,

                    "message": "Account created successfully.",

                    "data": {

                        "id": user.id,

                        "email": user.email,

                        "first_name": user.first_name,

                    },

                },

                status=status.HTTP_201_CREATED,

            )

        return Response(

            {

                "success": False,

                "errors": serializer.errors,

            },

            status=status.HTTP_400_BAD_REQUEST,

        )