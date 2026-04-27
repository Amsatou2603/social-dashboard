import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, Post } from '../services/api.service';
import { SidebarComponent } from '../shared/sidebar.component';
import { TopbarComponent } from '../shared/topbar.component';

@Component({
  selector: 'app-posts',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent, TopbarComponent],
  templateUrl: './posts.component.html',
  styleUrls: ['./posts.component.scss']
})
export class PostsComponent implements OnInit {
  darkMode = true;
  selectedPlatform = 'all';
  selectedDays = 30;
  selectedType = 'all';
  loading = true;
  posts: Post[] = [];
  viewMode: 'grid' | 'table' = 'grid';

  types = ['all', 'image', 'video', 'story', 'reel', 'text'];

  stats = { total: 0, avgLikes: 0, avgEngagement: 0, bestPost: '' };

  constructor(private api: ApiService) {}

  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    this.api.getPosts(this.selectedPlatform, this.selectedDays).subscribe({
      next: (posts) => {
        this.posts = posts;
        this.computeStats(posts);
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  computeStats(posts: Post[]) {
    if (!posts.length) return;
    this.stats.total = posts.length;
    this.stats.avgLikes = Math.round(posts.reduce((s, p) => s + p.likes, 0) / posts.length);
    this.stats.avgEngagement = Math.round(posts.reduce((s, p) => s + p.engagement_rate, 0) / posts.length * 10) / 10;
    const best = posts.reduce((a, b) => a.engagement_rate > b.engagement_rate ? a : b);
    this.stats.bestPost = best.content.slice(0, 40) + '...';
  }

  get filteredPosts() {
    if (this.selectedType === 'all') return this.posts;
    return this.posts.filter(p => p.post_type === this.selectedType);
  }

  fmt(n: number) {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
    if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
    return n?.toString() ?? '0';
  }

  platformIcon(p: string) {
    const i: Record<string, string> = {
      instagram: 'fa-brands fa-instagram', facebook: 'fa-brands fa-facebook',
      twitter: 'fa-brands fa-x-twitter', linkedin: 'fa-brands fa-linkedin', tiktok: 'fa-brands fa-tiktok'
    };
    return i[p] ?? 'fa-solid fa-globe';
  }

  platformColor(p: string) {
    const c: Record<string, string> = {
      instagram: '#E1306C', facebook: '#1877F2', twitter: '#000', linkedin: '#0A66C2', tiktok: '#69C9D0'
    };
    return c[p] ?? '#888';
  }

  typeIcon(t: string) {
    const i: Record<string, string> = {
      image: 'fa-image', video: 'fa-video', story: 'fa-circle-play',
      reel: 'fa-film', text: 'fa-font'
    };
    return 'fa-solid ' + (i[t] ?? 'fa-file');
  }

  onPlatformChange(p: string) { this.selectedPlatform = p; this.load(); }
  onDaysChange(d: number) { this.selectedDays = d; this.load(); }
  onDarkModeChange(v: boolean) { this.darkMode = v; }
}