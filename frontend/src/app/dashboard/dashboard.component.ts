import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import { Chart, registerables } from 'chart.js';
import { ApiService, KpiResponse, Post } from '../services/api.service';
import { SidebarComponent } from '../shared/sidebar.component';
import { TopbarComponent } from '../shared/topbar.component';
import { forkJoin } from 'rxjs';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseChartDirective, SidebarComponent, TopbarComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  selectedPlatform = 'all';
  selectedDays = 30;
  darkMode = true;

  kpiData: KpiResponse | null = null;
  posts: Post[] = [];
  topPosts: Post[] = [];
  loading = true;
  error = false;

  sortField: keyof Post = 'engagement_rate';
  sortAsc = false;

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
      x: { ticks: { color: '#64748b', maxTicksLimit: 8 }, grid: { color: 'rgba(255,255,255,0.04)' } },
      y: { ticks: { color: '#64748b' }, grid: { color: 'rgba(255,255,255,0.04)' } }
    }
  };

  barOptions = {
    responsive: true,
    plugins: {
      legend: { labels: { color: '#94a3b8' } },
      tooltip: { backgroundColor: '#1e293b', titleColor: '#f1f5f9', bodyColor: '#94a3b8' }
    },
    scales: {
      x: { ticks: { color: '#64748b' }, grid: { color: 'rgba(255,255,255,0.04)' } },
      y: { ticks: { color: '#64748b' }, grid: { color: 'rgba(255,255,255,0.04)' } }
    }
  };

  doughnutOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'right' as const, labels: { color: '#94a3b8', font: { size: 12 } } }
    }
  };

  constructor(private api: ApiService) {}

  ngOnInit() { this.loadAll(); }

  loadAll() {
    this.loading = true;
    this.error = false;
    forkJoin({
      kpi: this.api.getKpi(this.selectedPlatform, this.selectedDays),
      followers: this.api.getFollowersChart(this.selectedPlatform, this.selectedDays),
      engagement: this.api.getEngagementChart(this.selectedPlatform, this.selectedDays),
      impressions: this.api.getImpressionsChart(this.selectedPlatform, this.selectedDays),
      platformShare: this.api.getPlatformShare(),
      posts: this.api.getPosts(this.selectedPlatform, this.selectedDays),
      topPosts: this.api.getTopPosts(this.selectedPlatform),
    }).subscribe({
      next: (data) => {
        this.kpiData = data.kpi;
        this.followersChart = data.followers;
        this.engagementChart = data.engagement;
        this.impressionsChart = data.impressions;
        this.platformShareChart = data.platformShare;
        this.posts = data.posts;
        this.topPosts = data.topPosts;
        this.loading = false;
      },
      error: () => { this.error = true; this.loading = false; }
    });
  }

  onPlatformChange(p: string) { this.selectedPlatform = p; this.loadAll(); }
  onDaysChange(d: number) { this.selectedDays = d; this.loadAll(); }
  onDarkModeChange(v: boolean) { this.darkMode = v; }

  sortPosts(field: keyof Post) {
    if (this.sortField === field) { this.sortAsc = !this.sortAsc; }
    else { this.sortField = field; this.sortAsc = false; }
    this.posts = [...this.posts].sort((a, b) => {
      const va = a[field] as any, vb = b[field] as any;
      return this.sortAsc ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1);
    });
  }

  formatNumber(n: number): string {
    if (!n) return '0';
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
    if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
    return n.toString();
  }

  platformIcon(p: string): string {
    const icons: Record<string, string> = {
      instagram: 'fa-brands fa-instagram',
      facebook: 'fa-brands fa-facebook',
      twitter: 'fa-brands fa-x-twitter',
      linkedin: 'fa-brands fa-linkedin',
      tiktok: 'fa-brands fa-tiktok'
    };
    return icons[p] ?? 'fa-solid fa-globe';
  }

  platformColor(p: string): string {
    const colors: Record<string, string> = {
      instagram: '#E1306C', facebook: '#1877F2', twitter: '#000000',
      linkedin: '#0A66C2', tiktok: '#69C9D0'
    };
    return colors[p] ?? '#888';
  }

  get sortedTopPosts() { return this.topPosts.slice(0, 5); }
}