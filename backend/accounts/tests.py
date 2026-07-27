from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.test import APITestCase

from accounts.models import UserProfile

User = get_user_model()


class AuthAPITestCase(APITestCase):
    def test_register_returns_token_and_user(self):
        response = self.client.post(
            reverse("accounts:register"),
            {
                "username": "newuser",
                "email": "newuser@example.com",
                "password": "testpass123",
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn("token", response.data)
        self.assertEqual(response.data["user"]["role"], UserProfile.Role.CUSTOMER)
        self.assertTrue(Token.objects.filter(user__username="newuser").exists())

    def test_login_returns_token(self):
        User.objects.create_user(
            username="loginuser",
            email="loginuser@example.com",
            password="testpass123",
        )
        response = self.client.post(
            reverse("accounts:login"),
            {"username": "loginuser", "password": "testpass123"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("token", response.data)

    def test_me_requires_authentication(self):
        response = self.client.get(reverse("accounts:me"))
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_me_returns_current_user(self):
        user = User.objects.create_user(
            username="meuser",
            email="meuser@example.com",
            password="testpass123",
        )
        self.client.force_authenticate(user=user)
        response = self.client.get(reverse("accounts:me"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["username"], "meuser")
