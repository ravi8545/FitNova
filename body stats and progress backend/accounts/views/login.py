from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from accounts.services.auth_service import login_user

from accounts.serializers import LoginSerializer


class LoginAPIView(APIView):

    permission_classes = [AllowAny]

    def post(self, request):

        serializer = LoginSerializer(data=request.data)

        if serializer.is_valid():

            user = serializer.validated_data["user"]


            response = login_user(user)
            
            return Response(
                response,
                status=status.HTTP_200_OK
                )

        return Response(

            {

                "success": False,
                "errors": serializer.errors,

            },

            status=status.HTTP_400_BAD_REQUEST

        )