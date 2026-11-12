from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.serializers import (
    UserProfileSerializer,
    UpdateProfileSerializer,
)
from accounts.services.profile_service import update_profile


class MeAPIView(APIView):

    def get(self, request):

        serializer = UserProfileSerializer(request.user)

        return Response(
            {
                "success": True,
                "data": serializer.data,
            },
            status=status.HTTP_200_OK,
        )

    def patch(self, request):

        serializer = UpdateProfileSerializer(
            request.user,
            data=request.data,
            partial=True,
        )

        serializer.is_valid(raise_exception=True)

        user = update_profile(
            request.user,
            serializer.validated_data,
        )

        return Response(
            {
                "success": True,
                "message": "Profile updated successfully.",
                "data": UserProfileSerializer(user).data,
            },
            status=status.HTTP_200_OK,
        )