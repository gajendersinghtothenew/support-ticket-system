from django.db.models import Count

from tickets.models import Ticket


ACTIVE_STATUSES = (
    Ticket.Status.OPEN,
    Ticket.Status.IN_PROGRESS,
    Ticket.Status.WAITING_ON_CUSTOMER,
    Ticket.Status.REOPENED,
)


def _counts_by_choice(queryset, field_name, choices):
    counts = {value: 0 for value, _ in choices}
    for row in queryset.values(field_name).annotate(count=Count("id")):
        counts[row[field_name]] = row["count"]
    return counts


def build_ticket_stats(queryset, user, is_staff):
    total = queryset.count()
    by_status = _counts_by_choice(queryset, "status", Ticket.Status.choices)
    by_priority = _counts_by_choice(queryset, "priority", Ticket.Priority.choices)

    stats = {
        "total": total,
        "by_status": by_status,
        "by_priority": by_priority,
        "open_pipeline": sum(by_status[status] for status in ACTIVE_STATUSES),
    }

    if is_staff:
        stats["assigned_to_me"] = queryset.filter(assigned_to=user).count()
        stats["unassigned"] = queryset.filter(
            assigned_to__isnull=True,
            status__in=ACTIVE_STATUSES,
        ).count()
        stats["urgent_open"] = queryset.filter(
            priority__in=(Ticket.Priority.URGENT, Ticket.Priority.HIGH),
            status__in=ACTIVE_STATUSES,
        ).count()
    else:
        stats["needs_attention"] = by_status.get(Ticket.Status.WAITING_ON_CUSTOMER, 0)
        stats["active"] = sum(
            by_status[status]
            for status in (
                Ticket.Status.OPEN,
                Ticket.Status.IN_PROGRESS,
                Ticket.Status.WAITING_ON_CUSTOMER,
                Ticket.Status.REOPENED,
            )
        )

    return stats
