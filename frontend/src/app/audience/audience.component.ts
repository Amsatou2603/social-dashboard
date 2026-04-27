import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import { Chart, registerables } from 'chart.js';
import { ApiService } from '../services/api.service';
import { SidebarComponent } from '../shared/sidebar.component';
import { TopbarComponent } from '../shared/topbar.component';

Chart.register(...registerables);

@Component({
  selector: 'app-audience',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseChartDirective, SidebarComponent, TopbarComponent],
  templateUrl: './audience.component.html',
  styleUrls: ['./audience.component.scss']
})
export class AudienceComponent implements OnInit {
  darkMode = true;
  selectedPlatform = 'all';
  selectedDays = 30;

  totalFollowers = 0;
  newFollowers = 0;

  // Données démographiques fictives réalistes pour l'Afrique de l'Ouest
  ageData = [
    { label: '13–17 ans', pct: 8 },
    { label: '18–24 ans', pct: 35 },
    { label: '25–34 ans', pct: 30 },
    { label: '35–44 ans', pct: 16 },
    { label: '45–54 ans', pct: 8 },
    { label: '55+ ans', pct: 3 },
  ];

  genderData = {
    labels: ['Femmes', 'Hommes', 'Non spécifié'],
    datasets: [{
      data: [48, 45, 7],
      backgroundColor: ['#f43f5e', '#6366f1', '#94a3b8'],
      borderWidth: 2,
      borderColor: '#1a1d27'
    }]
  };

  countries = [
    { flag: '🇸🇳', name: 'Sénégal', pct: 62 },
    { flag: '🇫🇷', name: 'France', pct: 12 },
    { flag: '🇨🇮', name: 'Côte d\'Ivoire', pct: 8 },
    { flag: '🇲🇱', name: 'Mali', pct: 5 },
    { flag: '🇬🇳', name: 'Guinée', pct: 4 },
    { flag: '🇧🇫', name: 'Burkina Faso', pct: 3 },
    { flag: '🇨🇲', name: 'Cameroun', pct: 3 },
    { flag: '🌍', name: 'Autres', pct: 3 },
  ];

  // Activité par heure / jour (heatmap simplifiée)
  hours = ['6h', '8h', '10h', '12h', '14h', '16h', '18h', '20h', '22h'];
  days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  activityMatrix: string[][] = [];

  growthChart: any = { labels: [], datasets: [] };
  chartOptions = {
    responsive: true,
    plugins: { legend: { labels: { color: '#94a3b8' } }, tooltip: { backgroundColor: '#1e293b' } },
    scales: {
      x: { ticks: { color: '#64748b', maxTicksLimit: 8 }, grid: { color: 'rgba(255,255,255,0.04)' } },
      y: { ticks: { color: '#64748b' }, grid: { color: 'rgba(255,255,255,0.04)' } }
    }
  };

  doughnutOptions = {
    responsive: true,
    plugins: { legend: { position: 'bottom' as const, labels: { color: '#94a3b8', padding: 14 } } }
  };

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.buildActivityMatrix();
    this.load();
  }

  load() {
    this.api.getKpi(this.selectedPlatform, this.selectedDays).subscribe(kpi => {
      this.totalFollowers = kpi.totals.followers;
      this.newFollowers = Math.round(kpi.totals.followers * 0.04);
    });
    this.api.getFollowersChart(this.selectedPlatform, this.selectedDays).subscribe(chart => {
      this.growthChart = {
        labels: chart.labels,
        datasets: chart.datasets.map((d: any) => ({
          ...d,
          fill: true,
          backgroundColor: (d.borderColor ?? '#6366f1') + '22',
        }))
      };
    });
  }

  buildActivityMatrix() {
    const levels = ['', 'low', 'mid', 'high'];
    this.activityMatrix = this.days.map((_, di) =>
      this.hours.map((_, hi) => {
        const score = Math.random();
        // Peak hours: 12h–14h et 18h–20h, weekend plus actif
        const isPeak = (hi >= 3 && hi <= 4) || (hi >= 6 && hi <= 7);
        const isWeekend = di >= 5;
        const adj = (isPeak ? 0.3 : 0) + (isWeekend ? 0.2 : 0) + score * 0.5;
        if (adj > 0.7) return 'high';
        if (adj > 0.4) return 'mid';
        return 'low';
      })
    );
  }

  fmt(n: number) {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
    if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
    return n?.toString() ?? '0';
  }

  onPlatformChange(p: string) { this.selectedPlatform = p; this.load(); }
  onDaysChange(d: number) { this.selectedDays = d; this.load(); }
  onDarkModeChange(v: boolean) { this.darkMode = v; }
}