from django.utils import timezone

from accounts.permissions import is_agent_or_admin
from tickets.models import Ticket


class WorkflowError(Exception):
    """Raised when a ticket status transition is not allowed."""

    def __init__(self, message):
        self.message = message
        super().__init__(message)


# Valid transitions for agents and admins.
AGENT_TRANSITIONS = {
    Ticket.Status.OPEN: {
        Ticket.Status.IN_PROGRESS,
        Ticket.Status.CLOSED,
    },
    Ticket.Status.IN_PROGRESS: {
        Ticket.Status.WAITING_ON_CUSTOMER,
        Ticket.Status.RESOLVED,
        Ticket.Status.CLOSED,
    },
    Ticket.Status.WAITING_ON_CUSTOMER: {
        Ticket.Status.IN_PROGRESS,
    },
    Ticket.Status.RESOLVED: {
        Ticket.Status.CLOSED,
        Ticket.Status.REOPENED,
    },
    Ticket.Status.REOPENED: {
        Ticket.Status.IN_PROGRESS,
    },
    Ticket.Status.CLOSED: {
        Ticket.Status.REOPENED,
    },
}

# Customers may only reopen a resolved or closed ticket.
CUSTOMER_TRANSITIONS = {
    (Ticket.Status.RESOLVED, Ticket.Status.REOPENED),
    (Ticket.Status.CLOSED, Ticket.Status.REOPENED),
}


def get_allowed_transitions(ticket, user):
    """Return the set of statuses the user may transition the ticket to."""
    if is_agent_or_admin(user):
        return AGENT_TRANSITIONS.get(ticket.status, set())

    return {
        new_status
        for current_status, new_status in CUSTOMER_TRANSITIONS
        if current_status == ticket.status
    }


def can_transition(ticket, new_status, user):
    """
    Check whether a status transition is allowed.

    Returns (is_allowed, error_message).
    """
    if ticket.status == new_status:
        return True, None

    allowed_statuses = get_allowed_transitions(ticket, user)
    if new_status not in allowed_statuses:
        return False, (
            f"Cannot transition from '{ticket.status}' to '{new_status}'."
        )
    return True, None


def _apply_transition_timestamps(ticket, new_status):
    """Update resolved_at / closed_at based on the new status."""
    now = timezone.now()

    if new_status == Ticket.Status.RESOLVED:
        ticket.resolved_at = now
    elif new_status == Ticket.Status.CLOSED:
        ticket.closed_at = now
    elif new_status == Ticket.Status.REOPENED:
        ticket.resolved_at = None
        ticket.closed_at = None


def transition(ticket, new_status, user):
    """
    Apply a validated status transition and persist the ticket.

    Raises WorkflowError if the transition is not allowed.
    """
    is_allowed, error_message = can_transition(ticket, new_status, user)
    if not is_allowed:
        raise WorkflowError(error_message)

    if ticket.status == new_status:
        return ticket

    ticket.status = new_status
    _apply_transition_timestamps(ticket, new_status)
    ticket.save()
    return ticket
