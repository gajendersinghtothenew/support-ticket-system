from django.contrib import admin

from comments.models import Comment
from tickets.models import Ticket


class CommentInline(admin.TabularInline):
    model = Comment
    extra = 0
    fields = ("author", "body", "is_internal", "created_at")
    readonly_fields = ("created_at",)
    show_change_link = True
    autocomplete_fields = ("author",)


@admin.register(Ticket)
class TicketAdmin(admin.ModelAdmin):
    list_display = (
        "ticket_number",
        "title",
        "status",
        "priority",
        "category",
        "created_by",
        "assigned_to",
        "created_at",
    )
    list_filter = ("status", "priority", "category", "assigned_to", "created_at")
    search_fields = (
        "ticket_number",
        "title",
        "description",
        "created_by__username",
        "created_by__email",
        "assigned_to__username",
    )
    readonly_fields = (
        "ticket_number",
        "created_at",
        "updated_at",
        "resolved_at",
        "closed_at",
    )
    autocomplete_fields = ("created_by", "assigned_to")
    date_hierarchy = "created_at"
    list_select_related = ("created_by", "assigned_to")
    inlines = (CommentInline,)
    fieldsets = (
        (
            None,
            {
                "fields": (
                    "ticket_number",
                    "title",
                    "description",
                ),
            },
        ),
        (
            "Classification",
            {
                "fields": (
                    "status",
                    "priority",
                    "category",
                ),
            },
        ),
        (
            "Ownership",
            {
                "fields": (
                    "created_by",
                    "assigned_to",
                ),
            },
        ),
        (
            "Timestamps",
            {
                "fields": (
                    "created_at",
                    "updated_at",
                    "resolved_at",
                    "closed_at",
                ),
            },
        ),
    )
