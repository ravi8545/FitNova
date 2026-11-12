def update_profile(user, validated_data):

    for field, value in validated_data.items():
        setattr(user, field, value)

    user.save()

    return user