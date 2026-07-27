from django.urls import path

from comments.views import CommentDetailView, CommentListCreateView

app_name = "comments"

urlpatterns = [
    path("", CommentListCreateView.as_view(), name="comment-list"),
    path("<int:pk>/", CommentDetailView.as_view(), name="comment-detail"),
]
