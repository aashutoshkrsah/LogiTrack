import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { AvailabilityStatus, DriverResponse } from '../../../models/driver.model';
import { ShipmentResponse } from '../../../models/shipment.model';
import { DriverService } from '../../../services/driver.service';
import { NotificationService } from '../../../services/notification.service';
import { ShipmentService } from '../../../services/shipment.service';
import {
  ConfirmDialogComponent,
  EmptyStateComponent,
  LoadingSpinnerComponent,
  StatusBadgeComponent
} from '../../../shared/shared-ui';

@Component({
  selector: 'app-driver-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    LoadingSpinnerComponent,
    StatusBadgeComponent,
    ConfirmDialogComponent,
    EmptyStateComponent
  ],
  template: `
    <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
      <div>
        <h1 class="page-title">Driver Profile</h1>
        <p class="page-subtitle">Fleet operator details, availability control, and assigned consignments</p>
      </div>
      <div class="d-flex gap-2">
        <a routerLink="/drivers" class="btn btn-outline-secondary btn-sm">
          <i class="bi bi-arrow-left me-1"></i>All Drivers
        </a>
        @if (driver) {
          <a [routerLink]="['/drivers', driver.driverId, 'edit']" class="btn btn-primary btn-sm">
            <i class="bi bi-pencil me-1"></i>Edit Driver
          </a>
        }
      </div>
    </div>

    @if (loading) {
      <div class="ops-card"><app-loading-spinner message="Loading driver details..."></app-loading-spinner></div>
    } @else if (driver) {
      <div class="row g-4 mb-4">
        <div class="col-12 col-lg-8">
          <div class="ops-card">
            <div class="ops-card-header">
              <div class="d-flex align-items-center gap-2">
                <span class="code-badge">{{ driver.driverCode }}</span>
                <h5 class="mb-0 fw-bold">{{ driver.fullName }}</h5>
              </div>
              <app-status-badge [status]="driver.availabilityStatus"></app-status-badge>
            </div>
            <div class="ops-card-body">
              <div class="row g-4">
                <div class="col-sm-6">
                  <div class="small text-muted fw-semibold text-uppercase">Phone Number</div>
                  <div class="fw-medium mt-1 tabular-nums">{{ driver.phone }}</div>
                </div>
                <div class="col-sm-6">
                  <div class="small text-muted fw-semibold text-uppercase">Driving Licence Number</div>
                  <div class="fw-medium mt-1 tabular-nums">{{ driver.licenceNumber }}</div>
                </div>
                <div class="col-sm-6">
                  <div class="small text-muted fw-semibold text-uppercase">Current Availability</div>
                  <div class="fw-medium mt-1">{{ driver.availabilityStatus.replace('_', ' ') }}</div>
                </div>
                <div class="col-sm-6">
                  <div class="small text-muted fw-semibold text-uppercase">Assigned Shipments</div>
                  <div class="fw-bold fs-5 mt-1 tabular-nums text-primary">{{ driver.shipmentCount }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-12 col-lg-4">
          <div class="ops-card">
            <div class="ops-card-header">
              <h6 class="mb-0 fw-bold">Availability &amp; Actions</h6>
            </div>
            <div class="ops-card-body d-grid gap-2">
              <div class="small text-muted fw-semibold mb-1">Switch Availability Status</div>
              <div class="d-flex flex-wrap gap-2 mb-3">
                @for (st of statuses; track st) {
                  <button
                    type="button"
                    class="btn btn-sm"
                    [ngClass]="driver.availabilityStatus === st ? 'btn-primary' : 'btn-outline-secondary'"
                    [disabled]="updatingStatus || driver.availabilityStatus === st"
                    (click)="setStatus(st)">
                    {{ st.replace('_', ' ') }}
                  </button>
                }
              </div>

              <button type="button" class="btn btn-outline-danger" (click)="showDeleteConfirm = true">
                <i class="bi bi-trash me-2"></i>Delete Driver
              </button>
              @if (driver.shipmentCount > 0) {
                <div class="small text-muted">
                  <i class="bi bi-info-circle me-1"></i>
                  Assigned drivers cannot be deleted; mark status as INACTIVE to deactivate.
                </div>
              }
            </div>
          </div>
        </div>
      </div>

      <div class="ops-card overflow-hidden">
        <div class="ops-card-header">
          <div>
            <h6 class="mb-0 fw-bold">Assigned Shipments</h6>
            <div class="small text-muted">{{ shipments.length }} consignment(s) assigned to this driver</div>
          </div>
        </div>
        @if (shipments.length === 0) {
          <app-empty-state
            icon="bi-truck"
            title="No assigned shipments"
            description="Shipments assigned to this driver will appear here.">
          </app-empty-state>
        } @else {
          <div class="table-responsive">
            <table class="table ops-table">
              <thead>
                <tr>
                  <th>Tracking #</th>
                  <th>Customer</th>
                  <th>Route</th>
                  <th>Expected Date</th>
                  <th>Status</th>
                  <th class="text-end">Details</th>
                </tr>
              </thead>
              <tbody>
                @for (s of shipments; track s.shipmentId) {
                  <tr>
                    <td><a [routerLink]="['/shipments', s.shipmentId]" class="code-badge text-decoration-none">{{ s.trackingNumber }}</a></td>
                    <td class="small fw-medium">{{ s.customerName }}</td>
                    <td class="small">{{ s.originCity }} <i class="bi bi-arrow-right mx-1"></i> {{ s.destinationCity }}</td>
                    <td class="tabular-nums small">{{ s.expectedDeliveryDate | date:'dd MMM yyyy' }}</td>
                    <td>
                      <div class="d-flex gap-1">
                        <app-status-badge [status]="s.shipmentStatus"></app-status-badge>
                        @if (s.delayed) {
                          <app-status-badge status="DELAYED" [delayed]="true"></app-status-badge>
                        }
                      </div>
                    </td>
                    <td class="text-end">
                      <a [routerLink]="['/shipments', s.shipmentId]" class="btn btn-outline-secondary btn-sm">Inspect</a>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </div>

      <app-confirm-dialog
        [visible]="showDeleteConfirm"
        title="Delete Driver"
        [message]="'Delete driver ' + driver.fullName + ' (' + driver.driverCode + ')?'"
        confirmLabel="Delete"
        confirmVariant="danger"
        [loading]="deleting"
        (confirmed)="onDelete()"
        (cancelled)="showDeleteConfirm = false">
      </app-confirm-dialog>
    }
  `
})
export class DriverDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly driverService = inject(DriverService);
  private readonly shipmentService = inject(ShipmentService);
  private readonly notification = inject(NotificationService);

  readonly statuses: AvailabilityStatus[] = ['AVAILABLE', 'ON_DUTY', 'ON_LEAVE', 'INACTIVE'];

  driver: DriverResponse | null = null;
  shipments: ShipmentResponse[] = [];
  loading = true;
  updatingStatus = false;
  showDeleteConfirm = false;
  deleting = false;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    forkJoin({
      driver: this.driverService.getById(id),
      shipments: this.shipmentService.getAll({ driverId: id })
    }).subscribe({
      next: ({ driver, shipments }) => {
        this.driver = driver;
        this.shipments = shipments;
        this.loading = false;
      },
      error: (err) => {
        this.notification.error(err.message || 'Driver not found.');
        this.router.navigate(['/drivers']);
      }
    });
  }

  setStatus(status: AvailabilityStatus): void {
    if (!this.driver) return;
    this.updatingStatus = true;
    this.driverService.updateAvailability(this.driver.driverId, status).subscribe({
      next: (updated) => {
        this.driver = updated;
        this.updatingStatus = false;
        this.notification.success(`Driver status updated to ${updated.availabilityStatus}.`);
      },
      error: (err) => {
        this.updatingStatus = false;
        this.notification.error(err.message || 'Failed to update status.');
      }
    });
  }

  onDelete(): void {
    if (!this.driver) return;
    this.deleting = true;
    this.driverService.delete(this.driver.driverId).subscribe({
      next: (res) => {
        this.deleting = false;
        this.showDeleteConfirm = false;
        this.notification.success(res.message || 'Driver deleted.');
        this.router.navigate(['/drivers']);
      },
      error: (err) => {
        this.deleting = false;
        this.showDeleteConfirm = false;
        this.notification.error(err.message || 'Cannot delete driver.');
      }
    });
  }
}
