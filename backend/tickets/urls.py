from django.urls import path

from tickets.views import TicketDetailView, TicketListCreateView, TicketStatsView

app_name = "tickets"

urlpatterns = [
    path("stats/", TicketStatsView.as_view(), name="ticket-stats"),
    path("", TicketListCreateView.as_view(), name="ticket-list"),
    path("<int:pk>/", TicketDetailView.as_view(), name="ticket-detail"),
]
