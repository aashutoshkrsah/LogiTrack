import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { DashboardService } from '../../services/dashboard.service';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <header class="ops-header">
      <div class="d-flex align-items-center gap-3 flex-grow-1" style="max-width: 520px;">
        <button
          type="button"
          class="btn btn-light btn-sm border-0 text-secondary p-1 px-2"
          aria-label="Toggle navigation menu"
          (click)="toggleSidebar.emit()">
          <i class="bi bi-list fs-4 lh-1"></i>
        </button>

        <form class="quick-track-form flex-grow-1" (ngSubmit)="onQuickSearch()">
          <div class="search-pill">
            <i class="bi bi-search text-muted"></i>
            <input
              type="text"
              class="search-pill-input"
              placeholder="Search tracking no., customer or driver..."
              [(ngModel)]="quickSearch"
              name="quickSearch"
              aria-label="Global search" />
          </div>
        </form>
      </div>

      <div class="d-flex align-items-center gap-2">
        <span
          class="status-dot"
          [class.online]="backendOnline"
          [class.offline]="!backendOnline"
          [title]="backendOnline ? 'Backend API reachable' : 'Backend API unreachable'">
        </span>

        <button
          type="button"
          class="btn btn-light btn-sm border-0"
          [attr.aria-label]="themeService.theme() === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'"
          [title]="themeService.theme() === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'"
          (click)="themeService.toggle()">
          <i class="bi" [ngClass]="themeService.theme() === 'dark' ? 'bi-sun-fill' : 'bi-moon-fill'"></i>
        </button>

        <div class="position-relative">
          <button
            type="button"
            class="bell-btn text-decoration-none"
            title="Notifications"
            aria-label="Notifications"
            (click)="toggleNotifications($event)">
            <i class="bi bi-bell fs-5 text-secondary"></i>
            @if (unreadCount > 0) {
              <span class="bell-badge tabular-nums">{{ unreadCount }}</span>
            }
          </button>
          @if (notifOpen) {
            <div class="notif-dropdown ops-card">
              <div class="d-flex justify-content-between align-items-center px-3 py-2 border-bottom">
                <strong class="small">Notifications</strong>
                <button type="button" class="btn btn-link btn-sm p-0" (click)="markAllRead()">Mark all read</button>
              </div>
              @if (delayedShipments.length === 0 && recentEvents.length === 0) {
                <div class="p-3 small text-muted text-center">No notifications right now.</div>
              } @else {
                @for (s of delayedShipments.slice(0, 3); track s.shipmentId) {
                  <a [routerLink]="['/shipments', s.shipmentId]" class="notif-item" (click)="notifOpen = false">
                    <i class="bi bi-exclamation-triangle-fill text-danger me-2"></i>
                    <span><strong>{{ s.trackingNumber }}</strong> is delayed — expected {{ s.expectedDeliveryDate | date:'dd MMM yyyy' }}</span>
                  </a>
                }
                @for (ev of recentEvents.slice(0, 3); track ev.eventId) {
                  <a [routerLink]="['/shipments', ev.shipmentId]" class="notif-item" (click)="notifOpen = false">
                    <i class="bi bi-clock-history text-primary me-2"></i>
                    <span>{{ ev.trackingNumber }} — {{ ev.eventStatus.replace('_', ' ') }}</span>
                  </a>
                }
              }
              <a routerLink="/notifications" class="notif-item text-center fw-semibold text-primary" (click)="notifOpen = false">
                View all notifications
              </a>
            </div>
          }
        </div>

        <div class="position-relative">
          <button
            type="button"
            class="btn btn-light btn-sm d-flex align-items-center gap-2 border-0"
            (click)="toggleUserMenu($event)"
            aria-label="Account menu">
            <div class="ops-avatar">{{ userInitials }}</div>
            <span class="small fw-semibold text-dark d-none d-sm-inline">{{ auth.currentUser()?.name ?? 'Operations Desk' }}</span>
            <i class="bi bi-chevron-down small text-muted"></i>
          </button>
          @if (userMenuOpen) {
            <div class="user-dropdown ops-card">
              <div class="px-3 py-2 border-bottom">
                <div class="fw-semibold small">{{ auth.currentUser()?.name ?? 'Operations Desk' }}</div>
                <div class="small text-muted">{{ auth.currentUser()?.email ?? '' }}</div>
                <span class="badge bg-primary-subtle text-primary mt-1">{{ auth.currentUser()?.role ?? 'STAFF' }}</span>
              </div>
              <a routerLink="/settings" class="notif-item" (click)="userMenuOpen = false"><i class="bi bi-gear me-2"></i>Settings</a>
              <a routerLink="/track" class="notif-item" (click)="userMenuOpen = false"><i class="bi bi-upc-scan me-2"></i>Public tracking</a>
              <button type="button" class="notif-item w-100 text-start border-0 bg-transparent text-danger" (click)="logout()">
                <i class="bi bi-box-arrow-right me-2"></i>Log out
              </button>
            </div>
          }
        </div>
      </div>
    </header>
  `,
  styles: [`
    .ops-header {
      background: var(--lt-bg-surface);
      border-bottom: 1px solid var(--lt-border-color);
      padding: 0.65rem 1.5rem;
      display: flex; align-items: center; justify-content: space-between;
      gap: 1rem; position: sticky; top: 0; z-index: 1020; min-height: 62px;
    }
    .search-pill {
      display: flex; align-items: center; gap: 0.55rem;
      background-color: var(--lt-table-head-bg);
      border: 1px solid var(--lt-border-color);
      border-radius: 9999px; padding: 0.42rem 1rem;
    }
    .search-pill:focus-within { background-color: var(--lt-input-bg); border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.12); }
    .search-pill-input { border: none; background: transparent; outline: none; width: 100%; font-size: 0.875rem; color: var(--lt-text-primary); }
    .search-pill-input::placeholder { color: var(--lt-text-muted); }
    .status-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
    .status-dot.online { background: #22c55e; box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.2); }
    .status-dot.offline { background: #94a3b8; }
    .bell-btn {
      position: relative; display: inline-flex; align-items: center; justify-content: center;
      width: 36px; height: 36px; border-radius: 50%; border: none; background: transparent; cursor: pointer;
    }
    .bell-btn:hover { background-color: var(--lt-table-row-hover); }
    .bell-badge {
      position: absolute; top: 1px; right: 1px; min-width: 17px; height: 17px; padding: 0 4px;
      border-radius: 9999px; background-color: #ef4444; color: #fff; font-size: 0.68rem; font-weight: 700;
      display: flex; align-items: center; justify-content: center; border: 2px solid var(--lt-bg-surface);
    }
    .ops-avatar {
      width: 34px; height: 34px; border-radius: 50%; background-color: #0f2b5b; color: #fff;
      font-size: 0.78rem; font-weight: 700; display: flex; align-items: center; justify-content: center;
    }
    .notif-dropdown, .user-dropdown {
      position: absolute; right: 0; top: calc(100% + 8px); width: 320px; z-index: 1050;
      box-shadow: var(--lt-shadow-md); overflow: hidden;
    }
    .user-dropdown { width: 240px; }
    .notif-item {
      display: flex; align-items: flex-start; gap: 0.25rem; padding: 0.6rem 1rem;
      font-size: 0.84rem; color: var(--lt-text-primary); text-decoration: none; cursor: pointer;
    }
    .notif-item:hover { background-color: var(--lt-table-row-hover); }
  `]
})
export class HeaderComponent implements OnInit {
  @Output() toggleSidebar = new EventEmitter<void>();
  /** Kept for backward compatibility with MainLayout (title is derived from route data). */
  // eslint-disable-next-line @angular-eslint/no-input-rename
  @Input() title = 'Logistics Operations';

  private readonly router = inject(Router);
  private readonly dashboardService = inject(DashboardService);
  readonly auth = inject(AuthService);
  readonly themeService = inject(ThemeService);

  quickSearch = '';
  delayedCount = 0;
  unreadCount = 0;
  backendOnline = false;
  notifOpen = false;
  userMenuOpen = false;
  delayedShipments: { shipmentId: number; trackingNumber: string; expectedDeliveryDate: string }[] = [];
  recentEvents: { eventId: number; shipmentId: number; trackingNumber: string; eventStatus: string }[] = [];

  get userInitials(): string {
    const name = this.auth.currentUser()?.name ?? 'OP';
    return name.split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase();
  }

  ngOnInit(): void {
    this.refreshStatus();
    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe(() => {
        this.notifOpen = false;
        this.userMenuOpen = false;
        this.refreshStatus();
      });
  }

  private refreshStatus(): void {
    this.dashboardService.getSummary().subscribe({
      next: (summary) => {
        this.backendOnline = true;
        this.delayedCount = summary.delayedShipmentsCount;
        this.delayedShipments = summary.delayedShipments ?? [];
        this.recentEvents = summary.recentTrackingEvents ?? [];
        this.unreadCount = this.computeUnread();
      },
      error: () => {
        this.backendOnline = false;
        this.delayedCount = 0;
        this.unreadCount = 0;
      }
    });
    // Notifications endpoint (may not exist on older backends) — failure is silent.
    this.dashboardService.getNotifications().subscribe({
      next: (n) => {
        this.unreadCount = Math.max(this.computeUnread(), n.unreadCount ?? 0);
        this.delayedShipments = n.delayedShipments ?? this.delayedShipments;
        this.recentEvents = n.recentEvents ?? this.recentEvents;
      },
      error: () => { /* keep summary-derived counts */ }
    });
  }

  private computeUnread(): number {
    let read: number[] = [];
    try {
      read = JSON.parse(localStorage.getItem('logitrack-read-notifications') ?? '[]') as number[];
    } catch {
      read = [];
    }
    const unreadEvents = this.recentEvents.filter((e) => !read.includes(e.eventId)).length;
    return unreadEvents + this.delayedShipments.length;
  }

  toggleNotifications(event: Event): void {
    event.stopPropagation();
    this.notifOpen = !this.notifOpen;
    this.userMenuOpen = false;
  }

  toggleUserMenu(event: Event): void {
    event.stopPropagation();
    this.userMenuOpen = !this.userMenuOpen;
    this.notifOpen = false;
  }

  markAllRead(): void {
    const ids = this.recentEvents.map((e) => e.eventId);
    try {
      localStorage.setItem('logitrack-read-notifications', JSON.stringify(ids));
    } catch {
      /* storage unavailable */
    }
    this.unreadCount = this.delayedShipments.length;
    this.notifOpen = false;
    void this.router.navigate(['/notifications']);
  }

  logout(): void {
    this.userMenuOpen = false;
    this.auth.logout();
  }

  onQuickSearch(): void {
    const trimmed = this.quickSearch.trim();
    if (!trimmed) {
      void this.router.navigate(['/tracking']);
      return;
    }
    if (/TRK/i.test(trimmed) || trimmed.includes('-')) {
      void this.router.navigate(['/tracking'], { queryParams: { trackingNumber: trimmed } });
    } else {
      void this.router.navigate(['/customers'], { queryParams: { search: trimmed } });
    }
  }
}
