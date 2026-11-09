from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.serializers import LogoutSerializer
from accounts.services.auth_service import logout_user


class LogoutAPIView(APIView):

    def post(self, request):

        serializer = LogoutSerializer(data=request.data)

        serializer.is_valid(raise_exception=True)

        response = logout_user(
            serializer.validated_data["refresh"]
        )

        return Response(
            response,
            status=status.HTTP_200_OK
        )