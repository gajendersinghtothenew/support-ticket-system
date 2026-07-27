from rest_framework import permissions

from accounts.permissions import is_agent_or_admin


class TicketPermission(permissions.BasePermission):
    """
    Authenticated users can list and create tickets.

    - Agents/admins: full access to all tickets.
    - Customers: can access only their own tickets.
    - Customers: cannot delete tickets.
    """

    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        if is_agent_or_admin(request.user):
            return True
        if request.method == "DELETE":
            return False
        return obj.created_by_id == request.user.id
