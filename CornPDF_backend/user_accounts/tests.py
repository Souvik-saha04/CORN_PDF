from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.test import TestCase

from utils.firebase_auth import get_user_from_token

User = get_user_model()


class FirebaseAuthTests(TestCase):
    @patch("utils.firebase_auth.firebase_auth.verify_id_token")
    def test_get_user_from_token_creates_user_with_firebase_uid(self, mock_verify_id_token):
        mock_verify_id_token.return_value = {
            "uid": "firebase-123",
            "email": "test@example.com",
        }

        request = type("Req", (), {"headers": {"Authorization": "Bearer fake-token"}})()

        user, error = get_user_from_token(request)

        self.assertIsNone(error)
        self.assertIsNotNone(user)
        self.assertEqual(user.firebase_uid, "firebase-123")
        self.assertEqual(user.email, "test@example.com")
        self.assertEqual(user.username, "firebase-123")
