from firebase_admin import auth
from rest_framework.authentication import BaseAuthentication
from django.contrib.auth import get_user_model

User = get_user_model()

class FirebaseAuthentication(BaseAuthentication):
    def authenticate(self, request):
        auth_header = request.headers.get('Authorization')

        if not auth_header:
            return None

        parts = auth_header.split(" ")
        if len(parts) != 2:
            return None

        token = parts[1]

        try:
            decoded_token = auth.verify_id_token(
                token,
                clock_skew_seconds=5
            )
            uid = decoded_token['uid']

            user = User.objects.filter(firebase_uid=uid).first()
            if not user:
                return None

            return (user, None)

        except Exception:
            return None