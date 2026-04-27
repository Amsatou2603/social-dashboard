import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AnalyticsComponent } from './analytics/analytics.component';
import { PostsComponent } from './posts/posts.component';
import { AudienceComponent } from './audience/audience.component';
import { ParametresComponent } from './parametres/parametres.component';

export const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'analytics', component: AnalyticsComponent },
  { path: 'posts', component: PostsComponent },
  { path: 'audience', component: AudienceComponent },
  { path: 'parametres', component: ParametresComponent },
  { path: '**', redirectTo: '' }
];