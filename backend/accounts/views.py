from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers.register import RegisterSerializer


class RegisterAPIView(APIView):

    permission_classes = []

    def post(self, request):

        serializer = RegisterSerializer(data=request.data)

        if serializer.is_valid():

            user = serializer.save()

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