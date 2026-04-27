import random
from datetime import date, timedelta, datetime
from django.core.management.base import BaseCommand
from django.utils import timezone
from analytics.models import SocialAccount, DailyMetric, Post


PLATFORMS = [
    ('instagram', 'isep_diamniadio'),
    ('facebook', 'ISEPDiamniadio'),
    ('twitter', 'isep_digital'),
    ('linkedin', 'isep-diamniadio'),
    ('tiktok', 'isepdigital'),
]

POST_CONTENTS = [
    "🚀 Nouvelle formation en Analyse de Performance Digitale à l'ISEP ! Rejoignez-nous.",
    "📊 Nos étudiants maîtrisent Angular, Django, Machine Learning et plus encore. #Tech #Sénégal",
    "💡 Workshop Data Science aujourd'hui — pandas, numpy, visualisation. Superbe session !",
    "🌟 Félicitations à nos diplômés de la promo 2024 ! Fiers de vous. #ISEP #Diamniadio",
    "📱 Notre appli mobile Flutter est en ligne ! Téléchargez et donnez votre avis.",
    "🎯 Objectif 2025 : former 500 experts du digital au Sénégal. On y croit ! 💪",
    "✨ Retour sur notre hackathon IA — 48h de code, de créativité et de passion.",
    "📈 Les chiffres parlent : +35% d'engagement ce mois-ci. Merci à notre communauté !",
    "🛠️ Atelier Django REST Framework — nos étudiants construisent des APIs robustes.",
    "🎓 Bourse d'excellence disponible. Postulez maintenant sur notre site !",
    "🌍 Le numérique au service du Sénégal — notre mission chaque jour. #DigitalAfrica",
    "💻 Projet final en cours : tableau de bord analytique Angular + Django. Impressionnant !",
]


class Command(BaseCommand):
    help = 'Remplie la base de données avec des données fictives réalistes'

    def handle(self, *args, **options):
        self.stdout.write('🗑️  Nettoyage des données existantes...')
        Post.objects.all().delete()
        DailyMetric.objects.all().delete()
        SocialAccount.objects.all().delete()

        self.stdout.write('👥 Création des comptes sociaux...')
        accounts = []
        for platform, username in PLATFORMS:
            account = SocialAccount.objects.create(platform=platform, username=username)
            accounts.append(account)

        # Followers de base par plateforme
        base_followers = {
            'instagram': 12500,
            'facebook': 8200,
            'twitter': 5400,
            'linkedin': 3800,
            'tiktok': 15000,
        }

        self.stdout.write('📅 Génération des métriques quotidiennes (90 jours)...')
        today = date.today()

        for account in accounts:
            followers = base_followers[account.platform]
            for day_offset in range(89, -1, -1):
                current_date = today - timedelta(days=day_offset)

                # Croissance organique avec légère variance
                daily_growth = random.randint(10, 80)
                followers += daily_growth

                # Métriques réalistes selon la plateforme
                multiplier = {
                    'instagram': 1.4,
                    'facebook': 1.0,
                    'twitter': 0.8,
                    'linkedin': 0.6,
                    'tiktok': 2.0,
                }.get(account.platform, 1.0)

                impressions = int(random.randint(800, 3000) * multiplier)
                reach = int(impressions * random.uniform(0.55, 0.75))
                likes = int(reach * random.uniform(0.03, 0.09))
                comments = int(likes * random.uniform(0.05, 0.15))
                shares = int(likes * random.uniform(0.02, 0.08))
                clicks = int(reach * random.uniform(0.01, 0.04))
                engagement = round(((likes + comments + shares) / max(reach, 1)) * 100, 2)

                DailyMetric.objects.create(
                    account=account,
                    date=current_date,
                    followers=followers,
                    new_followers=daily_growth,
                    impressions=impressions,
                    reach=reach,
                    engagement=engagement,
                    likes=likes,
                    comments=comments,
                    shares=shares,
                    clicks=clicks,
                )

        self.stdout.write('📝 Génération des posts...')
        post_types = ['image', 'video', 'story', 'reel', 'text']
        for account in accounts:
            # 3 posts/semaine sur 90 jours ≈ 38 posts
            for _ in range(38):
                days_ago = random.randint(0, 89)
                published_at = timezone.now() - timedelta(days=days_ago, hours=random.randint(0, 23))
                likes = random.randint(50, 1500)
                comments = int(likes * random.uniform(0.03, 0.12))
                shares = int(likes * random.uniform(0.01, 0.06))
                reach = random.randint(500, 8000)
                eng_rate = round(((likes + comments + shares) / max(reach, 1)) * 100, 2)

                Post.objects.create(
                    account=account,
                    content=random.choice(POST_CONTENTS),
                    published_at=published_at,
                    likes=likes,
                    comments=comments,
                    shares=shares,
                    reach=reach,
                    engagement_rate=eng_rate,
                    post_type=random.choice(post_types),
                )

        self.stdout.write(self.style.SUCCESS(
            f'\n✅ Données créées avec succès !\n'
            f'   • {SocialAccount.objects.count()} comptes sociaux\n'
            f'   • {DailyMetric.objects.count()} métriques quotidiennes\n'
            f'   • {Post.objects.count()} posts\n'
        ))