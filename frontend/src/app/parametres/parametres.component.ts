import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { SidebarComponent } from '../shared/sidebar.component';
import { TopbarComponent } from '../shared/topbar.component';

@Component({
  selector: 'app-parametres',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent, TopbarComponent],
  templateUrl: './parametres.component.html',
  styleUrls: ['./parametres.component.scss']
})
export class ParametresComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  darkMode = true;
  activeSection = 'profil';
  photoUrl: string | null = null;
  saved = false;

  sections = [
    { id: 'profil',        label: 'Profil',        icon: 'fa-user' },
    { id: 'notifications', label: 'Notifications', icon: 'fa-bell' },
    { id: 'plateformes',   label: 'Plateformes',   icon: 'fa-plug' },
    { id: 'apparence',     label: 'Apparence',     icon: 'fa-palette' },
    { id: 'securite',      label: 'Sécurité',      icon: 'fa-shield-halved' },
    { id: 'rapports',      label: 'Rapports',      icon: 'fa-file-chart-column' },
  ];

  profil = {
    nom: 'ISEP Diamniadio',
    email: 'contact@isep-diamniadio.sn',
    telephone: '+221 XX XXX XX XX',
    organisation: 'ISEP Diamniadio',
    role: 'Administrateur',
    bio: 'Dashboard de suivi des performances digitales — Licence Analyse de Performance Digitale.',
  };

  notifs = {
    emailQuotidien: true,
    emailHebdo: true,
    alerteEngagement: true,
    alerteFollowers: false,
    rapportMensuel: true,
    pushBrowser: false,
  };

  plateformes = [
    { name: 'Instagram', icon: 'fa-brands fa-instagram', color: '#E1306C', connected: true,  username: '@isep_diamniadio' },
    { name: 'Facebook',  icon: 'fa-brands fa-facebook',  color: '#1877F2', connected: true,  username: 'ISEPDiamniadio' },
    { name: 'Twitter/X', icon: 'fa-brands fa-x-twitter', color: '#000',    connected: true,  username: '@isep_digital' },
    { name: 'LinkedIn',  icon: 'fa-brands fa-linkedin',  color: '#0A66C2', connected: true,  username: 'isep-diamniadio' },
    { name: 'TikTok',    icon: 'fa-brands fa-tiktok',    color: '#69C9D0', connected: false, username: '' },
    { name: 'YouTube',   icon: 'fa-brands fa-youtube',   color: '#FF0000', connected: false, username: '' },
  ];

  apparence = {
    theme: 'dark',
    couleurAccent: '#6366f1',
    langue: 'fr',
    formatDate: 'DD/MM/YYYY',
    fuseau: 'Africa/Dakar',
  };

  rapports = {
    frequence: 'hebdomadaire',
    format: 'pdf',
    inclureGraphiques: true,
    inclureTableaux: true,
    destinataires: 'contact@isep-diamniadio.sn',
  };

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    // Lit le queryParam ?section=notifications envoyé par le bouton topbar
    this.route.queryParams.subscribe(params => {
      if (params['section']) {
        const valid = this.sections.map(s => s.id);
        if (valid.includes(params['section'])) {
          this.activeSection = params['section'];
        }
      }
    });
  }

  // ── Photo ──────────────────────────────────────────────────
  triggerFileInput() {
    this.fileInput.nativeElement.click();
  }

  onPhotoSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const file = input.files[0];

    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner une image (JPG, PNG, WEBP...)');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("L'image ne doit pas dépasser 5 Mo.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      this.photoUrl = e.target?.result as string;
      localStorage.setItem('userPhoto', this.photoUrl);
    };
    reader.readAsDataURL(file);
  }

  removePhoto() {
    this.photoUrl = null;
    localStorage.removeItem('userPhoto');
    if (this.fileInput?.nativeElement) {
      this.fileInput.nativeElement.value = '';
    }
  }

  get initials(): string {
    return this.profil.nom
      .split(' ')
      .map(w => w[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }

  onDarkModeChange(v: boolean) { this.darkMode = v; }
  togglePlateforme(p: any) { p.connected = !p.connected; }

  save() {
    this.saved = true;
    setTimeout(() => this.saved = false, 2500);
  }
}