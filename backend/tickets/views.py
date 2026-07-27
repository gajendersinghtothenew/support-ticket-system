from accounts.permissions import is_agent_or_admin
from rest_framework import generics, status
from rest_framework.response import Response

from tickets.models import Ticket
from tickets.permissions import TicketPermission
from tickets.serializers import (
    TicketCreateSerializer,
    TicketListSerializer,
    TicketSerializer,
)


class TicketListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/tickets/  — list all tickets
    POST /api/tickets/  — create a new ticket
    """

    permission_classes = [TicketPermission]

    def get_queryset(self):
        queryset = Ticket.objects.select_related("created_by", "assigned_to")
        if not is_agent_or_admin(self.request.user):
            queryset = queryset.filter(created_by=self.request.user)
        return queryset

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
        queryset = Ticket.objects.select_related("created_by", "assigned_to")
        if not is_agent_or_admin(self.request.user):
            queryset = queryset.filter(created_by=self.request.user)
        return queryset
