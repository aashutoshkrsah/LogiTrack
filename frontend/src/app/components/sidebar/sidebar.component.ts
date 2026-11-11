import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter } from 'rxjs';

interface NavItem {
  label: string;
  route: string;
  queryParams?: Record<string, string>;
  icon: string;
  key: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    @if (mobileOpen) {
      <div class="sidebar-backdrop d-lg-none" (click)="closeMobile.emit()"></div>
    }

    <aside class="ops-sidebar" [class.mobile-open]="mobileOpen" [class.desktop-collapsed]="desktopCollapsed">
      <div class="sidebar-brand">
        <div class="brand-logo" aria-hidden="true">
          <svg viewBox="0 0 32 32" width="28" height="28" fill="none">
            <path d="M16 3L28 9.5V22.5L16 29L4 22.5V9.5L16 3Z" fill="#257bf4"/>
            <path d="M16 3L28 9.5L16 16L4 9.5L16 3Z" fill="#60a5fa"/>
            <path d="M16 16L28 9.5V22.5L16 29V16Z" fill="#1d4ed8"/>
          </svg>
        </div>
        <div class="brand-text">
          <div class="brand-name">LogiTrack</div>
          <div class="brand-sub">Logistics Management</div>
        </div>
        <button
          type="button"
          class="btn-close btn-close-white ms-auto d-lg-none"
          aria-label="Close navigation"
          (click)="closeMobile.emit()"></button>
      </div>

      <div class="sidebar-scroll">
        <nav class="nav flex-column gap-1">
          @for (item of navItems; track item.key) {
            <a
              class="sidebar-link"
              [class.active]="isActive(item.key)"
              [routerLink]="item.route"
              [queryParams]="item.queryParams ?? null"
              (click)="closeMobile.emit()">
              <i class="bi" [ngClass]="item.icon"></i>
              <span>{{ item.label }}</span>
            </a>
          }
        </nav>
      </div>

      <div class="sidebar-footer">
        <div class="world-map-wrap" aria-hidden="true">
          <svg viewBox="0 0 240 110" class="world-map-svg" fill="currentColor">
            <path d="M22,28 C34,18 52,18 65,24 C74,28 70,40 62,46 C54,52 49,56 54,66 C58,74 53,94 45,98 C38,94 34,76 32,64 C28,54 16,44 22,28 Z"/>
            <path d="M98,20 C114,16 128,22 130,32 C126,40 114,43 102,40 C95,36 93,26 98,20 Z"/>
            <path d="M104,46 C120,44 134,54 132,70 C128,84 118,95 110,92 C104,84 98,66 104,46 Z"/>
            <path d="M134,18 C164,14 198,20 214,34 C218,46 204,58 188,62 C172,64 156,56 142,50 C132,44 128,26 134,18 Z"/>
            <path d="M188,68 C202,66 218,74 216,86 C208,96 190,94 184,84 C182,76 184,70 188,68 Z"/>
          </svg>
        </div>
        <div class="footer-tagline">Track &bull; Manage &bull; Deliver</div>
      </div>
    </aside>
  `,
  styles: [`
    .sidebar-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(9, 24, 48, 0.55);
      z-index: 1035;
    }
    .ops-sidebar {
      width: 248px;
      background: linear-gradient(180deg, #0b1f3b 0%, #091830 100%);
      color: #e2e8f0;
      display: flex;
      flex-direction: column;
      height: 100vh;
      position: sticky;
      top: 0;
      flex-shrink: 0;
      z-index: 1040;
      transition: transform 0.2s ease, width 0.2s ease, margin-left 0.2s ease;
    }
    @media (min-width: 992px) {
      .ops-sidebar.desktop-collapsed {
        margin-left: -248px;
      }
    }
    @media (max-width: 991.98px) {
      .ops-sidebar {
        position: fixed;
        left: 0;
        top: 0;
        transform: translateX(-100%);
      }
      .ops-sidebar.mobile-open {
        transform: translateX(0);
      }
    }
    .sidebar-brand {
      padding: 1.2rem 1.25rem 1.1rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }
    .brand-logo {
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .brand-name {
      font-weight: 700;
      font-size: 1.2rem;
      color: #ffffff;
      line-height: 1.1;
      letter-spacing: -0.01em;
    }
    .brand-sub {
      font-size: 0.72rem;
      color: #94a3b8;
      margin-top: 2px;
    }
    .sidebar-scroll {
      flex: 1;
      overflow-y: auto;
      padding: 1rem 0.9rem;
    }
    .sidebar-link {
      display: flex;
      align-items: center;
      gap: 0.8rem;
      padding: 0.65rem 0.95rem;
      border-radius: 0.6rem;
      color: #cbd5e1;
      text-decoration: none;
      font-size: 0.9rem;
      font-weight: 500;
      transition: background-color 0.15s ease, color 0.15s ease;
      margin-bottom: 2px;
    }
    .sidebar-link i {
      font-size: 1.05rem;
      width: 20px;
      text-align: center;
      opacity: 0.9;
    }
    .sidebar-link:hover {
      background-color: rgba(255, 255, 255, 0.08);
      color: #ffffff;
    }
    .sidebar-link.active {
      background: linear-gradient(90deg, #1d74f5 0%, #2563eb 100%);
      color: #ffffff;
      font-weight: 600;
      box-shadow: 0 4px 12px rgba(29, 116, 245, 0.35);
    }
    .sidebar-link.active i {
      opacity: 1;
    }
    .sidebar-footer {
      padding: 0.5rem 1rem 1rem;
      text-align: center;
    }
    .world-map-wrap {
      color: #3b82f6;
      opacity: 0.24;
      margin-bottom: 0.25rem;
    }
    .world-map-svg {
      width: 100%;
      max-width: 200px;
      height: auto;
    }
    .footer-tagline {
      font-size: 0.74rem;
      color: #94a3b8;
      letter-spacing: 0.02em;
    }
  `]
})
export class SidebarComponent implements OnInit {
  @Input() mobileOpen = false;
  @Input() desktopCollapsed = false;
  @Output() closeMobile = new EventEmitter<void>();

  private readonly router = inject(Router);
  currentUrl = '';

  readonly navItems: NavItem[] = [
    { key: 'dashboard', label: 'Dashboard', route: '/dashboard', icon: 'bi-house-door-fill' },
    { key: 'customers', label: 'Customers', route: '/customers', icon: 'bi-people-fill' },
    { key: 'drivers', label: 'Drivers', route: '/drivers', icon: 'bi-person-badge-fill' },
    { key: 'hubs', label: 'Hubs', route: '/hubs', icon: 'bi-geo-alt-fill' },
    { key: 'shipments', label: 'Shipments', route: '/shipments', icon: 'bi-box-seam-fill' },
    { key: 'tracking', label: 'Tracking', route: '/tracking', icon: 'bi-pin-map-fill' },
    {
      key: 'delayed',
      label: 'Delayed Shipments',
      route: '/shipments',
      queryParams: { delayedOnly: 'true' },
      icon: 'bi-exclamation-triangle-fill'
    }
  ];

  ngOnInit(): void {
    this.currentUrl = this.router.url;
    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe((e) => {
        this.currentUrl = (e as NavigationEnd).urlAfterRedirects;
      });
  }

  isActive(key: string): boolean {
    const url = this.currentUrl || '';
    if (key === 'delayed') {
      return url.startsWith('/shipments') && url.includes('delayedOnly=true');
    }
    if (key === 'shipments') {
      return url.startsWith('/shipments') && !url.includes('delayedOnly=true');
    }
    if (key === 'dashboard') {
      return url === '/' || url.startsWith('/dashboard');
    }
    return url.startsWith('/' + key);
  }
}
