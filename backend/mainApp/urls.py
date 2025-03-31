from . import views
from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('register/', views.UserRegister.as_view(), name='register'),
    path('login/', views.UserLogin.as_view(), name='login'),
    path('logout/', views.UserLogout.as_view(), name='logout'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),

    path('user/', views.OneUserData.as_view(), name='user'),
    path('buildings/', views.BuildingAllData.as_view(), name='buildings'),

    # New verification endpoints
    path('request-verification/', views.RequestVerification.as_view(), name='request-verification'),
    path('verify-code/', views.RequestVerification.as_view(), name='verify-code'),
]
