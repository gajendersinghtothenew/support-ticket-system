from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIRequestFactory, force_authenticate

from accounts.models import UserProfile
from comments.models import Comment
from comments.views import CommentDetailView, CommentListCreateView
from tickets.models import Ticket

User = get_user_model()


def create_user(username, role=UserProfile.Role.CUSTOMER):
    user = User.objects.create_user(
        username=username,
        email=f"{username}@example.com",
        password="testpass123",
    )
    user.profile.role = role
    user.profile.save(update_fields=["role"])
    return user


class CommentAPITestCase(TestCase):
    def setUp(self):
        self.factory = APIRequestFactory()
        self.user = create_user("customer1")
        self.other_user = create_user("customer2")
        self.agent = create_user("agent1", role=UserProfile.Role.AGENT)
        self.ticket = Ticket.objects.create(
            title="Cannot access email",
            description="I am unable to log into my corporate email account.",
            created_by=self.user,
        )
        self.comment = Comment.objects.create(
            ticket=self.ticket,
            author=self.user,
            body="This issue started after the password reset.",
        )
        self.internal_comment = Comment.objects.create(
            ticket=self.ticket,
            author=self.agent,
            body="Internal troubleshooting notes for the support team.",
            is_internal=True,
        )

    def test_list_comments_requires_authentication(self):
        request = self.factory.get("/api/comments/")
        response = CommentListCreateView.as_view()(request)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_customer_cannot_see_internal_comments(self):
        request = self.factory.get("/api/comments/")
        force_authenticate(request, user=self.user)
        response = CommentListCreateView.as_view()(request)
        self.assertEqual(response.data["count"], 1)
        self.assertFalse(
            any(item["is_internal"] for item in response.data["results"])
        )

    def test_agent_can_see_internal_comments(self):
        request = self.factory.get("/api/comments/")
        force_authenticate(request, user=self.agent)
        response = CommentListCreateView.as_view()(request)
        self.assertEqual(response.data["count"], 2)

    def test_create_comment(self):
        request = self.factory.post(
            "/api/comments/",
            {
                "ticket": self.ticket.pk,
                "body": "I have tried clearing my browser cache.",
            },
            format="json",
        )
        force_authenticate(request, user=self.user)
        response = CommentListCreateView.as_view()(request)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_customer_cannot_comment_on_other_users_ticket(self):
        other_ticket = Ticket.objects.create(
            title="Private customer issue",
            description="This ticket belongs to another customer account.",
            created_by=self.other_user,
        )
        request = self.factory.post(
            "/api/comments/",
            {
                "ticket": other_ticket.pk,
                "body": "Trying to comment on someone else's ticket.",
            },
            format="json",
        )
        force_authenticate(request, user=self.user)
        response = CommentListCreateView.as_view()(request)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_customer_cannot_create_internal_comment(self):
        request = self.factory.post(
            "/api/comments/",
            {
                "ticket": self.ticket.pk,
                "body": "Attempting to create an internal note.",
                "is_internal": True,
            },
            format="json",
        )
        force_authenticate(request, user=self.user)
        response = CommentListCreateView.as_view()(request)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_retrieve_comment(self):
        request = self.factory.get(f"/api/comments/{self.comment.pk}/")
        force_authenticate(request, user=self.user)
        response = CommentDetailView.as_view()(request, pk=self.comment.pk)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_customer_cannot_retrieve_internal_comment(self):
        request = self.factory.get(f"/api/comments/{self.internal_comment.pk}/")
        force_authenticate(request, user=self.user)
        response = CommentDetailView.as_view()(request, pk=self.internal_comment.pk)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_update_comment(self):
        request = self.factory.patch(
            f"/api/comments/{self.comment.pk}/",
            {"body": "Updated comment body for this ticket."},
            format="json",
        )
        force_authenticate(request, user=self.user)
        response = CommentDetailView.as_view()(request, pk=self.comment.pk)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_delete_comment(self):
        request = self.factory.delete(f"/api/comments/{self.comment.pk}/")
        force_authenticate(request, user=self.user)
        response = CommentDetailView.as_view()(request, pk=self.comment.pk)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
