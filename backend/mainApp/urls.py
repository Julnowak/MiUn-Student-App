from . import views
from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import VerificationAPI, VerifyCodeView

urlpatterns = [
    path('register/', views.UserRegister.as_view(), name='register'),
    path('login/', views.UserLogin.as_view(), name='login'),
    path('logout/', views.UserLogout.as_view(), name='logout'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),

    path('user/', views.OneUserData.as_view(), name='user'),
    path('buildings/', views.BuildingsAllData.as_view(), name='buildings'),
    path('building/<str:building_name>', views.BuildingAPI.as_view(), name='building'),
    path('notifications/', views.NotificationsAPI.as_view(), name='notifications'),
    path('notifications/<int:pk>/', views.NotificationsAPI.as_view(), name='notification-detail'),
    path('news/', views.NewsAPI.as_view(), name='news'),
    path('news/<int:pk>/', views.NewsAPI.as_view(), name='news-detail'),
    path('sources/', views.SourceAPI.as_view(), name='sources'),
    path('fields/', views.FieldsAPI.as_view(), name='fields'),
    path('courses/', views.CourseAPI.as_view(), name='courses'),
    path('groups/', views.GroupAPI.as_view(), name='groups'),
    path('forum/', views.ForumAPI.as_view(), name='forum'),
    path('comment/<int:post_id>/', views.CommentAPI.as_view(), name='comment_post'),
    path('like_dislike/', views.LikeDislikeAPI.as_view(), name='like_dislike'),
    path('inviteUser/', views.UserInviteAPI.as_view(), name='inviteUser'),
    path('calendar/', views.CalendarAPI.as_view(), name='calendar'),
    path('group/<int:group_id>', views.OneGroupAPI.as_view(), name='group'),
    path('fieldByYear/', views.FieldByYearAPI.as_view(), name='fieldByYear'),
    path('maturasubjects/', views.MaturaSubjectsAPI.as_view(), name='maturasubjects'),

    # New verification endpoints
    path('send-verification-email/', VerificationAPI.as_view(), name='send_verification'),
    path('verify-code/', VerifyCodeView.as_view(), name='verify_code'),
    path('calculation/', views.CalculationAPI.as_view(), name='calculation'),
    path('ask-gemini/', views.ask_gemini, name='ask_gemini'),
]
