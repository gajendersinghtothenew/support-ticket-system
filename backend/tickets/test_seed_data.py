from io import StringIO

from django.core.management import call_command
from django.test import TestCase

from accounts.models import UserProfile
from comments.models import Comment
from tickets.models import Ticket


class SeedDataCommandTestCase(TestCase):
    def test_seed_data_creates_sample_records(self):
        out = StringIO()
        call_command("seed_data", stdout=out)

        self.assertEqual(
            UserProfile.objects.filter(
                role__in=[
                    UserProfile.Role.CUSTOMER,
                    UserProfile.Role.AGENT,
                    UserProfile.Role.ADMIN,
                ]
            ).count(),
            6,
        )
        self.assertGreaterEqual(Ticket.objects.count(), 6)
        self.assertGreaterEqual(Comment.objects.count(), 10)
        self.assertTrue(Ticket.objects.filter(status=Ticket.Status.OPEN).exists())
        self.assertTrue(Ticket.objects.filter(status=Ticket.Status.CLOSED).exists())

    def test_seed_data_clear_recreates_records(self):
        call_command("seed_data", stdout=StringIO())
        initial_ticket_count = Ticket.objects.count()

        call_command("seed_data", "--clear", stdout=StringIO())

        self.assertEqual(Ticket.objects.count(), initial_ticket_count)
        self.assertTrue(Ticket.objects.filter(status=Ticket.Status.OPEN).exists())
