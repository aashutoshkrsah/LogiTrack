import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NotificationsResponse } from '../../models/dashboard.model';
import { environment } from '../../../environments/environment';
import { DashboardService } from '../../services/dashboard.service';
import { DemoDataService } from '../../services/demo-data.service';
import { NotificationService } from '../../services/notification.service';
import { ShipmentService } from '../../services/shipment.service';
import { EmptyStateComponent, LoadingSpinnerComponent, StatusBadgeComponent } from '../../shared/shared-ui';

const READ_KEY = 'logitrack-read-notifications';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, RouterLink, LoadingSpinnerComponent, EmptyStateComponent, StatusBadgeComponent],
  template: `
    <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
      <div>
        <h1 class="page-title">Notifications</h1>
        <p class="page-subtitle">Delayed shipments and recent tracking events</p>
      </div>
      <button type="button" class="btn btn-outline-secondary btn-sm" (click)="markAllRead()" [disabled]="unreadCount === 0">
        <i class="bi bi-check2-all me-1"></i>Mark all read
      </button>
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
      <div class="ops-card"><app-loading-spinner message="Loading notifications..."></app-loading-spinner></div>
    } @else if (data) {
      <div class="alert alert-info d-flex align-items-center gap-2">
        <i class="bi bi-bell-fill"></i>
        <span><strong class="tabular-nums">{{ unreadCount }}</strong> unread notification(s) &nbsp;·&nbsp; {{ data.delayedShipments.length }} delayed shipment(s)</span>
      </div>

      <div class="row g-3">
        <div class="col-12 col-lg-6">
          <div class="ops-card h-100">
            <div class="ops-card-header"><h6 class="mb-0 fw-bold"><i class="bi bi-exclamation-triangle-fill text-danger me-2"></i>Delayed shipments</h6></div>
            <div class="ops-card-body d-flex flex-column gap-2">
              @for (s of data.delayedShipments; track s.shipmentId) {
                <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 border rounded p-2">
                  <div>
                    <a [routerLink]="['/shipments', s.shipmentId]" class="code-badge text-decoration-none">{{ s.trackingNumber }}</a>
                    <div class="small text-muted mt-1">{{ s.customerName }} · expected {{ s.expectedDeliveryDate | date:'dd MMM yyyy' }}</div>
                  </div>
                  <div class="d-flex gap-2 align-items-center">
                    <app-status-badge [status]="s.shipmentStatus"></app-status-badge>
                    @if (!demoMode) {
                      <button type="button" class="btn btn-outline-primary btn-sm" (click)="advance(s.shipmentId)" [disabled]="advancingId === s.shipmentId">
                        Advance
                      </button>
                    }
                    <a [routerLink]="['/shipments', s.shipmentId]" class="btn btn-outline-secondary btn-sm">View</a>
                  </div>
                </div>
              } @empty {
                <app-empty-state icon="bi-check-circle" title="No delayed shipments" description="All active consignments are within their expected delivery window."></app-empty-state>
              }
            </div>
          </div>
        </div>

        <div class="col-12 col-lg-6">
          <div class="ops-card h-100">
            <div class="ops-card-header"><h6 class="mb-0 fw-bold"><i class="bi bi-clock-history text-primary me-2"></i>Recent events</h6></div>
            <div class="ops-card-body d-flex flex-column gap-2">
              @for (ev of data.recentEvents; track ev.eventId) {
                <div class="d-flex justify-content-between align-items-start gap-2 border rounded p-2" [class.opacity-75]="isRead(ev.eventId)">
                  <div class="min-w-0">
                    <div class="d-flex gap-2 align-items-center flex-wrap">
                      <app-status-badge [status]="ev.eventStatus"></app-status-badge>
                      <span class="code-badge">{{ ev.trackingNumber }}</span>
                      @if (!isRead(ev.eventId)) { <span class="badge bg-primary">New</span> }
                    </div>
                    <div class="small text-muted mt-1">{{ ev.remarks || 'No remarks.' }} — {{ ev.updatedBy }}</div>
                  </div>
                  <span class="small text-muted tabular-nums text-nowrap">{{ ev.eventDateTime | date:'dd MMM, HH:mm' }}</span>
                </div>
              } @empty {
                <app-empty-state icon="bi-clock-history" title="No recent events" description="Tracking milestones will appear here."></app-empty-state>
              }
            </div>
          </div>
        </div>
      </div>
    }
  `
})
export class NotificationsComponent implements OnInit {
  private readonly dashboardService = inject(DashboardService);
  private readonly demo = inject(DemoDataService);
  private readonly shipmentService = inject(ShipmentService);
  private readonly notification = inject(NotificationService);

  data: NotificationsResponse | null = null;
  loading = true;
  errorMessage: string | null = null;
  demoMode = false;
  advancingId: number | null = null;
  readonly apiBaseUrl = environment.apiBaseUrl;
  private readIds = new Set<number>(this.readStored());

  ngOnInit(): void {
    this.load();
  }

  get unreadCount(): number {
    if (!this.data) return 0;
    const unreadEvents = this.data.recentEvents.filter((e) => !this.readIds.has(e.eventId)).length;
    return unreadEvents + this.data.delayedShipments.length;
  }

  load(): void {
    this.loading = true;
    this.errorMessage = null;
    this.demoMode = false;
    this.dashboardService.getNotifications().subscribe({
      next: (data) => {
        this.data = data;
        this.loading = false;
      },
      error: (err) => {
        if (err?.status === 0) {
          this.data = this.demo.getNotifications();
          this.demoMode = true;
          this.loading = false;
        } else {
          this.errorMessage = err?.message || 'Failed to load notifications.';
          this.loading = false;
        }
      }
    });
  }

  isRead(eventId: number): boolean {
    return this.readIds.has(eventId);
  }

  markAllRead(): void {
    if (!this.data) return;
    this.data.recentEvents.forEach((e) => this.readIds.add(e.eventId));
    try {
      localStorage.setItem(READ_KEY, JSON.stringify([...this.readIds]));
    } catch {
      /* storage unavailable */
    }
  }

  advance(shipmentId: number): void {
    this.advancingId = shipmentId;
    this.shipmentService.advance(shipmentId).subscribe({
      next: (updated) => {
        this.advancingId = null;
        this.notification.success(`Shipment ${updated.trackingNumber} advanced to ${updated.shipmentStatus.replace(/_/g, ' ')}.`);
        this.load();
      },
      error: (err) => {
        this.advancingId = null;
        this.notification.error(err?.message || 'Could not advance shipment.');
      }
    });
  }

  private readStored(): number[] {
    try {
      return JSON.parse(localStorage.getItem(READ_KEY) ?? '[]') as number[];
    } catch {
      return [];
    }
  }
}
