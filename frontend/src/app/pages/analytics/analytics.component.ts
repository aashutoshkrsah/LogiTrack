import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AnalyticsResponse } from '../../models/dashboard.model';
import { environment } from '../../../environments/environment';
import { DashboardService } from '../../services/dashboard.service';
import { DemoDataService } from '../../services/demo-data.service';
import { EmptyStateComponent, LoadingSpinnerComponent } from '../../shared/shared-ui';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule, RouterLink, LoadingSpinnerComponent, EmptyStateComponent],
  template: `
    <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
      <div>
        <h1 class="page-title">Analytics</h1>
        <p class="page-subtitle">Delivery performance, hub throughput and driver leaderboard</p>
      </div>
      <a routerLink="/dashboard" class="btn btn-outline-secondary btn-sm"><i class="bi bi-arrow-left me-1"></i>Back to Dashboard</a>
    </div>

    @if (demoMode) {
      <div class="demo-banner mb-3" role="alert">
        <i class="bi bi-exclamation-triangle-fill me-1"></i>
        <strong>DEMO DATA</strong> — backend unreachable at {{ apiBaseUrl }}. Start the Spring Boot API to see live data.
      </div>
    }
    @if (errorMessage && !demoMode) {
      <div class="alert alert-danger d-flex justify-content-between align-items-center gap-2">
        <div><i class="bi bi-exclamation-octagon-fill me-2"></i>{{ errorMessage }}</div>
        <button type="button" class="btn btn-outline-danger btn-sm" (click)="load()">Retry</button>
      </div>
    }

    @if (loading) {
      <div class="ops-card"><app-loading-spinner message="Loading analytics..."></app-loading-spinner></div>
    } @else if (analytics) {
      <section class="row g-3 mb-3">
        <div class="col-6 col-lg-3">
          <div class="ops-card ops-card-body">
            <div class="text-muted small fw-semibold text-uppercase">On-time delivery</div>
            <div class="fs-3 fw-bold tabular-nums">{{ analytics.onTimePct }}%</div>
            <div class="small text-muted">of delivered shipments on schedule</div>
          </div>
        </div>
        <div class="col-6 col-lg-3">
          <div class="ops-card ops-card-body">
            <div class="text-muted small fw-semibold text-uppercase">Avg delivery time</div>
            <div class="fs-3 fw-bold tabular-nums">{{ analytics.avgDeliveryDays }} days</div>
            <div class="small text-muted">created → delivered</div>
          </div>
        </div>
        <div class="col-6 col-lg-3">
          <div class="ops-card ops-card-body">
            <div class="text-muted small fw-semibold text-uppercase">Created (14 days)</div>
            <div class="fs-3 fw-bold tabular-nums">{{ totalCreated }}</div>
            <div class="small text-muted">shipments registered</div>
          </div>
        </div>
        <div class="col-6 col-lg-3">
          <div class="ops-card ops-card-body">
            <div class="text-muted small fw-semibold text-uppercase">Delivered (14 days)</div>
            <div class="fs-3 fw-bold tabular-nums">{{ totalDelivered }}</div>
            <div class="small text-muted">shipments completed</div>
          </div>
        </div>
      </section>

      <section class="row g-3 mb-3">
        <div class="col-12 col-lg-8">
          <div class="ops-card h-100">
            <div class="ops-card-header"><h6 class="mb-0 fw-bold"><i class="bi bi-bar-chart-fill text-primary me-2"></i>14-day trend — created vs delivered</h6></div>
            <div class="ops-card-body">
              @if (analytics.daily.length === 0) {
                <app-empty-state icon="bi-bar-chart" title="No trend data" description="No shipments in the last 14 days."></app-empty-state>
              } @else {
                <svg viewBox="0 0 560 200" class="w-100" role="img" aria-label="14-day shipment trend chart" style="max-height: 220px;">
                  @for (d of analytics.daily; track d.date; let i = $index) {
                    <rect [attr.x]="10 + i * 39" [attr.y]="170 - barHeight(d.created)" width="14" height="2" [attr.height]="barHeight(d.created)" fill="#3b82f6" rx="2">
                      <title>{{ d.date }}: {{ d.created }} created</title>
                    </rect>
                    <rect [attr.x]="26 + i * 39" [attr.y]="170 - barHeight(d.delivered)" width="14" height="2" [attr.height]="barHeight(d.delivered)" fill="#22c55e" rx="2">
                      <title>{{ d.date }}: {{ d.delivered }} delivered</title>
                    </rect>
                    <text [attr.x]="17 + i * 39" y="188" font-size="9" fill="#64748b" text-anchor="middle">{{ d.date.slice(5) }}</text>
                  }
                  <polyline [attr.points]="trendPoints" fill="none" stroke="#1d4ed8" stroke-width="2" />
                </svg>
                <div class="d-flex gap-3 small text-muted mt-2">
                  <span><span class="legend-dot" style="background:#3b82f6"></span> Created</span>
                  <span><span class="legend-dot" style="background:#22c55e"></span> Delivered</span>
                </div>
              }
            </div>
          </div>
        </div>
        <div class="col-12 col-lg-4">
          <div class="ops-card h-100">
            <div class="ops-card-header"><h6 class="mb-0 fw-bold"><i class="bi bi-pie-chart-fill text-primary me-2"></i>Status mix</h6></div>
            <div class="ops-card-body d-flex flex-column gap-2">
              @for (item of analytics.statusMix; track item.status) {
                <div>
                  <div class="d-flex justify-content-between small">
                    <span class="fw-medium">{{ item.status.replace('_', ' ') }}</span>
                    <span class="tabular-nums text-muted">{{ item.count }} ({{ item.percentage }}%)</span>
                  </div>
                  <div class="progress" style="height: 8px;" role="progressbar" [attr.aria-valuenow]="item.percentage" aria-valuemin="0" aria-valuemax="100">
                    <div class="progress-bar" [style.width.%]="item.percentage" [style.background]="statusColor(item.status)"></div>
                  </div>
                </div>
              }
            </div>
          </div>
        </div>
      </section>

      <section class="row g-3">
        <div class="col-12 col-lg-6">
          <div class="ops-card h-100">
            <div class="ops-card-header"><h6 class="mb-0 fw-bold"><i class="bi bi-geo-alt-fill text-primary me-2"></i>Hub throughput</h6></div>
            <div class="ops-card-body d-flex flex-column gap-3">
              @for (h of analytics.hubThroughput; track h.hubCode) {
                <div>
                  <div class="d-flex justify-content-between small">
                    <span class="fw-medium">{{ h.hubName }} <span class="text-muted">({{ h.city }})</span></span>
                    <span class="tabular-nums fw-bold">{{ h.count }}</span>
                  </div>
                  <div class="progress" style="height: 8px;">
                    <div class="progress-bar bg-primary" [style.width.%]="hubPct(h.count)"></div>
                  </div>
                </div>
              } @empty {
                <app-empty-state icon="bi-geo-alt" title="No hub data" description="Hub throughput will appear once shipments are registered."></app-empty-state>
              }
            </div>
          </div>
        </div>
        <div class="col-12 col-lg-6">
          <div class="ops-card h-100">
            <div class="ops-card-header"><h6 class="mb-0 fw-bold"><i class="bi bi-trophy-fill text-primary me-2"></i>Driver leaderboard</h6></div>
            <div class="table-responsive">
              <table class="table ops-table mb-0">
                <thead><tr><th>#</th><th>Driver</th><th class="text-end">Delivered</th><th class="text-end">Total</th></tr></thead>
                <tbody>
                  @for (d of analytics.driverLeaderboard; track d.driverCode; let i = $index) {
                    <tr>
                      <td class="tabular-nums">{{ i + 1 }}</td>
                      <td><div class="fw-semibold small">{{ d.driverName }}</div><div class="small text-muted">{{ d.driverCode }}</div></td>
                      <td class="text-end tabular-nums fw-bold">{{ d.deliveredCount }}</td>
                      <td class="text-end tabular-nums">{{ d.totalCount }}</td>
                    </tr>
                  } @empty {
                    <tr><td colspan="4" class="text-center text-muted py-4">No driver data yet.</td></tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    }
  `,
  styles: [`
    .legend-dot { display: inline-block; width: 9px; height: 9px; border-radius: 50%; margin-right: 4px; }
  `]
})
export class AnalyticsComponent implements OnInit {
  private readonly dashboardService = inject(DashboardService);
  private readonly demo = inject(DemoDataService);

  analytics: AnalyticsResponse | null = null;
  loading = true;
  errorMessage: string | null = null;
  demoMode = false;
  readonly apiBaseUrl = environment.apiBaseUrl;

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.errorMessage = null;
    this.demoMode = false;
    this.dashboardService.getAnalytics().subscribe({
      next: (data) => {
        this.analytics = data;
        this.loading = false;
      },
      error: (err) => {
        if (err?.status === 0) {
          this.analytics = this.demo.getAnalytics();
          this.demoMode = true;
          this.loading = false;
        } else {
          this.errorMessage = err?.message || 'Failed to load analytics.';
          this.loading = false;
        }
      }
    });
  }

  get totalCreated(): number {
    return (this.analytics?.daily ?? []).reduce((s, d) => s + d.created, 0);
  }

  get totalDelivered(): number {
    return (this.analytics?.daily ?? []).reduce((s, d) => s + d.delivered, 0);
  }

  private maxDaily(): number {
    return Math.max(1, ...(this.analytics?.daily ?? []).map((d) => Math.max(d.created, d.delivered)));
  }

  barHeight(v: number): number {
    return Math.max(v === 0 ? 0 : 4, Math.round((v / this.maxDaily()) * 150));
  }

  get trendPoints(): string {
    const daily = this.analytics?.daily ?? [];
    return daily
      .map((d, i) => `${17 + i * 39},${170 - this.barHeight(d.delivered)}`)
      .join(' ');
  }

  statusColor(status: string): string {
    const map: Record<string, string> = {
      PENDING: '#f59e0b', PICKED_UP: '#06b6d4', IN_TRANSIT: '#3b82f6',
      OUT_FOR_DELIVERY: '#8b5cf6', DELIVERED: '#22c55e', CANCELLED: '#94a3b8'
    };
    return map[status] ?? '#64748b';
  }

  hubPct(count: number): number {
    const max = Math.max(1, ...(this.analytics?.hubThroughput ?? []).map((h) => h.count));
    return Math.round((count / max) * 100);
  }
}
