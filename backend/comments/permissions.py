from rest_framework import permissions

from accounts.permissions import is_agent_or_admin


class CommentPermission(permissions.BasePermission):
    """
    Authenticated users can list and create comments on tickets they can access.

    - Agents/admins: full access to all comments, including internal notes.
    - Customers: access only comments on their own tickets.
    - Customers: cannot see or create internal comments.
    - Customers: can update/delete only their own non-internal comments.
    """

    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        if is_agent_or_admin(request.user):
            return True
        if obj.ticket.created_by_id != request.user.id:
            return False
        if obj.is_internal:
            return False
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.author_id == request.user.id
