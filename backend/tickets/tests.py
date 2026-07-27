from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIRequestFactory, force_authenticate

from tickets.models import Ticket
from tickets.views import TicketDetailView, TicketListCreateView

User = get_user_model()


class TicketAPITestCase(TestCase):
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

    def test_list_tickets_requires_authentication(self):
        request = self.factory.get("/api/tickets/")
        response = TicketListCreateView.as_view()(request)
        self.assertIn(
            response.status_code,
            (status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN),
        )

    def test_list_tickets_returns_tickets(self):
        request = self.factory.get("/api/tickets/")
        force_authenticate(request, user=self.user)
        response = TicketListCreateView.as_view()(request)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["ticket_number"], "TKT-00001")

    def test_create_ticket(self):
        request = self.factory.post(
            "/api/tickets/",
            {
                "title": "VPN not connecting",
                "description": "My VPN client fails every time I try to connect.",
                "category": "it_support",
                "priority": "high",
            },
            format="json",
        )
        force_authenticate(request, user=self.user)
        response = TicketListCreateView.as_view()(request)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["title"], "VPN not connecting")
        self.assertEqual(response.data["created_by"]["username"], "customer1")
        self.assertEqual(Ticket.objects.count(), 2)

    def test_retrieve_ticket(self):
        request = self.factory.get(f"/api/tickets/{self.ticket.pk}/")
        force_authenticate(request, user=self.user)
        response = TicketDetailView.as_view()(request, pk=self.ticket.pk)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["ticket_number"], "TKT-00001")

    def test_update_ticket(self):
        request = self.factory.patch(
            f"/api/tickets/{self.ticket.pk}/",
            {"title": "Updated ticket title here"},
            format="json",
        )
        force_authenticate(request, user=self.user)
        response = TicketDetailView.as_view()(request, pk=self.ticket.pk)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.ticket.refresh_from_db()
        self.assertEqual(self.ticket.title, "Updated ticket title here")

    def test_delete_ticket(self):
        request = self.factory.delete(f"/api/tickets/{self.ticket.pk}/")
        force_authenticate(request, user=self.user)
        response = TicketDetailView.as_view()(request, pk=self.ticket.pk)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Ticket.objects.count(), 0)

    def test_create_ticket_validation_error(self):
        request = self.factory.post(
            "/api/tickets/",
            {"title": "bad", "description": "short"},
            format="json",
        )
        force_authenticate(request, user=self.user)
        response = TicketListCreateView.as_view()(request)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
