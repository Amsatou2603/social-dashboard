from rest_framework import serializers
from .models import SocialAccount, DailyMetric, Post


class SocialAccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = SocialAccount
        fields = '__all__'


class DailyMetricSerializer(serializers.ModelSerializer):
    platform = serializers.CharField(source='account.platform', read_only=True)
    username = serializers.CharField(source='account.username', read_only=True)

    class Meta:
        model = DailyMetric
        fields = '__all__'


class PostSerializer(serializers.ModelSerializer):
    platform = serializers.CharField(source='account.platform', read_only=True)
    username = serializers.CharField(source='account.username', read_only=True)

    class Meta:
        model = Post
        fields = '__all__'


class KPISummarySerializer(serializers.Serializer):
    platform = serializers.CharField()
    username = serializers.CharField()
    total_followers = serializers.IntegerField()
    total_impressions = serializers.IntegerField()
    avg_engagement = serializers.FloatField()
    total_likes = serializers.IntegerField()
    total_reach = serializers.IntegerField()
    growth_rate = serializers.FloatField()


class ChartDataSerializer(serializers.Serializer):
    labels = serializers.ListField(child=serializers.CharField())
    datasets = serializers.ListField()