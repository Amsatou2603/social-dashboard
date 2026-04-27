import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import { Chart, registerables } from 'chart.js';
import { ApiService } from '../services/api.service';
import { SidebarComponent } from '../shared/sidebar.component';
import { TopbarComponent } from '../shared/topbar.component';
import { forkJoin } from 'rxjs';

Chart.register(...registerables);

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseChartDirective, SidebarComponent, TopbarComponent],
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.scss']
})
export class AnalyticsComponent implements OnInit {
  darkMode = true;
  selectedPlatform = 'all';
  selectedDays = 30;
  loading = true;

  kpiData: any = null;
  followersChart: any = { labels: [], datasets: [] };
  engagementChart: any = { labels: [], datasets: [] };
  impressionsChart: any = { labels: [], datasets: [] };
  platformShareChart: any = { labels: [], datasets: [] };

  chartOptions = {
    responsive: true,
    interaction: { mode: 'index' as const, intersect: false },
    plugins: {
      legend: { labels: { color: '#94a3b8', font: { size: 11 } } },
      tooltip: { backgroundColor: '#1e293b', titleColor: '#f1f5f9', bodyColor: '#94a3b8' }
    },
    scales: {
      x: { ticks: { color: '#64748b', maxTicksLimit: 10 }, grid: { color: 'rgba(255,255,255,0.04)' } },
      y: { ticks: { color: '#64748b' }, grid: { color: 'rgba(255,255,255,0.04)' } }
    }
  };

  barOptions = { ...this.chartOptions };

  doughnutOptions = {
    responsive: true,
    plugins: { legend: { position: 'bottom' as const, labels: { color: '#94a3b8', padding: 16 } } }
  };

  // Métriques résumées calculées
  summaryMetrics = [
    { label: 'Meilleur taux d\'engagement', value: '0%', icon: 'fa-fire', color: '#f43f5e', platform: '' },
    { label: 'Plateforme la plus active', value: '—', icon: 'fa-bolt', color: '#f59e0b', platform: '' },
    { label: 'Croissance followers (période)', value: '0', icon: 'fa-arrow-trend-up', color: '#10b981', platform: '' },
    { label: 'Total interactions', value: '0', icon: 'fa-hand-pointer', color: '#6366f1', platform: '' },
  ];

  constructor(private api: ApiService) {}

  ngOnInit() { this.loadAll(); }

  loadAll() {
    this.loading = true;
    forkJoin({
      kpi: this.api.getKpi(this.selectedPlatform, this.selectedDays),
      followers: this.api.getFollowersChart(this.selectedPlatform, this.selectedDays),
      engagement: this.api.getEngagementChart(this.selectedPlatform, this.selectedDays),
      impressions: this.api.getImpressionsChart(this.selectedPlatform, this.selectedDays),
      share: this.api.getPlatformShare(),
    }).subscribe({
      next: (data) => {
        this.kpiData = data.kpi;
        this.followersChart = data.followers;
        this.engagementChart = data.engagement;
        this.impressionsChart = data.impressions;
        this.platformShareChart = data.share;
        this.computeSummary(data.kpi);
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  computeSummary(kpi: any) {
    if (!kpi?.accounts?.length) return;
    const best = kpi.accounts.reduce((a: any, b: any) => a.avg_engagement > b.avg_engagement ? a : b);
    const mostActive = kpi.accounts.reduce((a: any, b: any) => a.total_impressions > b.total_impressions ? a : b);
    const totalInteractions = kpi.accounts.reduce((sum: number, a: any) => sum + a.total_likes, 0);
    const totalGrowth = kpi.accounts.reduce((sum: number, a: any) => sum + (a.growth_rate || 0), 0);

    this.summaryMetrics[0].value = best.avg_engagement + '%';
    this.summaryMetrics[0].platform = best.platform;
    this.summaryMetrics[1].value = mostActive.platform;
    this.summaryMetrics[2].value = '+' + totalGrowth.toFixed(1) + '%';
    this.summaryMetrics[3].value = this.fmt(totalInteractions);
  }

  fmt(n: number) {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
    if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
    return n?.toString() ?? '0';
  }

  platformIcon(p: string): string {
    const icons: Record<string, string> = {
      instagram: 'fa-brands fa-instagram', facebook: 'fa-brands fa-facebook',
      twitter: 'fa-brands fa-x-twitter', linkedin: 'fa-brands fa-linkedin', tiktok: 'fa-brands fa-tiktok'
    };
    return icons[p] ?? 'fa-solid fa-globe';
  }

  platformColor(p: string): string {
    const c: Record<string, string> = {
      instagram: '#E1306C', facebook: '#1877F2', twitter: '#000', linkedin: '#0A66C2', tiktok: '#69C9D0'
    };
    return c[p] ?? '#888';
  }

  onPlatformChange(p: string) { this.selectedPlatform = p; this.loadAll(); }
  onDaysChange(d: number) { this.selectedDays = d; this.loadAll(); }
  onDarkModeChange(v: boolean) { this.darkMode = v; }
}