from rest_framework import serializers

from comments.models import Comment
from tickets.serializers import UserSummarySerializer


class CommentSerializer(serializers.ModelSerializer):
    """Full serializer for reading and updating comments."""

    author = UserSummarySerializer(read_only=True)
    ticket_number = serializers.CharField(
        source="ticket.ticket_number",
        read_only=True,
    )

    class Meta:
        model = Comment
        fields = (
            "id",
            "ticket",
            "ticket_number",
            "author",
            "body",
            "is_internal",
            "created_at",
        )
        read_only_fields = (
            "id",
            "ticket",
            "ticket_number",
            "author",
            "created_at",
        )

    def validate_body(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Comment body cannot be blank.")
        if len(value) < 2:
            raise serializers.ValidationError(
                "Comment must be at least 2 characters long."
            )
        return value


class CommentCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for posting a new comment on a ticket.

    ticket and author are set from the URL and authenticated user in create().
    """

    class Meta:
        model = Comment
        fields = ("body", "is_internal")

    def validate_body(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Comment body cannot be blank.")
        if len(value) < 2:
            raise serializers.ValidationError(
                "Comment must be at least 2 characters long."
            )
        return value

    def validate_is_internal(self, value):
        # Customers cannot create internal notes; enforced here until
        # role-based permissions are wired in the view layer.
        request = self.context.get("request")
        if value and request and not getattr(request.user, "is_staff", False):
            raise serializers.ValidationError(
                "Only agents can create internal comments."
            )
        return value

    def create(self, validated_data):
        user = self.context["request"].user
        ticket = self.context["ticket"]
        return Comment.objects.create(
            ticket=ticket,
            author=user,
            **validated_data,
        )
