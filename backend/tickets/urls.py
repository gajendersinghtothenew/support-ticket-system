from django.urls import path

from tickets.views import TicketDetailView, TicketListCreateView

app_name = "tickets"

urlpatterns = [
    path("", TicketListCreateView.as_view(), name="ticket-list"),
    path("<int:pk>/", TicketDetailView.as_view(), name="ticket-detail"),
]
