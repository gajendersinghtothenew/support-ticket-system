from django.shortcuts import get_object_or_404
from rest_framework import generics, status
from rest_framework.response import Response

from comments.models import Comment
from comments.serializers import CommentCreateSerializer, CommentSerializer
from tickets.models import Ticket


class CommentListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/comments/  — list comments (optional ?ticket=<id> filter)
    POST /api/comments/  — create a new comment
    """

    # Authentication and permissions will be added in a later step.
    permission_classes = []

    def get_queryset(self):
        """
        Return all comments, optionally filtered by ticket ID.

        Supports ?ticket=<id> so clients can load the thread for a
        specific ticket without a separate nested route.
        """
        queryset = Comment.objects.select_related("ticket", "author")
        ticket_id = self.request.query_params.get("ticket")
        if ticket_id is not None:
            queryset = queryset.filter(ticket_id=ticket_id)
        return queryset

    def get_serializer_class(self):
        """Use the create serializer for POST, read serializer for GET."""
        if self.request.method == "POST":
            return CommentCreateSerializer
        return CommentSerializer

    def create(self, request, *args, **kwargs):
        """
        Create a comment on a ticket.

        Expects `ticket` (ID) in the request body along with `body`.
        The ticket is resolved here and passed to CommentCreateSerializer
        via context; author is set from request.user inside the serializer.
        """
        ticket_id = request.data.get("ticket")
        if not ticket_id:
            return Response(
                {"ticket": ["This field is required."]},
                status=status.HTTP_400_BAD_REQUEST,
            )

        ticket = get_object_or_404(Ticket, pk=ticket_id)
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

    permission_classes = []
    serializer_class = CommentSerializer

    def get_queryset(self):
        """Return a single comment with related ticket and author preloaded."""
        return Comment.objects.select_related("ticket", "author")
