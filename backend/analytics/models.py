from django.db import models


PLATFORM_CHOICES = [
    ('instagram', 'Instagram'),
    ('facebook', 'Facebook'),
    ('twitter', 'Twitter / X'),
    ('linkedin', 'LinkedIn'),
    ('tiktok', 'TikTok'),
]


class SocialAccount(models.Model):
    platform = models.CharField(max_length=20, choices=PLATFORM_CHOICES)
    username = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.platform} – @{self.username}"


class DailyMetric(models.Model):
    account = models.ForeignKey(SocialAccount, on_delete=models.CASCADE, related_name='metrics')
    date = models.DateField()
    followers = models.IntegerField(default=0)
    new_followers = models.IntegerField(default=0)
    impressions = models.IntegerField(default=0)
    reach = models.IntegerField(default=0)
    engagement = models.FloatField(default=0.0)   # taux en %
    likes = models.IntegerField(default=0)
    comments = models.IntegerField(default=0)
    shares = models.IntegerField(default=0)
    clicks = models.IntegerField(default=0)

    class Meta:
        ordering = ['-date']
        unique_together = ['account', 'date']

    def __str__(self):
        return f"{self.account} – {self.date}"


class Post(models.Model):
    account = models.ForeignKey(SocialAccount, on_delete=models.CASCADE, related_name='posts')
    content = models.TextField()
    published_at = models.DateTimeField()
    likes = models.IntegerField(default=0)
    comments = models.IntegerField(default=0)
    shares = models.IntegerField(default=0)
    reach = models.IntegerField(default=0)
    engagement_rate = models.FloatField(default=0.0)
    post_type = models.CharField(max_length=20, default='image',
                                  choices=[('image','Image'),('video','Vidéo'),('story','Story'),('reel','Reel'),('text','Texte')])

    class Meta:
        ordering = ['-published_at']

    def __str__(self):
        return f"{self.account.platform} – {self.published_at.date()}"