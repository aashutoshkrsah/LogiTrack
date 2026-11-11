import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ShipmentTimelineResponse } from '../../models/tracking-event.model';
import { ShipmentService } from '../../services/shipment.service';
import { EmptyStateComponent, LoadingSpinnerComponent, StatusBadgeComponent, TrackingTimelineComponent } from '../../shared/shared-ui';

@Component({
  selector: 'app-public-track',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LoadingSpinnerComponent, EmptyStateComponent, StatusBadgeComponent, TrackingTimelineComponent],
  template: `
    <header class="public-header">
      <a routerLink="/login" class="brand text-decoration-none"><i class="bi bi-box-seam-fill me-1"></i>LogiTrack</a>
      <span class="text-muted small">Public shipment tracking — no sign-in required</span>
      <a routerLink="/login" class="btn btn-outline-primary btn-sm">Staff sign in</a>
    </header>

    <main class="public-main">
      <div class="text-center mb-4">
        <h1 class="page-title">Track your shipment</h1>
        <p class="page-subtitle">Enter the tracking number from your consignment receipt.</p>
      </div>

      <div class="ops-card mb-4">
        <div class="ops-card-body">
          <form class="row g-2 align-items-end" #f="ngForm" (ngSubmit)="onSearch(f)">
            <div class="col-12 col-md-9">
              <label class="form-label" for="trackingNumber">Tracking number</label>
              <input
                id="trackingNumber" name="trackingNumber" type="text" class="form-control text-uppercase"
                placeholder="e.g. TRK-2026-0001" [(ngModel)]="trackingNumber" required #tn="ngModel" />
            </div>
            <div class="col-12 col-md-3">
              <button type="submit" class="btn btn-primary w-100" [disabled]="loading || !trackingNumber.trim()">
                <i class="bi bi-search me-1"></i>Track
              </button>
            </div>
          </form>
          @if (tn.invalid && f.submitted) {
            <div class="text-danger small mt-2">Enter a tracking number.</div>
          }
        </div>
      </div>

      @if (loading) {
        <div class="ops-card"><app-loading-spinner message="Looking up your shipment..."></app-loading-spinner></div>
      } @else if (errorMessage) {
        <div class="ops-card">
          <app-empty-state icon="bi-search" title="Shipment not found" [description]="errorMessage"></app-empty-state>
        </div>
      } @else if (timeline) {
        <div class="row g-3">
          <div class="col-12 col-lg-4">
            <div class="ops-card">
              <div class="ops-card-header">
                <span class="code-badge">{{ timeline.shipment.trackingNumber }}</span>
                <app-status-badge [status]="timeline.shipment.shipmentStatus"></app-status-badge>
              </div>
              <div class="ops-card-body d-flex flex-column gap-3 small">
                @if (timeline.shipment.delayed) {
                  <div class="alert alert-danger py-2 mb-0">
                    <i class="bi bi-exclamation-triangle-fill me-1"></i>
                    <strong>Delayed:</strong> expected {{ timeline.shipment.expectedDeliveryDate | date:'dd MMM yyyy' }}.
                  </div>
                }
                <div>
                  <div class="text-muted fw-semibold text-uppercase">Route</div>
                  <div class="fw-medium">{{ timeline.shipment.originHubName }} ({{ timeline.shipment.originCity }})</div>
                  <div class="text-muted"><i class="bi bi-arrow-down me-1"></i>{{ timeline.shipment.destinationAddress }}, {{ timeline.shipment.destinationCity }}</div>
                </div>
                <div class="row g-2">
                  <div class="col-6">
                    <div class="text-muted fw-semibold text-uppercase">Expected delivery (ETA)</div>
                    <div class="fw-bold tabular-nums">{{ timeline.shipment.expectedDeliveryDate | date:'dd MMM yyyy' }}</div>
                  </div>
                  <div class="col-6">
                    <div class="text-muted fw-semibold text-uppercase">Weight</div>
                    <div class="tabular-nums">{{ timeline.shipment.weight | number:'1.2-2' }} kg</div>
                  </div>
                </div>
                <div>
                  <div class="text-muted fw-semibold text-uppercase">Created</div>
                  <div class="tabular-nums">{{ timeline.shipment.createdDate | date:'dd MMM yyyy' }}</div>
                </div>
              </div>
            </div>
          </div>
          <div class="col-12 col-lg-8">
            <div class="ops-card">
              <div class="ops-card-header"><h6 class="mb-0 fw-bold">Delivery timeline</h6></div>
              <div class="ops-card-body">
                <app-tracking-timeline [events]="timeline.events" [currentShipmentStatus]="timeline.shipment.shipmentStatus"></app-tracking-timeline>
              </div>
            </div>
          </div>
        </div>
      }
    </main>
  `,
  styles: [`
    .public-header {
      display: flex; align-items: center; justify-content: space-between; gap: 1rem; flex-wrap: wrap;
      background: var(--lt-bg-surface); border-bottom: 1px solid var(--lt-border-color);
      padding: 0.85rem 1.5rem; position: sticky; top: 0; z-index: 1020;
    }
    .brand { font-size: 1.25rem; font-weight: 700; color: var(--lt-text-primary); }
    .public-main { max-width: 960px; margin: 0 auto; padding: 2.5rem 1rem; }
    @media (max-width: 575.98px) { .public-header span { display: none; } }
  `]
})
export class PublicTrackComponent {
  private readonly shipmentService = inject(ShipmentService);

  trackingNumber = '';
  timeline: ShipmentTimelineResponse | null = null;
  loading = false;
  errorMessage: string | null = null;

  onSearch(form: NgForm): void {
    if (form.invalid || !this.trackingNumber.trim()) return;
    this.loading = true;
    this.errorMessage = null;
    this.timeline = null;
    this.shipmentService.trackPublic(this.trackingNumber.trim()).subscribe({
      next: (data) => {
        this.timeline = data;
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = err?.status === 0
          ? 'The tracking service is unreachable right now. Please try again later.'
          : (err?.message || 'No shipment matches that tracking number.');
        this.loading = false;
      }
    });
  }
}
