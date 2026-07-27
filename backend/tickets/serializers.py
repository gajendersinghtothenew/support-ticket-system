from django.contrib.auth import get_user_model
from rest_framework import serializers

from tickets.models import Ticket
from tickets.services.workflow import WorkflowError, transition

User = get_user_model()


class UserSummarySerializer(serializers.ModelSerializer):
    """Minimal read-only user representation for nested ticket/comment output."""

    class Meta:
        model = User
        fields = ("id", "username", "email")
        read_only_fields = fields


class TicketListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for ticket list endpoints."""

    created_by = UserSummarySerializer(read_only=True)
    assigned_to = UserSummarySerializer(read_only=True)

    class Meta:
        model = Ticket
        fields = (
            "id",
            "ticket_number",
            "title",
            "status",
            "priority",
            "category",
            "created_by",
            "assigned_to",
            "created_at",
            "updated_at",
        )
        read_only_fields = fields


class TicketSerializer(serializers.ModelSerializer):
    """Full read/write serializer for ticket detail views."""

    created_by = UserSummarySerializer(read_only=True)
    assigned_to = UserSummarySerializer(read_only=True)

    class Meta:
        model = Ticket
        fields = (
            "id",
            "ticket_number",
            "title",
            "description",
            "status",
            "priority",
            "category",
            "created_by",
            "assigned_to",
            "created_at",
            "updated_at",
            "resolved_at",
            "closed_at",
        )
        read_only_fields = (
            "id",
            "ticket_number",
            "created_by",
            "created_at",
            "updated_at",
            "resolved_at",
            "closed_at",
        )

    def validate_title(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Title cannot be blank.")
        if len(value) < 5:
            raise serializers.ValidationError(
                "Title must be at least 5 characters long."
            )
        return value

    def validate_description(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Description cannot be blank.")
        if len(value) < 10:
            raise serializers.ValidationError(
                "Description must be at least 10 characters long."
            )
        return value

    def update(self, instance, validated_data):
        new_status = validated_data.pop("status", None)
        user = self.context["request"].user

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        if new_status is not None and new_status != instance.status:
            try:
                transition(instance, new_status, user)
            except WorkflowError as exc:
                raise serializers.ValidationError({"status": exc.message}) from exc
        else:
            instance.save()

        return instance


class TicketCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for customers creating tickets.

    System-managed fields (ticket_number, status, assignment, timestamps)
    are excluded; created_by is set from the authenticated user in create().
    """

    class Meta:
        model = Ticket
        fields = ("title", "description", "category", "priority")

    def validate_title(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Title cannot be blank.")
        if len(value) < 5:
            raise serializers.ValidationError(
                "Title must be at least 5 characters long."
            )
        return value

    def validate_description(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Description cannot be blank.")
        if len(value) < 10:
            raise serializers.ValidationError(
                "Description must be at least 10 characters long."
            )
        return value

    def create(self, validated_data):
        user = self.context["request"].user
        return Ticket.objects.create(created_by=user, **validated_data)
