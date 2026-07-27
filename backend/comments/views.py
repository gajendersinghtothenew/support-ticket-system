from django.shortcuts import get_object_or_404
from rest_framework import generics, status
from rest_framework.response import Response

from accounts.permissions import is_agent_or_admin
from comments.models import Comment
from comments.permissions import CommentPermission
from comments.serializers import CommentCreateSerializer, CommentSerializer
from tickets.models import Ticket


class CommentListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/comments/  — list comments (optional ?ticket=<id> filter)
    POST /api/comments/  — create a new comment
    """

    permission_classes = [CommentPermission]

    def get_queryset(self):
        """
        Return comments the user is allowed to see.

        Supports ?ticket=<id> so clients can load the thread for a
        specific ticket without a separate nested route.
        """
        queryset = Comment.objects.select_related("ticket", "author")
        if not is_agent_or_admin(self.request.user):
            queryset = queryset.filter(
                ticket__created_by=self.request.user,
                is_internal=False,
            )
        ticket_id = self.request.query_params.get("ticket")
        if ticket_id is not None:
            queryset = queryset.filter(ticket_id=ticket_id)
        return queryset

    def get_serializer_class(self):
        if self.request.method == "POST":
            return CommentCreateSerializer
        return CommentSerializer

    def create(self, request, *args, **kwargs):
        ticket_id = request.data.get("ticket")
        if not ticket_id:
            return Response(
                {"ticket": ["This field is required."]},
                status=status.HTTP_400_BAD_REQUEST,
            )

        ticket_queryset = Ticket.objects.filter(pk=ticket_id)
        if not is_agent_or_admin(request.user):
            ticket_queryset = ticket_queryset.filter(created_by=request.user)
        ticket = get_object_or_404(ticket_queryset)

        serializer = self.get_serializer(
            data=request.data,
            context={**self.get_serializer_context(), "ticket": ticket},
        )
        serializer.is_valid(raise_exception=True)
        comment = serializer.save()
        output_serializer = CommentSerializer(comment, context={"request": request})
        headers = self.get_success_headers(output_serializer.data)
        return Response(
            output_serializer.data,
            status=status.HTTP_201_CREATED,
            headers=headers,
        )


class CommentDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /api/comments/{id}/  — retrieve a comment
    PUT    /api/comments/{id}/  — full update
    PATCH  /api/comments/{id}/  — partial update
    DELETE /api/comments/{id}/  — delete a comment
    """

    permission_classes = [CommentPermission]
    serializer_class = CommentSerializer

    def get_queryset(self):
        queryset = Comment.objects.select_related("ticket", "author")
        if not is_agent_or_admin(self.request.user):
            queryset = queryset.filter(
                ticket__created_by=self.request.user,
                is_internal=False,
            )
        return queryset
