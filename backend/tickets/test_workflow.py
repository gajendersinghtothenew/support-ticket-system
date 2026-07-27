from django.contrib.auth import get_user_model
from django.test import TestCase
from django.utils import timezone

from accounts.models import UserProfile
from tickets.models import Ticket
from tickets.services.workflow import (
    WorkflowError,
    can_transition,
    get_allowed_transitions,
    transition,
)

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


class TicketWorkflowTestCase(TestCase):
    def setUp(self):
        self.customer = create_user("customer1")
        self.agent = create_user("agent1", role=UserProfile.Role.AGENT)
        self.ticket = Ticket.objects.create(
            title="Cannot access email",
            description="I am unable to log into my corporate email account.",
            created_by=self.customer,
        )

    def test_open_ticket_can_move_to_in_progress(self):
        is_allowed, _ = can_transition(
            self.ticket,
            Ticket.Status.IN_PROGRESS,
            self.agent,
        )
        self.assertTrue(is_allowed)

    def test_open_ticket_cannot_move_directly_to_resolved(self):
        is_allowed, error = can_transition(
            self.ticket,
            Ticket.Status.RESOLVED,
            self.agent,
        )
        self.assertFalse(is_allowed)
        self.assertIn("Cannot transition", error)

    def test_closed_ticket_cannot_move_directly_to_in_progress(self):
        self.ticket.status = Ticket.Status.CLOSED
        self.ticket.save(update_fields=["status"])
        is_allowed, _ = can_transition(
            self.ticket,
            Ticket.Status.IN_PROGRESS,
            self.agent,
        )
        self.assertFalse(is_allowed)

    def test_agent_transition_sets_resolved_timestamp(self):
        self.ticket.status = Ticket.Status.IN_PROGRESS
        self.ticket.save(update_fields=["status"])

        transition(self.ticket, Ticket.Status.RESOLVED, self.agent)

        self.ticket.refresh_from_db()
        self.assertEqual(self.ticket.status, Ticket.Status.RESOLVED)
        self.assertIsNotNone(self.ticket.resolved_at)

    def test_agent_transition_sets_closed_timestamp(self):
        transition(self.ticket, Ticket.Status.CLOSED, self.agent)

        self.ticket.refresh_from_db()
        self.assertEqual(self.ticket.status, Ticket.Status.CLOSED)
        self.assertIsNotNone(self.ticket.closed_at)

    def test_reopen_clears_resolution_timestamps(self):
        self.ticket.status = Ticket.Status.RESOLVED
        self.ticket.resolved_at = timezone.now()
        self.ticket.closed_at = timezone.now()
        self.ticket.save()

        transition(self.ticket, Ticket.Status.REOPENED, self.agent)

        self.ticket.refresh_from_db()
        self.assertEqual(self.ticket.status, Ticket.Status.REOPENED)
        self.assertIsNone(self.ticket.resolved_at)
        self.assertIsNone(self.ticket.closed_at)

    def test_customer_can_reopen_resolved_ticket(self):
        self.ticket.status = Ticket.Status.RESOLVED
        self.ticket.save(update_fields=["status"])

        transition(self.ticket, Ticket.Status.REOPENED, self.customer)

        self.ticket.refresh_from_db()
        self.assertEqual(self.ticket.status, Ticket.Status.REOPENED)

    def test_customer_cannot_move_open_ticket_to_in_progress(self):
        with self.assertRaises(WorkflowError):
            transition(self.ticket, Ticket.Status.IN_PROGRESS, self.customer)

    def test_customer_allowed_transitions_are_limited(self):
        allowed = get_allowed_transitions(self.ticket, self.customer)
        self.assertEqual(allowed, set())

        self.ticket.status = Ticket.Status.RESOLVED
        allowed = get_allowed_transitions(self.ticket, self.customer)
        self.assertEqual(allowed, {Ticket.Status.REOPENED})

    def test_waiting_on_customer_can_return_to_in_progress(self):
        self.ticket.status = Ticket.Status.WAITING_ON_CUSTOMER
        self.ticket.save(update_fields=["status"])

        transition(self.ticket, Ticket.Status.IN_PROGRESS, self.agent)

        self.ticket.refresh_from_db()
        self.assertEqual(self.ticket.status, Ticket.Status.IN_PROGRESS)
