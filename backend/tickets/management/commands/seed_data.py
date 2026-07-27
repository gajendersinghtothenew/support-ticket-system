from datetime import timedelta

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from accounts.models import UserProfile
from comments.models import Comment
from tickets.models import Ticket

User = get_user_model()

SEED_USERNAMES = {
    "customer_alice",
    "customer_bob",
    "customer_carol",
    "agent_sarah",
    "agent_mike",
    "admin_diana",
}

DEFAULT_PASSWORD = "password123"


class Command(BaseCommand):
    help = "Create sample users, tickets, and comments for development and testing."

    def add_arguments(self, parser):
        parser.add_argument(
            "--clear",
            action="store_true",
            help="Delete existing seed data before creating new records.",
        )

    def handle(self, *args, **options):
        with transaction.atomic():
            if options["clear"]:
                self._clear_seed_data()

            users = self._create_users()
            tickets = self._create_tickets(users)
            comment_count = self._create_comments(users, tickets)

        self.stdout.write(self.style.SUCCESS("Seed data created successfully."))
        self.stdout.write(f"Users: {len(users)}")
        self.stdout.write(f"Tickets: {len(tickets)}")
        self.stdout.write(f"Comments: {comment_count}")
        self.stdout.write(f"Default password for seed users: {DEFAULT_PASSWORD}")

    def _clear_seed_data(self):
        deleted_tickets, _ = Ticket.objects.filter(
            created_by__username__in=SEED_USERNAMES
        ).delete()
        deleted_users, _ = User.objects.filter(username__in=SEED_USERNAMES).delete()
        self.stdout.write(
            self.style.WARNING(
                f"Cleared {deleted_users} seed users and related records "
                f"({deleted_tickets} objects deleted in total)."
            )
        )

    def _create_users(self):
        user_specs = [
            ("customer_alice", "alice@example.com", UserProfile.Role.CUSTOMER),
            ("customer_bob", "bob@example.com", UserProfile.Role.CUSTOMER),
            ("customer_carol", "carol@example.com", UserProfile.Role.CUSTOMER),
            ("agent_sarah", "sarah@example.com", UserProfile.Role.AGENT),
            ("agent_mike", "mike@example.com", UserProfile.Role.AGENT),
            ("admin_diana", "diana@example.com", UserProfile.Role.ADMIN),
        ]

        users = {}
        for username, email, role in user_specs:
            user, created = User.objects.get_or_create(
                username=username,
                defaults={"email": email},
            )
            if created:
                user.set_password(DEFAULT_PASSWORD)
                user.save()
            user.profile.role = role
            user.profile.save(update_fields=["role"])
            users[username] = user
            action = "Created" if created else "Updated"
            self.stdout.write(f"{action} user: {username} ({role})")

        return users

    def _create_tickets(self, users):
        now = timezone.now()
        ticket_specs = [
            {
                "title": "Cannot connect to VPN",
                "description": (
                    "My VPN client fails with a timeout whenever I try to connect "
                    "from home. This started after the latest Windows update."
                ),
                "status": Ticket.Status.OPEN,
                "priority": Ticket.Priority.HIGH,
                "category": Ticket.Category.IT_SUPPORT,
                "created_by": users["customer_alice"],
                "assigned_to": None,
                "resolved_at": None,
                "closed_at": None,
            },
            {
                "title": "Need access to shared drive",
                "description": (
                    "I need read/write access to the Finance shared drive for "
                    "month-end reporting."
                ),
                "status": Ticket.Status.IN_PROGRESS,
                "priority": Ticket.Priority.MEDIUM,
                "category": Ticket.Category.ACCESS,
                "created_by": users["customer_bob"],
                "assigned_to": users["agent_sarah"],
                "resolved_at": None,
                "closed_at": None,
            },
            {
                "title": "Payroll deduction question",
                "description": (
                    "There is an unexpected deduction on my latest payslip and I "
                    "need clarification from HR."
                ),
                "status": Ticket.Status.WAITING_ON_CUSTOMER,
                "priority": Ticket.Priority.LOW,
                "category": Ticket.Category.HR,
                "created_by": users["customer_carol"],
                "assigned_to": users["agent_mike"],
                "resolved_at": None,
                "closed_at": None,
            },
            {
                "title": "Admin panel permission error",
                "description": (
                    "I receive a 403 error when trying to open the user management "
                    "section in the admin panel."
                ),
                "status": Ticket.Status.RESOLVED,
                "priority": Ticket.Priority.URGENT,
                "category": Ticket.Category.ADMIN_ISSUE,
                "created_by": users["customer_alice"],
                "assigned_to": users["agent_sarah"],
                "resolved_at": now - timedelta(days=1),
                "closed_at": None,
            },
            {
                "title": "Email sync stopped working",
                "description": (
                    "Outlook stopped syncing new emails on my laptop. I already "
                    "restarted the application once."
                ),
                "status": Ticket.Status.REOPENED,
                "priority": Ticket.Priority.HIGH,
                "category": Ticket.Category.IT_SUPPORT,
                "created_by": users["customer_bob"],
                "assigned_to": users["agent_mike"],
                "resolved_at": None,
                "closed_at": None,
            },
            {
                "title": "Badge access request completed",
                "description": (
                    "Request to activate building access for a new contractor was "
                    "processed last week."
                ),
                "status": Ticket.Status.CLOSED,
                "priority": Ticket.Priority.MEDIUM,
                "category": Ticket.Category.ACCESS,
                "created_by": users["customer_carol"],
                "assigned_to": users["agent_sarah"],
                "resolved_at": now - timedelta(days=5),
                "closed_at": now - timedelta(days=3),
            },
        ]

        tickets = []
        for spec in ticket_specs:
            ticket, created = Ticket.objects.get_or_create(
                title=spec["title"],
                created_by=spec["created_by"],
                defaults={
                    "description": spec["description"],
                    "status": spec["status"],
                    "priority": spec["priority"],
                    "category": spec["category"],
                    "assigned_to": spec["assigned_to"],
                    "resolved_at": spec["resolved_at"],
                    "closed_at": spec["closed_at"],
                },
            )
            if not created:
                ticket.description = spec["description"]
                ticket.status = spec["status"]
                ticket.priority = spec["priority"]
                ticket.category = spec["category"]
                ticket.assigned_to = spec["assigned_to"]
                ticket.resolved_at = spec["resolved_at"]
                ticket.closed_at = spec["closed_at"]
                ticket.save()

            tickets.append(ticket)
            action = "Created" if created else "Updated"
            self.stdout.write(f"{action} ticket: {ticket.ticket_number} ({ticket.status})")

        return tickets

    def _create_comments(self, users, tickets):
        comment_specs = [
            (tickets[0], users["customer_alice"], "I need this fixed before Monday's remote work day.", False),
            (tickets[0], users["agent_sarah"], "Checked logs — likely certificate issue. Investigating.", True),
            (tickets[1], users["customer_bob"], "Please grant access to the Q3 reporting folder as well.", False),
            (tickets[1], users["agent_sarah"], "Access request submitted to IT security for approval.", False),
            (tickets[2], users["agent_mike"], "Can you confirm the deduction code shown on line 4?", False),
            (tickets[2], users["agent_mike"], "Payroll team says they need a copy of the payslip.", True),
            (tickets[3], users["customer_alice"], "Thank you, I can access the section now.", False),
            (tickets[3], users["agent_sarah"], "Permissions were updated in the admin role group.", False),
            (tickets[4], users["customer_bob"], "The issue came back after working for one day.", False),
            (tickets[4], users["agent_mike"], "Reopening ticket and checking mail server sync logs.", False),
            (tickets[4], users["agent_mike"], "Found stale Outlook profile cache on the device.", True),
            (tickets[5], users["customer_carol"], "Contractor confirmed badge is working. Thanks!", False),
            (tickets[5], users["agent_sarah"], "Closing ticket — access verified with security.", False),
        ]

        created_count = 0
        for ticket, author, body, is_internal in comment_specs:
            _, created = Comment.objects.get_or_create(
                ticket=ticket,
                author=author,
                body=body,
                defaults={"is_internal": is_internal},
            )
            if created:
                created_count += 1

        self.stdout.write(f"Created {created_count} new comments.")
        return Comment.objects.filter(ticket__in=tickets).count()
