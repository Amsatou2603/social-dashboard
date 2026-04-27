from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Sum, Avg, Max
from django.utils import timezone
from datetime import timedelta, date
from .models import SocialAccount, DailyMetric, Post
from .serializers import (
    SocialAccountSerializer, DailyMetricSerializer,
    PostSerializer, KPISummarySerializer
)

PLATFORM_COLORS = {
    'instagram': '#E1306C',
    'facebook': '#1877F2',
    'twitter': '#1DA1F2',
    'linkedin': '#0A66C2',
    'tiktok': '#010101',
}


class SocialAccountListView(APIView):
    def get(self, request):
        accounts = SocialAccount.objects.all()
        serializer = SocialAccountSerializer(accounts, many=True)
        return Response(serializer.data)


class KPISummaryView(APIView):
    """Résumé global des KPIs — cartes du haut du dashboard"""
    def get(self, request):
        days = int(request.query_params.get('days', 30))
        platform = request.query_params.get('platform', None)
        end_date = date.today()
        start_date = end_date - timedelta(days=days)

        accounts = SocialAccount.objects.all()
        if platform and platform != 'all':
            accounts = accounts.filter(platform=platform)

        summary = []
        for account in accounts:
            metrics = DailyMetric.objects.filter(
                account=account,
                date__gte=start_date,
                date__lte=end_date
            )
            if not metrics.exists():
                continue

            latest = metrics.first()
            oldest = metrics.last()
            growth = 0.0
            if oldest.followers > 0:
                growth = round(((latest.followers - oldest.followers) / oldest.followers) * 100, 2)

            agg = metrics.aggregate(
                total_impressions=Sum('impressions'),
                avg_engagement=Avg('engagement'),
                total_likes=Sum('likes'),
                total_reach=Sum('reach'),
            )
            summary.append({
                'platform': account.platform,
                'username': account.username,
                'total_followers': latest.followers,
                'total_impressions': agg['total_impressions'] or 0,
                'avg_engagement': round(agg['avg_engagement'] or 0, 2),
                'total_likes': agg['total_likes'] or 0,
                'total_reach': agg['total_reach'] or 0,
                'growth_rate': growth,
            })

        # Totaux globaux
        total_followers = sum(s['total_followers'] for s in summary)
        total_impressions = sum(s['total_impressions'] for s in summary)
        avg_engagement = round(sum(s['avg_engagement'] for s in summary) / max(len(summary), 1), 2)
        total_reach = sum(s['total_reach'] for s in summary)

        return Response({
            'period_days': days,
            'accounts': summary,
            'totals': {
                'followers': total_followers,
                'impressions': total_impressions,
                'avg_engagement': avg_engagement,
                'reach': total_reach,
            }
        })


class FollowersChartView(APIView):
    """Évolution des followers par plateforme"""
    def get(self, request):
        days = int(request.query_params.get('days', 30))
        platform = request.query_params.get('platform', None)
        end_date = date.today()
        start_date = end_date - timedelta(days=days)

        accounts = SocialAccount.objects.all()
        if platform and platform != 'all':
            accounts = accounts.filter(platform=platform)

        # Générer les labels (dates)
        labels = []
        current = start_date
        while current <= end_date:
            labels.append(current.strftime('%d/%m'))
            current += timedelta(days=1)

        datasets = []
        for account in accounts:
            metrics = DailyMetric.objects.filter(
                account=account,
                date__gte=start_date,
                date__lte=end_date
            ).order_by('date')

            metric_dict = {m.date.strftime('%d/%m'): m.followers for m in metrics}
            data = [metric_dict.get(label, None) for label in labels]

            datasets.append({
                'label': f"{account.platform.capitalize()} (@{account.username})",
                'data': data,
                'borderColor': PLATFORM_COLORS.get(account.platform, '#888'),
                'backgroundColor': PLATFORM_COLORS.get(account.platform, '#888') + '22',
                'tension': 0.4,
                'fill': True,
            })

        return Response({'labels': labels, 'datasets': datasets})


class EngagementChartView(APIView):
    """Taux d'engagement par plateforme"""
    def get(self, request):
        days = int(request.query_params.get('days', 30))
        platform = request.query_params.get('platform', None)
        end_date = date.today()
        start_date = end_date - timedelta(days=days)

        accounts = SocialAccount.objects.all()
        if platform and platform != 'all':
            accounts = accounts.filter(platform=platform)

        labels = []
        current = start_date
        while current <= end_date:
            labels.append(current.strftime('%d/%m'))
            current += timedelta(days=1)

        datasets = []
        for account in accounts:
            metrics = DailyMetric.objects.filter(
                account=account,
                date__gte=start_date,
                date__lte=end_date
            ).order_by('date')

            metric_dict = {m.date.strftime('%d/%m'): m.engagement for m in metrics}
            data = [metric_dict.get(label, None) for label in labels]

            datasets.append({
                'label': account.platform.capitalize(),
                'data': data,
                'borderColor': PLATFORM_COLORS.get(account.platform, '#888'),
                'backgroundColor': PLATFORM_COLORS.get(account.platform, '#888'),
                'tension': 0.4,
            })

        return Response({'labels': labels, 'datasets': datasets})


class ImpressionsReachChartView(APIView):
    """Impressions vs Reach — barres groupées"""
    def get(self, request):
        days = int(request.query_params.get('days', 30))
        platform = request.query_params.get('platform', None)
        end_date = date.today()
        start_date = end_date - timedelta(days=days)

        accounts = SocialAccount.objects.all()
        if platform and platform != 'all':
            accounts = accounts.filter(platform=platform)

        labels = [acc.platform.capitalize() for acc in accounts]
        impressions_data = []
        reach_data = []

        for account in accounts:
            agg = DailyMetric.objects.filter(
                account=account,
                date__gte=start_date,
                date__lte=end_date
            ).aggregate(total_imp=Sum('impressions'), total_reach=Sum('reach'))
            impressions_data.append(agg['total_imp'] or 0)
            reach_data.append(agg['total_reach'] or 0)

        datasets = [
            {
                'label': 'Impressions',
                'data': impressions_data,
                'backgroundColor': '#6366f1',
                'borderRadius': 8,
            },
            {
                'label': 'Portée (Reach)',
                'data': reach_data,
                'backgroundColor': '#f43f5e',
                'borderRadius': 8,
            }
        ]

        return Response({'labels': labels, 'datasets': datasets})


class PlatformShareChartView(APIView):
    """Répartition des followers par plateforme — Doughnut"""
    def get(self, request):
        accounts = SocialAccount.objects.all()
        labels = []
        data = []
        colors = []

        for account in accounts:
            latest = DailyMetric.objects.filter(account=account).first()
            if latest:
                labels.append(account.platform.capitalize())
                data.append(latest.followers)
                colors.append(PLATFORM_COLORS.get(account.platform, '#888'))

        return Response({
            'labels': labels,
            'datasets': [{
                'data': data,
                'backgroundColor': colors,
                'borderWidth': 2,
                'borderColor': '#1e1e2e',
            }]
        })


class PostListView(APIView):
    """Liste des posts avec performances"""
    def get(self, request):
        platform = request.query_params.get('platform', None)
        days = int(request.query_params.get('days', 30))
        end_date = timezone.now()
        start_date = end_date - timedelta(days=days)

        posts = Post.objects.select_related('account').filter(
            published_at__gte=start_date,
            published_at__lte=end_date
        )
        if platform and platform != 'all':
            posts = posts.filter(account__platform=platform)

        serializer = PostSerializer(posts[:50], many=True)
        return Response(serializer.data)


class TopPostsView(APIView):
    """Top 5 posts par engagement"""
    def get(self, request):
        platform = request.query_params.get('platform', None)
        posts = Post.objects.select_related('account').order_by('-engagement_rate')
        if platform and platform != 'all':
            posts = posts.filter(account__platform=platform)
        serializer = PostSerializer(posts[:5], many=True)
        return Response(serializer.data)


class GlobalStatsView(APIView):
    """Statistiques globales pour les widgets de résumé"""
    def get(self, request):
        total_posts = Post.objects.count()
        total_accounts = SocialAccount.objects.count()
        best_post = Post.objects.order_by('-engagement_rate').first()
        total_followers = 0
        for account in SocialAccount.objects.all():
            latest = DailyMetric.objects.filter(account=account).first()
            if latest:
                total_followers += latest.followers

        return Response({
            'total_posts': total_posts,
            'total_accounts': total_accounts,
            'total_followers': total_followers,
            'best_engagement': best_post.engagement_rate if best_post else 0,
        })