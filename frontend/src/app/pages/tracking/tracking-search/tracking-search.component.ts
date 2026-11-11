import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ShipmentResponse, ShipmentStatus } from '../../../models/shipment.model';
import { ShipmentTimelineResponse, TrackingEventResponse } from '../../../models/tracking-event.model';
import { ShipmentService } from '../../../services/shipment.service';
import { TrackingEventService } from '../../../services/tracking-event.service';
import {
  EmptyStateComponent,
  LoadingSpinnerComponent,
  StatusBadgeComponent,
  TrackingTimelineComponent
} from '../../../shared/shared-ui';

@Component({
  selector: 'app-tracking-search',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    StatusBadgeComponent,
    TrackingTimelineComponent
  ],
  template: `
    <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
      <div>
        <h1 class="page-title">Shipment Tracking &amp; Timeline Lookup</h1>
        <p class="page-subtitle">Search any consignment by tracking number or browse recent network tracking events</p>
      </div>
      <a routerLink="/shipments" class="btn btn-outline-secondary btn-sm">
        <i class="bi bi-box-seam me-1"></i>View All Shipments
      </a>
    </div>

    <div class="ops-card mb-4">
      <div class="ops-card-body">
        <form class="row g-2 align-items-end" (ngSubmit)="searchTimeline()">
          <div class="col-12 col-md-8 col-lg-6">
            <label for="trackingLookup" class="form-label">Tracking Number</label>
            <div class="input-group">
              <span class="input-group-text bg-white"><i class="bi bi-upc-scan text-primary"></i></span>
              <input
                id="trackingLookup"
                type="text"
                class="form-control text-uppercase"
                placeholder="Enter tracking number (e.g. TRK-2026-0001)"
                [(ngModel)]="trackingInput"
                name="trackingInput" />
              <button type="submit" class="btn btn-primary px-4" [disabled]="loading">
                <i class="bi bi-search me-1"></i>Track
              </button>
            </div>
          </div>
        </form>

        @if (recentShipments.length > 0) {
          <div class="mt-3 d-flex flex-wrap align-items-center gap-2">
            <span class="small text-muted fw-semibold">Quick lookup:</span>
            @for (s of recentShipments; track s.shipmentId) {
              <button
                type="button"
                class="btn btn-outline-secondary btn-sm py-0 px-2 code-badge"
                (click)="selectQuickTracking(s.trackingNumber)">
                {{ s.trackingNumber }}
              </button>
            }
          </div>
        }
      </div>
    </div>

    @if (loading) {
      <div class="ops-card mb-4"><app-loading-spinner message="Fetching shipment timeline..."></app-loading-spinner></div>
    } @else if (errorMessage) {
      <div class="ops-card mb-4">
        <app-empty-state
          icon="bi-search"
          title="Tracking number not found"
          [description]="errorMessage">
        </app-empty-state>
      </div>
    } @else if (timeline) {
      <div class="row g-4 mb-4">
        <div class="col-12 col-lg-4">
          <div class="ops-card">
            <div class="ops-card-header">
              <span class="code-badge">{{ timeline.shipment.trackingNumber }}</span>
              <app-status-badge [status]="timeline.shipment.shipmentStatus" [delayed]="false"></app-status-badge>
            </div>
            <div class="ops-card-body">
              @if (timeline.shipment.delayed) {
                <div class="alert alert-danger py-2 small mb-3">
                  <i class="bi bi-exclamation-triangle-fill me-1"></i>
                  <strong>Overdue Shipment:</strong> Expected delivery was {{ timeline.shipment.expectedDeliveryDate | date:'dd MMM yyyy' }}.
                </div>
              }

              <div class="d-flex flex-column gap-3 small">
                <div>
                  <div class="text-muted fw-semibold text-uppercase">Customer</div>
                  <div class="fw-bold text-dark">{{ timeline.shipment.customerName }}</div>
                </div>
                <div>
                  <div class="text-muted fw-semibold text-uppercase">Route</div>
                  <div class="fw-medium">{{ timeline.shipment.originHubName }} ({{ timeline.shipment.originCity }})</div>
                  <div class="text-muted"><i class="bi bi-arrow-down me-1"></i>{{ timeline.shipment.destinationAddress }}, {{ timeline.shipment.destinationCity }}</div>
                </div>
                <div>
                  <div class="text-muted fw-semibold text-uppercase">Assigned Driver</div>
                  <div class="fw-medium">{{ timeline.shipment.driverName || 'Unassigned' }}</div>
                </div>
                <div class="row g-2">
                  <div class="col-6">
                    <div class="text-muted fw-semibold text-uppercase">Created</div>
                    <div class="tabular-nums">{{ timeline.shipment.createdDate | date:'dd MMM yyyy' }}</div>
                  </div>
                  <div class="col-6">
                    <div class="text-muted fw-semibold text-uppercase">Expected</div>
                    <div class="tabular-nums">{{ timeline.shipment.expectedDeliveryDate | date:'dd MMM yyyy' }}</div>
                  </div>
                </div>
              </div>

              <div class="mt-4 pt-3 border-top d-grid">
                <a [routerLink]="['/shipments', timeline.shipment.shipmentId]" class="btn btn-primary btn-sm">
                  <i class="bi bi-pencil-square me-1"></i>Manage &amp; Record Milestones
                </a>
              </div>
            </div>
          </div>
        </div>

        <div class="col-12 col-lg-8">
          <div class="ops-card">
            <div class="ops-card-header">
              <div>
                <h6 class="mb-0 fw-bold">Chronological Tracking Timeline</h6>
                <div class="small text-muted">Ordered oldest to latest milestone</div>
              </div>
              <span class="badge bg-light text-dark border tabular-nums">{{ timeline.events.length }} Event(s)</span>
            </div>
            <div class="ops-card-body">
              <app-tracking-timeline
                [events]="timeline.events"
                [currentShipmentStatus]="timeline.shipment.shipmentStatus"
                [editable]="false">
              </app-tracking-timeline>
            </div>
          </div>
        </div>
      </div>
    } @else {
      <div class="ops-card mb-4">
        <app-empty-state
          icon="bi-upc-scan"
          title="Enter a tracking number"
          description="Use the search box above or select one of the quick tracking pills to inspect its milestone history.">
        </app-empty-state>
      </div>
    }

    <!-- Network-Wide Tracking Events Audit Log -->
    <div class="ops-card overflow-hidden">
      <div class="ops-card-header">
        <div>
          <h6 class="mb-0 fw-bold">Network Tracking Events Log</h6>
          <div class="small text-muted">Latest staff-recorded milestone events across all consignments</div>
        </div>
        <div class="d-flex align-items-center gap-2">
          <select
            class="form-select form-select-sm"
            style="width: auto;"
            [(ngModel)]="eventStatusFilter"
            (change)="loadAllEvents()">
            <option value="">All Milestone Statuses</option>
            @for (st of statuses; track st) {
              <option [value]="st">{{ st.replace('_', ' ') }}</option>
            }
          </select>
        </div>
      </div>

      @if (loadingEvents) {
        <app-loading-spinner message="Loading network tracking events..."></app-loading-spinner>
      } @else if (networkEvents.length === 0) {
        <app-empty-state
          icon="bi-clock-history"
          title="No tracking events recorded"
          description="Events recorded on shipments will appear here.">
        </app-empty-state>
      } @else {
        <div class="table-responsive">
          <table class="table ops-table">
            <thead>
              <tr>
                <th>Date &amp; Time</th>
                <th>Tracking #</th>
                <th>Milestone</th>
                <th>Hub</th>
                <th>Remarks</th>
                <th>Updated By</th>
              </tr>
            </thead>
            <tbody>
              @for (ev of networkEvents; track ev.eventId) {
                <tr>
                  <td class="tabular-nums small">{{ ev.eventDateTime | date:'dd MMM yyyy, HH:mm' }}</td>
                  <td>
                    <button
                      type="button"
                      class="btn btn-link p-0 code-badge text-decoration-none"
                      (click)="selectQuickTracking(ev.trackingNumber)">
                      {{ ev.trackingNumber }}
                    </button>
                  </td>
                  <td><app-status-badge [status]="ev.eventStatus"></app-status-badge></td>
                  <td class="small">{{ ev.hubName ? ev.hubCode + ' — ' + ev.hubCity : 'In Transit / Field' }}</td>
                  <td class="small text-secondary">{{ ev.remarks || '—' }}</td>
                  <td class="small fw-medium">{{ ev.updatedBy }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>
  `
})
export class TrackingSearchComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly shipmentService = inject(ShipmentService);
  private readonly trackingEventService = inject(TrackingEventService);

  readonly statuses: ShipmentStatus[] = [
    'PENDING',
    'PICKED_UP',
    'IN_TRANSIT',
    'OUT_FOR_DELIVERY',
    'DELIVERED',
    'CANCELLED'
  ];

  trackingInput = '';
  timeline: ShipmentTimelineResponse | null = null;
  recentShipments: ShipmentResponse[] = [];
  networkEvents: TrackingEventResponse[] = [];
  eventStatusFilter: ShipmentStatus | '' = '';
  loading = false;
  loadingEvents = true;
  errorMessage: string | null = null;

  ngOnInit(): void {
    this.shipmentService.getAll().subscribe({
      next: (list) => {
        this.recentShipments = list.slice(0, 6);
      },
      error: () => {
        this.recentShipments = [];
      }
    });

    this.loadAllEvents();

    this.route.queryParams.subscribe((params) => {
      if (params['trackingNumber']) {
        this.trackingInput = params['trackingNumber'];
        this.searchTimeline();
      }
    });
  }

  loadAllEvents(): void {
    this.loadingEvents = true;
    this.trackingEventService.getAll(undefined, undefined, this.eventStatusFilter).subscribe({
      next: (events) => {
        this.networkEvents = events.slice(0, 20);
        this.loadingEvents = false;
      },
      error: () => {
        this.networkEvents = [];
        this.loadingEvents = false;
      }
    });
  }

  selectQuickTracking(trackingNumber: string): void {
    this.trackingInput = trackingNumber;
    this.searchTimeline();
  }

  searchTimeline(): void {
    const trimmed = this.trackingInput.trim();
    if (!trimmed) {
      this.timeline = null;
      this.errorMessage = 'Please enter a tracking number to search.';
      return;
    }

    this.loading = true;
    this.errorMessage = null;
    this.timeline = null;
    this.shipmentService.getTimelineByTrackingNumber(trimmed).subscribe({
      next: (res) => {
        this.timeline = res;
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = err.message || `No shipment found with tracking number "${trimmed}".`;
        this.loading = false;
      }
    });
  }
}
