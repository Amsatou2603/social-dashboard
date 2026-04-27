from django.contrib import admin
from .models import SocialAccount, DailyMetric, Post

@admin.register(SocialAccount)
class SocialAccountAdmin(admin.ModelAdmin):
    list_display = ['platform', 'username', 'created_at']

@admin.register(DailyMetric)
class DailyMetricAdmin(admin.ModelAdmin):
    list_display = ['account', 'date', 'followers', 'engagement', 'impressions']
    list_filter = ['account__platform', 'date']

@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ['account', 'published_at', 'likes', 'comments', 'engagement_rate']
    list_filter = ['account__platform']