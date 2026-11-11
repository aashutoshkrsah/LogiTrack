import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { HubResponse } from '../../../models/hub.model';
import { ShipmentResponse } from '../../../models/shipment.model';
import { HubService } from '../../../services/hub.service';
import { NotificationService } from '../../../services/notification.service';
import { ShipmentService } from '../../../services/shipment.service';
import {
  ConfirmDialogComponent,
  EmptyStateComponent,
  LoadingSpinnerComponent,
  StatusBadgeComponent
} from '../../../shared/shared-ui';

@Component({
  selector: 'app-hub-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    LoadingSpinnerComponent,
    ConfirmDialogComponent,
    StatusBadgeComponent,
    EmptyStateComponent
  ],
  template: `
    <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
      <div>
        <h1 class="page-title">Hub Details</h1>
        <p class="page-subtitle">Facility address, regional city, and originating shipments</p>
      </div>
      <div class="d-flex gap-2">
        <a routerLink="/hubs" class="btn btn-outline-secondary btn-sm">
          <i class="bi bi-arrow-left me-1"></i>All Hubs
        </a>
        @if (hub) {
          <a [routerLink]="['/hubs', hub.hubId, 'edit']" class="btn btn-primary btn-sm">
            <i class="bi bi-pencil me-1"></i>Edit Hub
          </a>
        }
      </div>
    </div>

    @if (loading) {
      <div class="ops-card"><app-loading-spinner message="Loading hub details..."></app-loading-spinner></div>
    } @else if (hub) {
      <div class="row g-4 mb-4">
        <div class="col-12 col-lg-8">
          <div class="ops-card">
            <div class="ops-card-header">
              <div class="d-flex align-items-center gap-2">
                <span class="code-badge">{{ hub.hubCode }}</span>
                <h5 class="mb-0 fw-bold">{{ hub.hubName }}</h5>
              </div>
              <span class="badge bg-primary-subtle text-primary border border-primary-subtle">{{ hub.city }}</span>
            </div>
            <div class="ops-card-body">
              <div class="row g-4">
                <div class="col-12">
                  <div class="small text-muted fw-semibold text-uppercase">Street Address</div>
                  <div class="fw-medium mt-1">{{ hub.address }}</div>
                </div>
                <div class="col-sm-6">
                  <div class="small text-muted fw-semibold text-uppercase">Contact Number</div>
                  <div class="fw-medium mt-1 tabular-nums">{{ hub.contactNumber }}</div>
                </div>
                <div class="col-sm-6">
                  <div class="small text-muted fw-semibold text-uppercase">Originating Shipments</div>
                  <div class="fw-bold fs-5 mt-1 tabular-nums text-primary">{{ hub.originShipmentCount }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-12 col-lg-4">
          <div class="ops-card">
            <div class="ops-card-header">
              <h6 class="mb-0 fw-bold">Quick Actions</h6>
            </div>
            <div class="ops-card-body d-grid gap-2">
              <a routerLink="/shipments/new" [queryParams]="{ originHubId: hub.hubId }" class="btn btn-outline-primary">
                <i class="bi bi-plus-square me-2"></i>Register Shipment from Hub
              </a>
              <button type="button" class="btn btn-outline-danger" (click)="showDeleteConfirm = true">
                <i class="bi bi-trash me-2"></i>Delete Hub
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="ops-card overflow-hidden">
        <div class="ops-card-header">
          <div>
            <h6 class="mb-0 fw-bold">Originating Shipments</h6>
            <div class="small text-muted">{{ shipments.length }} consignment(s) originating from this hub</div>
          </div>
        </div>
        @if (shipments.length === 0) {
          <app-empty-state
            icon="bi-geo-alt"
            title="No originating shipments"
            description="Shipments dispatched from this hub will appear here.">
          </app-empty-state>
        } @else {
          <div class="table-responsive">
            <table class="table ops-table">
              <thead>
                <tr>
                  <th>Tracking #</th>
                  <th>Customer</th>
                  <th>Destination</th>
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
                    <td class="small">{{ s.destinationCity }}</td>
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
        title="Delete Hub"
        [message]="'Delete hub ' + hub.hubName + ' (' + hub.hubCode + ')?'"
        confirmLabel="Delete"
        confirmVariant="danger"
        [loading]="deleting"
        (confirmed)="onDelete()"
        (cancelled)="showDeleteConfirm = false">
      </app-confirm-dialog>
    }
  `
})
export class HubDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly hubService = inject(HubService);
  private readonly shipmentService = inject(ShipmentService);
  private readonly notification = inject(NotificationService);

  hub: HubResponse | null = null;
  shipments: ShipmentResponse[] = [];
  loading = true;
  showDeleteConfirm = false;
  deleting = false;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    forkJoin({
      hub: this.hubService.getById(id),
      shipments: this.shipmentService.getAll({ originHubId: id })
    }).subscribe({
      next: ({ hub, shipments }) => {
        this.hub = hub;
        this.shipments = shipments;
        this.loading = false;
      },
      error: (err) => {
        this.notification.error(err.message || 'Hub not found.');
        this.router.navigate(['/hubs']);
      }
    });
  }

  onDelete(): void {
    if (!this.hub) return;
    this.deleting = true;
    this.hubService.delete(this.hub.hubId).subscribe({
      next: (res) => {
        this.deleting = false;
        this.showDeleteConfirm = false;
        this.notification.success(res.message || 'Hub deleted.');
        this.router.navigate(['/hubs']);
      },
      error: (err) => {
        this.deleting = false;
        this.showDeleteConfirm = false;
        this.notification.error(err.message || 'Cannot delete hub.');
      }
    });
  }
}
