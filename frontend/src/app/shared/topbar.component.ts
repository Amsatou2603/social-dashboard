import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.scss']
})
export class TopbarComponent {
  @Input() pageTitle = 'Dashboard';
  @Input() pageSubtitle = '';
  @Input() darkMode = true;
  @Input() showFilters = false;
  @Input() selectedPlatform = 'all';
  @Input() selectedDays = 30;

  @Output() darkModeChange = new EventEmitter<boolean>();
  @Output() platformChange = new EventEmitter<string>();
  @Output() daysChange = new EventEmitter<number>();

  platforms = [
    { value: 'all',       label: 'Toutes les plateformes' },
    { value: 'instagram', label: 'Instagram' },
    { value: 'facebook',  label: 'Facebook' },
    { value: 'twitter',   label: 'Twitter / X' },
    { value: 'linkedin',  label: 'LinkedIn' },
    { value: 'tiktok',    label: 'TikTok' },
  ];

  dayOptions = [7, 14, 30, 60, 90];

  toggleDark() { this.darkModeChange.emit(!this.darkMode); }
  onPlatformChange(v: string) { this.platformChange.emit(v); }
  onDaysChange(v: number) { this.daysChange.emit(v); }
}