import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter } from 'rxjs';
import { DashboardService } from '../../services/dashboard.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <header class="ops-header">
      <div class="d-flex align-items-center gap-3 flex-grow-1" style="max-width: 460px;">
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
              placeholder="Search by tracking number..."
              [(ngModel)]="quickTrackingNumber"
              name="quickTrackingNumber" />
          </div>
        </form>
      </div>

      <div class="d-flex align-items-center gap-3">
        <a
          routerLink="/shipments"
          [queryParams]="{ delayedOnly: 'true' }"
          class="bell-btn text-decoration-none"
          title="View delayed shipments">
          <i class="bi bi-bell fs-5 text-secondary"></i>
          @if (delayedCount > 0) {
            <span class="bell-badge tabular-nums">{{ delayedCount }}</span>
          }
        </a>

        <div class="d-flex align-items-center gap-2">
          <div class="ops-avatar">OP</div>
          <span class="small fw-semibold text-dark d-none d-sm-inline">Operations Desk</span>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .ops-header {
      background: #ffffff;
      border-bottom: 1px solid #e5e9f2;
      padding: 0.65rem 1.5rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      position: sticky;
      top: 0;
      z-index: 1020;
      min-height: 62px;
    }
    .search-pill {
      display: flex;
      align-items: center;
      gap: 0.55rem;
      background-color: #f1f5f9;
      border: 1px solid #e2e8f0;
      border-radius: 9999px;
      padding: 0.42rem 1rem;
      transition: border-color 0.15s ease, background-color 0.15s ease;
    }
    .search-pill:focus-within {
      background-color: #ffffff;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.12);
    }
    .search-pill-input {
      border: none;
      background: transparent;
      outline: none;
      width: 100%;
      font-size: 0.875rem;
      color: #0f172a;
    }
    .search-pill-input::placeholder {
      color: #64748b;
    }
    .bell-btn {
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      transition: background-color 0.15s ease;
    }
    .bell-btn:hover {
      background-color: #f1f5f9;
    }
    .bell-badge {
      position: absolute;
      top: 1px;
      right: 1px;
      min-width: 17px;
      height: 17px;
      padding: 0 4px;
      border-radius: 9999px;
      background-color: #ef4444;
      color: #ffffff;
      font-size: 0.68rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid #ffffff;
    }
    .ops-avatar {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      background-color: #0f2b5b;
      color: #ffffff;
      font-size: 0.78rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      letter-spacing: 0.03em;
    }
  `]
})
export class HeaderComponent implements OnInit {
  @Input() title = 'Logistics Operations';
  @Output() toggleSidebar = new EventEmitter<void>();

  private readonly router = inject(Router);
  private readonly dashboardService = inject(DashboardService);

  quickTrackingNumber = '';
  delayedCount = 0;

  ngOnInit(): void {
    this.refreshDelayedCount();
    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe(() => this.refreshDelayedCount());
  }

  private refreshDelayedCount(): void {
    this.dashboardService.getSummary().subscribe({
      next: (summary) => {
        this.delayedCount = summary.delayedShipmentsCount;
      },
      error: () => {
        this.delayedCount = 0;
      }
    });
  }

  onQuickSearch(): void {
    const trimmed = this.quickTrackingNumber.trim();
    if (!trimmed) {
      this.router.navigate(['/tracking']);
      return;
    }
    this.router.navigate(['/tracking'], { queryParams: { trackingNumber: trimmed } });
  }
}
