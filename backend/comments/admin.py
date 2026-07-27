from django.contrib import admin

from comments.models import Comment


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "ticket",
        "author",
        "short_body",
        "is_internal",
        "created_at",
    )
    list_filter = ("is_internal", "created_at", "ticket__status", "ticket__category")
    search_fields = (
        "body",
        "ticket__ticket_number",
        "ticket__title",
        "author__username",
        "author__email",
    )
    readonly_fields = ("created_at",)
    autocomplete_fields = ("ticket", "author")
    date_hierarchy = "created_at"
    list_select_related = ("ticket", "author")

    fieldsets = (
        (
            None,
            {
                "fields": (
                    "ticket",
                    "author",
                    "body",
                    "is_internal",
                    "created_at",
                ),
            },
        ),
    )

    @admin.display(description="Body")
    def short_body(self, obj):
        if len(obj.body) <= 60:
            return obj.body
        return f"{obj.body[:60]}..."

    def get_readonly_fields(self, request, obj=None):
        readonly_fields = list(super().get_readonly_fields(request, obj))
        if obj:
            readonly_fields.extend(["ticket", "author"])
        return readonly_fields
