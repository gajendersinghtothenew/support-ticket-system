from accounts.models import UserProfile


def get_user_role(user):
    """Return the application role for a user."""
    if not user or not user.is_authenticated:
        return None
    if user.is_superuser:
        return UserProfile.Role.ADMIN
    profile = getattr(user, "profile", None)
    if profile is None:
        return UserProfile.Role.CUSTOMER
    return profile.role


def is_agent_or_admin(user):
    """Return True if the user is an agent or admin."""
    role = get_user_role(user)
    return role in (UserProfile.Role.AGENT, UserProfile.Role.ADMIN)
