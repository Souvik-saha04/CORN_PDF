from firebase_admin import auth as firebase_auth
from django.contrib.auth import get_user_model

User = get_user_model()


def get_or_create_user_from_firebase(decoded_token):
    uid = decoded_token.get("uid")
    email = decoded_token.get("email", "")
    username = uid or email or "firebase-user"

    user, created = User.objects.get_or_create(
        firebase_uid=uid,
        defaults={"username": username, "email": email},
    )

    if not created:
        updated = False
        if user.email != email:
            user.email = email
            updated = True
        if user.username != username:
            user.username = username
            updated = True
        if updated:
            user.save(update_fields=["email", "username"])

    return user


def get_user_from_token(request):
    auth_header = request.headers.get("Authorization")

    if not auth_header:
        return None, "No token provided"

    try:
        token = auth_header.split(" ")[1]
        decoded_token = firebase_auth.verify_id_token(token)
        user = get_or_create_user_from_firebase(decoded_token)
        return user, None

    except Exception as e:
        return None, str(e)