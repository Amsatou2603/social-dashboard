from django.urls import path
from . import views

urlpatterns = [
    path('accounts/', views.SocialAccountListView.as_view(), name='accounts'),
    path('kpi/', views.KPISummaryView.as_view(), name='kpi-summary'),
    path('charts/followers/', views.FollowersChartView.as_view(), name='chart-followers'),
    path('charts/engagement/', views.EngagementChartView.as_view(), name='chart-engagement'),
    path('charts/impressions/', views.ImpressionsReachChartView.as_view(), name='chart-impressions'),
    path('charts/platform-share/', views.PlatformShareChartView.as_view(), name='chart-platform-share'),
    path('posts/', views.PostListView.as_view(), name='posts'),
    path('posts/top/', views.TopPostsView.as_view(), name='top-posts'),
    path('stats/', views.GlobalStatsView.as_view(), name='global-stats'),
]