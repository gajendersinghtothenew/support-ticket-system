from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIRequestFactory, force_authenticate

from accounts.models import UserProfile
from tickets.models import Ticket
from tickets.views import TicketDetailView, TicketListCreateView, TicketStatsView

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


class TicketAPITestCase(TestCase):
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

    def test_list_tickets_requires_authentication(self):
        request = self.factory.get("/api/tickets/")
        response = TicketListCreateView.as_view()(request)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_list_tickets_returns_only_own_tickets_for_customer(self):
        Ticket.objects.create(
            title="Another customer issue",
            description="This ticket belongs to a different customer account.",
            created_by=self.other_user,
        )
        request = self.factory.get("/api/tickets/")
        force_authenticate(request, user=self.user)
        response = TicketListCreateView.as_view()(request)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["ticket_number"], "TKT-00001")

    def test_agent_can_list_all_tickets(self):
        Ticket.objects.create(
            title="Another customer issue",
            description="This ticket belongs to a different customer account.",
            created_by=self.other_user,
        )
        request = self.factory.get("/api/tickets/")
        force_authenticate(request, user=self.agent)
        response = TicketListCreateView.as_view()(request)
        self.assertEqual(response.data["count"], 2)

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
        self.assertEqual(response.data["created_by"]["username"], "customer1")

    def test_customer_cannot_retrieve_other_users_ticket(self):
        other_ticket = Ticket.objects.create(
            title="Private customer issue",
            description="This ticket belongs to another customer account.",
            created_by=self.other_user,
        )
        request = self.factory.get(f"/api/tickets/{other_ticket.pk}/")
        force_authenticate(request, user=self.user)
        response = TicketDetailView.as_view()(request, pk=other_ticket.pk)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_retrieve_ticket(self):
        request = self.factory.get(f"/api/tickets/{self.ticket.pk}/")
        force_authenticate(request, user=self.user)
        response = TicketDetailView.as_view()(request, pk=self.ticket.pk)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_update_ticket(self):
        request = self.factory.patch(
            f"/api/tickets/{self.ticket.pk}/",
            {"title": "Updated ticket title here"},
            format="json",
        )
        force_authenticate(request, user=self.user)
        response = TicketDetailView.as_view()(request, pk=self.ticket.pk)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_customer_cannot_delete_ticket(self):
        request = self.factory.delete(f"/api/tickets/{self.ticket.pk}/")
        force_authenticate(request, user=self.user)
        response = TicketDetailView.as_view()(request, pk=self.ticket.pk)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(Ticket.objects.count(), 1)

    def test_agent_can_delete_ticket(self):
        request = self.factory.delete(f"/api/tickets/{self.ticket.pk}/")
        force_authenticate(request, user=self.agent)
        response = TicketDetailView.as_view()(request, pk=self.ticket.pk)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Ticket.objects.count(), 0)

    def test_invalid_status_transition_returns_400(self):
        request = self.factory.patch(
            f"/api/tickets/{self.ticket.pk}/",
            {"status": Ticket.Status.RESOLVED},
            format="json",
        )
        force_authenticate(request, user=self.agent)
        response = TicketDetailView.as_view()(request, pk=self.ticket.pk)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("status", response.data)

    def test_valid_status_transition_updates_ticket(self):
        request = self.factory.patch(
            f"/api/tickets/{self.ticket.pk}/",
            {"status": Ticket.Status.IN_PROGRESS},
            format="json",
        )
        force_authenticate(request, user=self.agent)
        response = TicketDetailView.as_view()(request, pk=self.ticket.pk)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.ticket.refresh_from_db()
        self.assertEqual(self.ticket.status, Ticket.Status.IN_PROGRESS)

    def test_filter_tickets_by_status(self):
        self.ticket.status = Ticket.Status.IN_PROGRESS
        self.ticket.save(update_fields=["status"])
        request = self.factory.get("/api/tickets/?status=in_progress")
        force_authenticate(request, user=self.agent)
        response = TicketListCreateView.as_view()(request)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 1)

    def test_search_tickets_by_title(self):
        request = self.factory.get("/api/tickets/?search=email")
        force_authenticate(request, user=self.agent)
        response = TicketListCreateView.as_view()(request)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 1)

    def test_filter_tickets_by_priority(self):
        self.ticket.priority = Ticket.Priority.HIGH
        self.ticket.save(update_fields=["priority"])
        request = self.factory.get("/api/tickets/?priority=high")
        force_authenticate(request, user=self.agent)
        response = TicketListCreateView.as_view()(request)
        self.assertEqual(response.data["count"], 1)

    def test_ticket_stats_for_customer(self):
        request = self.factory.get("/api/tickets/stats/")
        force_authenticate(request, user=self.user)
        response = TicketStatsView.as_view()(request)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["total"], 1)
        self.assertEqual(response.data["by_status"]["open"], 1)
        self.assertIn("recent_tickets", response.data)
        self.assertNotIn("assigned_to_me", response.data)

    def test_ticket_stats_for_agent(self):
        request = self.factory.get("/api/tickets/stats/")
        force_authenticate(request, user=self.agent)
        response = TicketStatsView.as_view()(request)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("assigned_to_me", response.data)
        self.assertIn("unassigned", response.data)
        self.assertIn("urgent_open", response.data)
