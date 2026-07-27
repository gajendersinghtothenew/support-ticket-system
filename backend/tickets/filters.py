from django.db.models import Q
import django_filters

from tickets.models import Ticket


class TicketFilter(django_filters.FilterSet):
    search = django_filters.CharFilter(method="filter_search", label="Search")
    status = django_filters.ChoiceFilter(choices=Ticket.Status.choices)
    priority = django_filters.ChoiceFilter(choices=Ticket.Priority.choices)
    category = django_filters.ChoiceFilter(choices=Ticket.Category.choices)

    class Meta:
        model = Ticket
        fields = ["status", "priority", "category"]

    def filter_search(self, queryset, name, value):
        value = value.strip()
        if not value:
            return queryset
        return queryset.filter(
            Q(title__icontains=value) | Q(description__icontains=value)
        )
