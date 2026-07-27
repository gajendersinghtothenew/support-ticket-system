from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIRequestFactory, force_authenticate

from comments.models import Comment
from comments.views import CommentDetailView, CommentListCreateView
from tickets.models import Ticket

User = get_user_model()


class CommentAPITestCase(TestCase):
    def setUp(self):
        self.factory = APIRequestFactory()
        self.user = User.objects.create_user(
            username="customer1",
            email="customer1@example.com",
            password="testpass123",
        )
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

    def test_list_comments(self):
        request = self.factory.get("/api/comments/")
        response = CommentListCreateView.as_view()(request)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["body"], self.comment.body)

    def test_list_comments_filtered_by_ticket(self):
        request = self.factory.get(f"/api/comments/?ticket={self.ticket.pk}")
        response = CommentListCreateView.as_view()(request)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 1)

        other_ticket = Ticket.objects.create(
            title="Another issue here",
            description="This is a separate ticket for filter testing.",
            created_by=self.user,
        )
        request = self.factory.get(f"/api/comments/?ticket={other_ticket.pk}")
        response = CommentListCreateView.as_view()(request)
        self.assertEqual(response.data["count"], 0)

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
        self.assertEqual(response.data["author"]["username"], "customer1")
        self.assertEqual(Comment.objects.count(), 2)

    def test_create_comment_requires_ticket(self):
        request = self.factory.post(
            "/api/comments/",
            {"body": "Missing ticket reference in this request."},
            format="json",
        )
        force_authenticate(request, user=self.user)
        response = CommentListCreateView.as_view()(request)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_retrieve_comment(self):
        request = self.factory.get(f"/api/comments/{self.comment.pk}/")
        response = CommentDetailView.as_view()(request, pk=self.comment.pk)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["ticket_number"], "TKT-00001")

    def test_update_comment(self):
        request = self.factory.patch(
            f"/api/comments/{self.comment.pk}/",
            {"body": "Updated comment body for this ticket."},
            format="json",
        )
        response = CommentDetailView.as_view()(request, pk=self.comment.pk)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.comment.refresh_from_db()
        self.assertEqual(self.comment.body, "Updated comment body for this ticket.")

    def test_delete_comment(self):
        request = self.factory.delete(f"/api/comments/{self.comment.pk}/")
        response = CommentDetailView.as_view()(request, pk=self.comment.pk)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Comment.objects.count(), 0)
