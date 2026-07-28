from accounts.permissions import is_agent_or_admin
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView

from tickets.filters import TicketFilter
from tickets.models import Ticket
from tickets.permissions import TicketPermission
from tickets.serializers import (
    TicketCreateSerializer,
    TicketListSerializer,
    TicketSerializer,
)
from tickets.services.stats import build_ticket_stats


def get_scoped_ticket_queryset(user):
    queryset = Ticket.objects.select_related("created_by", "assigned_to")
    if not is_agent_or_admin(user):
        queryset = queryset.filter(created_by=user)
    return queryset


class TicketStatsView(APIView):
    """
    GET /api/tickets/stats/ — summary counts for the dashboard.
    """

    permission_classes = [TicketPermission]

    def get(self, request):
        queryset = get_scoped_ticket_queryset(request.user)
        is_staff = is_agent_or_admin(request.user)
        stats = build_ticket_stats(queryset, request.user, is_staff)
        recent_tickets = queryset[:5]
        stats["recent_tickets"] = TicketListSerializer(
            recent_tickets,
            many=True,
            context={"request": request},
        ).data
        return Response(stats)


class TicketListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/tickets/  — list all tickets
    POST /api/tickets/  — create a new ticket
    """

    permission_classes = [TicketPermission]
    filter_backends = [DjangoFilterBackend]
    filterset_class = TicketFilter

    def get_queryset(self):
        return get_scoped_ticket_queryset(self.request.user)

    def get_serializer_class(self):
        if self.request.method == "POST":
            return TicketCreateSerializer
        return TicketListSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        ticket = serializer.save()
        output_serializer = TicketSerializer(ticket, context={"request": request})
        headers = self.get_success_headers(output_serializer.data)
        return Response(
            output_serializer.data,
            status=status.HTTP_201_CREATED,
            headers=headers,
        )


class TicketDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /api/tickets/{id}/  — retrieve a ticket
    PUT    /api/tickets/{id}/  — full update
    PATCH  /api/tickets/{id}/  — partial update
    DELETE /api/tickets/{id}/  — delete a ticket
    """

    permission_classes = [TicketPermission]
    serializer_class = TicketSerializer

    def get_queryset(self):
        return get_scoped_ticket_queryset(self.request.user)
