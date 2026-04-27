import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface KpiSummary {
  platform: string;
  username: string;
  total_followers: number;
  total_impressions: number;
  avg_engagement: number;
  total_likes: number;
  total_reach: number;
  growth_rate: number;
}

export interface KpiResponse {
  period_days: number;
  accounts: KpiSummary[];
  totals: {
    followers: number;
    impressions: number;
    avg_engagement: number;
    reach: number;
  };
}

export interface ChartData {
  labels: string[];
  datasets: any[];
}

export interface Post {
  id: number;
  platform: string;
  username: string;
  content: string;
  published_at: string;
  likes: number;
  comments: number;
  shares: number;
  reach: number;
  engagement_rate: number;
  post_type: string;
}

export interface GlobalStats {
  total_posts: number;
  total_accounts: number;
  total_followers: number;
  best_engagement: number;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private base = environment.apiUrl;

  constructor(private http: HttpClient) {}

  private params(platform: string, days: number): HttpParams {
    return new HttpParams()
      .set('platform', platform)
      .set('days', days.toString());
  }

  getKpi(platform = 'all', days = 30): Observable<KpiResponse> {
    return this.http.get<KpiResponse>(`${this.base}/kpi/`, { params: this.params(platform, days) });
  }

  getFollowersChart(platform = 'all', days = 30): Observable<ChartData> {
    return this.http.get<ChartData>(`${this.base}/charts/followers/`, { params: this.params(platform, days) });
  }

  getEngagementChart(platform = 'all', days = 30): Observable<ChartData> {
    return this.http.get<ChartData>(`${this.base}/charts/engagement/`, { params: this.params(platform, days) });
  }

  getImpressionsChart(platform = 'all', days = 30): Observable<ChartData> {
    return this.http.get<ChartData>(`${this.base}/charts/impressions/`, { params: this.params(platform, days) });
  }

  getPlatformShare(): Observable<ChartData> {
    return this.http.get<ChartData>(`${this.base}/charts/platform-share/`);
  }

  getPosts(platform = 'all', days = 30): Observable<Post[]> {
    return this.http.get<Post[]>(`${this.base}/posts/`, { params: this.params(platform, days) });
  }

  getTopPosts(platform = 'all'): Observable<Post[]> {
    return this.http.get<Post[]>(`${this.base}/posts/top/`, {
      params: new HttpParams().set('platform', platform)
    });
  }

  getGlobalStats(): Observable<GlobalStats> {
    return this.http.get<GlobalStats>(`${this.base}/stats/`);
  }
}