import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  @Input() darkMode = true;

  navItems = [
    { label: 'Dashboard',    icon: 'fa-house',        route: '/' },
    { label: 'Analytics',    icon: 'fa-chart-line',   route: '/analytics' },
    { label: 'Posts',        icon: 'fa-newspaper',    route: '/posts' },
    { label: 'Audience',     icon: 'fa-users',        route: '/audience' },
    { label: 'Paramètres',   icon: 'fa-gear',         route: '/parametres' },
  ];
}