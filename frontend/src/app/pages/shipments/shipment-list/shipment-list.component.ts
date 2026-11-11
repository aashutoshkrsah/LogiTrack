import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ShipmentResponse, ShipmentStatus } from '../../../models/shipment.model';
import { NotificationService } from '../../../services/notification.service';
import { ShipmentService } from '../../../services/shipment.service';
import {
  ConfirmDialogComponent,
  DataTableComponent,
  SearchFilterBarComponent,
  StatusBadgeComponent
} from '../../../shared/shared-ui';

@Component({
  selector: 'app-shipment-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    DataTableComponent,
    SearchFilterBarComponent,
    StatusBadgeComponent,
    ConfirmDialogComponent
  ],
  template: `
    <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
      <div>
        <h1 class="page-title">Shipment Consignments</h1>
        <p class="page-subtitle">Register consignments, filter by status or date, and monitor delivery progress</p>
      </div>
      <div class="d-flex gap-2">
        <a routerLink="/tracking" class="btn btn-outline-secondary btn-sm">
          <i class="bi bi-signpost-split me-1"></i>Track by Number
        </a>
        <a routerLink="/shipments/new" class="btn btn-primary btn-sm">
          <i class="bi bi-plus-lg me-1"></i>Register Shipment
        </a>
      </div>
    </div>

    <app-search-filter-bar
      searchLabel="Search Tracking / City / Customer"
      placeholder="Tracking #, destination city, or customer..."
      [(searchTerm)]="trackingSearch"
      (searchSubmit)="loadShipments()"
      (resetFilters)="onReset()">
      <div class="col-6 col-md-2">
        <label class="form-label small text-muted mb-1">Status</label>
        <select class="form-select form-select-sm" [(ngModel)]="statusFilter" (change)="loadShipments()">
          <option value="">All Statuses</option>
          @for (st of statuses; track st) {
            <option [value]="st">{{ st.replace('_', ' ') }}</option>
          }
        </select>
      </div>
      <div class="col-6 col-md-2">
        <label class="form-label small text-muted mb-1">Created From</label>
        <input type="date" class="form-control form-control-sm" [(ngModel)]="fromDate" (change)="loadShipments()" />
      </div>
      <div class="col-6 col-md-2">
        <label class="form-label small text-muted mb-1">Created To</label>
        <input type="date" class="form-control form-control-sm" [(ngModel)]="toDate" (change)="loadShipments()" />
      </div>
      <div class="col-6 col-md-auto d-flex align-items-center pt-md-3">
        <div class="form-check form-switch mb-0">
          <input
            id="delayedSwitch"
            class="form-check-input"
            type="checkbox"
            [(ngModel)]="delayedOnly"
            (change)="loadShipments()" />
          <label class="form-check-label small fw-semibold text-danger" for="delayedSwitch">Overdue Only</label>
        </div>
      </div>
    </app-search-filter-bar>

    <app-data-table
      title="Shipments Registry"
      [subtitle]="shipments.length + ' shipment(s) matching filters'"
      [loading]="loading"
      [empty]="shipments.length === 0"
      [errorMessage]="errorMessage"
      emptyIcon="bi-box-seam"
      emptyTitle="No shipments found"
      emptyDescription="No shipments match your search or date filters."
      emptyActionLabel="Register Shipment"
      emptyActionLink="/shipments/new"
      (retry)="loadShipments()">
      <thead>
        <tr>
          <th>Tracking #</th>
          <th>Customer</th>
          <th>Route</th>
          <th>Driver</th>
          <th>Weight</th>
          <th>Expected Date</th>
          <th>Status</th>
          <th class="text-center">Events</th>
          <th class="text-end">Actions</th>
        </tr>
      </thead>
      <tbody>
        @for (s of shipments; track s.shipmentId) {
          <tr [class.table-danger]="s.delayed" [class.bg-opacity-10]="s.delayed">
            <td>
              <a [routerLink]="['/shipments', s.shipmentId]" class="code-badge text-decoration-none">
                {{ s.trackingNumber }}
              </a>
            </td>
            <td>
              <div class="fw-semibold small">{{ s.customerName }}</div>
              <div class="small text-muted">{{ s.customerCode }}</div>
            </td>
            <td>
              <div class="small fw-medium">{{ s.originCity }} <i class="bi bi-arrow-right mx-1"></i> {{ s.destinationCity }}</div>
              <div class="small text-muted">{{ s.originHubCode }}</div>
            </td>
            <td>
              @if (s.driverName) {
                <div class="small fw-medium">{{ s.driverName }}</div>
                <div class="small text-muted">{{ s.driverCode }}</div>
              } @else {
                <span class="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle">Unassigned</span>
              }
            </td>
            <td class="tabular-nums small">{{ s.weight | number:'1.2-2' }} kg</td>
            <td class="tabular-nums small" [class.text-danger]="s.delayed" [class.fw-semibold]="s.delayed">
              {{ s.expectedDeliveryDate | date:'dd MMM yyyy' }}
            </td>
            <td>
              <div class="d-flex flex-wrap gap-1 align-items-center">
                <app-status-badge [status]="s.shipmentStatus"></app-status-badge>
                @if (s.delayed) {
                  <app-status-badge status="DELAYED" [delayed]="true"></app-status-badge>
                }
              </div>
            </td>
            <td class="text-center tabular-nums">
              <span class="badge bg-light text-dark border">{{ s.trackingEventCount }}</span>
            </td>
            <td class="text-end">
              <div class="btn-group btn-group-sm">
                <a [routerLink]="['/shipments', s.shipmentId]" class="btn btn-outline-secondary" title="Details &amp; Tracking">
                  <i class="bi bi-eye"></i>
                </a>
                <a [routerLink]="['/shipments', s.shipmentId, 'edit']" class="btn btn-outline-primary" title="Edit Shipment">
                  <i class="bi bi-pencil"></i>
                </a>
                <button
                  type="button"
                  class="btn btn-outline-danger"
                  title="Delete Shipment"
                  (click)="promptDelete(s)">
                  <i class="bi bi-trash"></i>
                </button>
              </div>
            </td>
          </tr>
        }
      </tbody>
    </app-data-table>

    <app-confirm-dialog
      [visible]="!!shipmentToDelete"
      title="Delete Shipment"
      [message]="deleteConfirmMessage"
      confirmLabel="Delete Shipment"
      confirmVariant="danger"
      [loading]="deleting"
      (confirmed)="confirmDelete()"
      (cancelled)="shipmentToDelete = null">
    </app-confirm-dialog>
  `
})
export class ShipmentListComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly shipmentService = inject(ShipmentService);
  private readonly notification = inject(NotificationService);

  readonly statuses: ShipmentStatus[] = [
    'PENDING',
    'PICKED_UP',
    'IN_TRANSIT',
    'OUT_FOR_DELIVERY',
    'DELIVERED',
    'CANCELLED'
  ];

  shipments: ShipmentResponse[] = [];
  trackingSearch = '';
  statusFilter: ShipmentStatus | '' = '';
  fromDate = '';
  toDate = '';
  delayedOnly = false;

  loading = true;
  errorMessage: string | null = null;
  shipmentToDelete: ShipmentResponse | null = null;
  deleting = false;

  get deleteConfirmMessage(): string {
    if (!this.shipmentToDelete) return '';
    if (this.shipmentToDelete.trackingEventCount > 0) {
      return `Shipment "${this.shipmentToDelete.trackingNumber}" has ${this.shipmentToDelete.trackingEventCount} tracking event(s). Deletion is prohibited when tracking history exists.`;
    }
    return `Are you sure you want to delete shipment "${this.shipmentToDelete.trackingNumber}"?`;
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      if (params['status']) {
        this.statusFilter = params['status'] as ShipmentStatus;
      }
      if (params['delayedOnly'] === 'true') {
        this.delayedOnly = true;
      }
      if (params['trackingNumber']) {
        this.trackingSearch = params['trackingNumber'];
      }
      this.loadShipments();
    });
  }

  loadShipments(): void {
    if (this.fromDate && this.toDate && this.toDate < this.fromDate) {
      this.notification.warning('Created To date cannot be earlier than Created From date.');
      return;
    }

    this.loading = true;
    this.errorMessage = null;
    this.shipmentService
      .getAll({
        trackingNumber: this.trackingSearch,
        status: this.statusFilter,
        fromDate: this.fromDate,
        toDate: this.toDate,
        delayedOnly: this.delayedOnly
      })
      .subscribe({
        next: (data) => {
          this.shipments = data;
          this.loading = false;
        },
        error: (err) => {
          this.errorMessage = err.message || 'Failed to load shipments.';
          this.loading = false;
        }
      });
  }

  onReset(): void {
    this.trackingSearch = '';
    this.statusFilter = '';
    this.fromDate = '';
    this.toDate = '';
    this.delayedOnly = false;
    this.loadShipments();
  }

  promptDelete(shipment: ShipmentResponse): void {
    this.shipmentToDelete = shipment;
  }

  confirmDelete(): void {
    if (!this.shipmentToDelete) return;
    this.deleting = true;
    this.shipmentService.delete(this.shipmentToDelete.shipmentId).subscribe({
      next: (res) => {
        this.notification.success(res.message || 'Shipment deleted successfully.');
        this.shipmentToDelete = null;
        this.deleting = false;
        this.loadShipments();
      },
      error: (err) => {
        this.notification.error(err.message || 'Cannot delete shipment.');
        this.shipmentToDelete = null;
        this.deleting = false;
      }
    });
  }
}

