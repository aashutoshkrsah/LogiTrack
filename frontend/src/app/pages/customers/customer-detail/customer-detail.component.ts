import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { CustomerResponse } from '../../../models/customer.model';
import { ShipmentResponse } from '../../../models/shipment.model';
import { CustomerService } from '../../../services/customer.service';
import { NotificationService } from '../../../services/notification.service';
import { ShipmentService } from '../../../services/shipment.service';
import {
  ConfirmDialogComponent,
  EmptyStateComponent,
  LoadingSpinnerComponent,
  StatusBadgeComponent
} from '../../../shared/shared-ui';

@Component({
  selector: 'app-customer-detail',
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
        <h1 class="page-title">Customer Profile</h1>
        <p class="page-subtitle">Detailed customer information and associated shipments</p>
      </div>
      <div class="d-flex gap-2">
        <a routerLink="/customers" class="btn btn-outline-secondary btn-sm">
          <i class="bi bi-arrow-left me-1"></i>All Customers
        </a>
        @if (customer) {
          <a [routerLink]="['/customers', customer.customerId, 'edit']" class="btn btn-primary btn-sm">
            <i class="bi bi-pencil me-1"></i>Edit Customer
          </a>
        }
      </div>
    </div>

    @if (loading) {
      <div class="ops-card"><app-loading-spinner message="Loading customer details..."></app-loading-spinner></div>
    } @else if (customer) {
      <div class="row g-4 mb-4">
        <div class="col-12 col-lg-8">
          <div class="ops-card">
            <div class="ops-card-header">
              <div class="d-flex align-items-center gap-2">
                <span class="code-badge">{{ customer.customerCode }}</span>
                <h5 class="mb-0 fw-bold">{{ customer.name }}</h5>
              </div>
              <app-status-badge [status]="customer.customerType"></app-status-badge>
            </div>
            <div class="ops-card-body">
              <div class="row g-4">
                <div class="col-sm-6">
                  <div class="small text-muted fw-semibold text-uppercase">Phone Number</div>
                  <div class="fw-medium mt-1 tabular-nums">{{ customer.phone }}</div>
                </div>
                <div class="col-sm-6">
                  <div class="small text-muted fw-semibold text-uppercase">Email Address</div>
                  <div class="fw-medium mt-1">{{ customer.email }}</div>
                </div>
                <div class="col-sm-6">
                  <div class="small text-muted fw-semibold text-uppercase">Customer Classification</div>
                  <div class="fw-medium mt-1">{{ customer.customerType }}</div>
                </div>
                <div class="col-sm-6">
                  <div class="small text-muted fw-semibold text-uppercase">Registered Shipments</div>
                  <div class="fw-bold fs-5 mt-1 tabular-nums text-primary">{{ customer.shipmentCount }}</div>
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
              <a routerLink="/shipments/new" [queryParams]="{ customerId: customer.customerId }" class="btn btn-outline-primary">
                <i class="bi bi-plus-square me-2"></i>Register Shipment for Customer
              </a>
              <button type="button" class="btn btn-outline-danger" (click)="showDeleteConfirm = true">
                <i class="bi bi-trash me-2"></i>Delete Customer
              </button>
              @if (customer.shipmentCount > 0) {
                <div class="small text-muted mt-1">
                  <i class="bi bi-info-circle me-1"></i>
                  Customers with existing shipments cannot be deleted to preserve shipment audit integrity.
                </div>
              }
            </div>
          </div>
        </div>
      </div>

      <div class="ops-card overflow-hidden">
        <div class="ops-card-header">
          <div>
            <h6 class="mb-0 fw-bold">Customer Shipments</h6>
            <div class="small text-muted">{{ shipments.length }} consignment(s) linked to this customer</div>
          </div>
        </div>
        @if (shipments.length === 0) {
          <app-empty-state
            icon="bi-box-seam"
            title="No shipments for this customer"
            description="Register a consignment for this customer to begin tracking.">
          </app-empty-state>
        } @else {
          <div class="table-responsive">
            <table class="table ops-table">
              <thead>
                <tr>
                  <th>Tracking #</th>
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
                      <a [routerLink]="['/shipments', s.shipmentId]" class="btn btn-outline-secondary btn-sm">Track</a>
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
        title="Delete Customer"
        [message]="'Delete customer ' + customer.name + ' (' + customer.customerCode + ')?'"
        confirmLabel="Delete"
        confirmVariant="danger"
        [loading]="deleting"
        (confirmed)="onDelete()"
        (cancelled)="showDeleteConfirm = false">
      </app-confirm-dialog>
    }
  `
})
export class CustomerDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly customerService = inject(CustomerService);
  private readonly shipmentService = inject(ShipmentService);
  private readonly notification = inject(NotificationService);

  customer: CustomerResponse | null = null;
  shipments: ShipmentResponse[] = [];
  loading = true;
  showDeleteConfirm = false;
  deleting = false;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    forkJoin({
      customer: this.customerService.getById(id),
      shipments: this.shipmentService.getAll({ customerId: id })
    }).subscribe({
      next: ({ customer, shipments }) => {
        this.customer = customer;
        this.shipments = shipments;
        this.loading = false;
      },
      error: (err) => {
        this.notification.error(err.message || 'Customer not found.');
        this.router.navigate(['/customers']);
      }
    });
  }

  onDelete(): void {
    if (!this.customer) return;
    this.deleting = true;
    this.customerService.delete(this.customer.customerId).subscribe({
      next: (res) => {
        this.deleting = false;
        this.showDeleteConfirm = false;
        this.notification.success(res.message || 'Customer deleted.');
        this.router.navigate(['/customers']);
      },
      error: (err) => {
        this.deleting = false;
        this.showDeleteConfirm = false;
        this.notification.error(err.message || 'Cannot delete customer.');
      }
    });
  }
}
