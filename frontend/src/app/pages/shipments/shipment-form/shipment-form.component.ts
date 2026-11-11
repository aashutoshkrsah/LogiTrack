import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { CustomerResponse } from '../../../models/customer.model';
import { DriverResponse } from '../../../models/driver.model';
import { HubResponse } from '../../../models/hub.model';
import { ShipmentRequest, ShipmentStatus } from '../../../models/shipment.model';
import { CustomerService } from '../../../services/customer.service';
import { DriverService } from '../../../services/driver.service';
import { HubService } from '../../../services/hub.service';
import { NotificationService } from '../../../services/notification.service';
import { ShipmentService } from '../../../services/shipment.service';
import { LoadingSpinnerComponent } from '../../../shared/shared-ui';
import {
  expectedDateAfterCreatedValidator,
  noWhitespaceValidator,
  positiveNumberValidator
} from '../../../validators/custom-validators';

@Component({
  selector: 'app-shipment-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, LoadingSpinnerComponent],
  template: `
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h1 class="page-title">{{ isEditMode ? 'Edit Shipment' : 'Register New Shipment' }}</h1>
        <p class="page-subtitle">
          {{ isEditMode ? 'Update consignment details, expected delivery date, or driver assignment' : 'Create a consignment and assign origin hub, customer, and optional driver' }}
        </p>
      </div>
      <a routerLink="/shipments" class="btn btn-outline-secondary btn-sm">
        <i class="bi bi-arrow-left me-1"></i>Back to Shipments
      </a>
    </div>

    <div class="row justify-content-center">
      <div class="col-12 col-xl-10">
        <div class="ops-card">
          <div class="ops-card-header">
            <h6 class="mb-0 fw-bold">Consignment Registration &amp; Assignment</h6>
          </div>
          <div class="ops-card-body">
            @if (loadingData) {
              <app-loading-spinner message="Loading master dropdown options..."></app-loading-spinner>
            } @else {
              @if (serverError) {
                <div class="alert alert-danger mb-3">
                  <i class="bi bi-exclamation-octagon-fill me-2"></i>{{ serverError }}
                </div>
              }

              <form [formGroup]="form" (ngSubmit)="onSubmit()" novalidate>
                <div class="row g-3">
                  <div class="col-md-6">
                    <label for="trackingNumber" class="form-label">Tracking Number <span class="required-star">*</span></label>
                    <div class="input-group">
                      <input
                        id="trackingNumber"
                        type="text"
                        class="form-control text-uppercase"
                        formControlName="trackingNumber"
                        placeholder="e.g. TRK-2026-0008"
                        [class.is-invalid]="isInvalid('trackingNumber')" />
                      <button
                        type="button"
                        class="btn btn-outline-secondary"
                        title="Generate unique tracking number"
                        (click)="generateTrackingNumber()">
                        <i class="bi bi-magic me-1"></i>Generate
                      </button>
                      @if (isInvalid('trackingNumber')) {
                        <div class="invalid-feedback">{{ getError('trackingNumber') }}</div>
                      }
                    </div>
                  </div>

                  <div class="col-md-6">
                    <label for="weight" class="form-label">Consignment Weight (kg) <span class="required-star">*</span></label>
                    <input
                      id="weight"
                      type="number"
                      step="0.01"
                      min="0.01"
                      class="form-control"
                      formControlName="weight"
                      placeholder="e.g. 45.50"
                      [class.is-invalid]="isInvalid('weight')" />
                    @if (isInvalid('weight')) {
                      <div class="invalid-feedback">{{ getError('weight') }}</div>
                    }
                  </div>

                  <div class="col-md-4">
                    <label for="customerId" class="form-label">Customer <span class="required-star">*</span></label>
                    <select
                      id="customerId"
                      class="form-select"
                      formControlName="customerId"
                      [class.is-invalid]="isInvalid('customerId')">
                      <option [ngValue]="null">-- Select Customer --</option>
                      @for (c of customers; track c.customerId) {
                        <option [ngValue]="c.customerId">{{ c.customerCode }} — {{ c.name }}</option>
                      }
                    </select>
                    @if (isInvalid('customerId')) {
                      <div class="invalid-feedback">{{ getError('customerId') }}</div>
                    }
                  </div>

                  <div class="col-md-4">
                    <label for="originHubId" class="form-label">Origin Hub <span class="required-star">*</span></label>
                    <select
                      id="originHubId"
                      class="form-select"
                      formControlName="originHubId"
                      [class.is-invalid]="isInvalid('originHubId')">
                      <option [ngValue]="null">-- Select Origin Hub --</option>
                      @for (h of hubs; track h.hubId) {
                        <option [ngValue]="h.hubId">{{ h.hubCode }} — {{ h.hubName }} ({{ h.city }})</option>
                      }
                    </select>
                    @if (isInvalid('originHubId')) {
                      <div class="invalid-feedback">{{ getError('originHubId') }}</div>
                    }
                  </div>

                  <div class="col-md-4">
                    <label for="driverId" class="form-label">Assigned Driver (Optional)</label>
                    <select id="driverId" class="form-select" formControlName="driverId">
                      <option [ngValue]="null">-- Unassigned (Assign Later) --</option>
                      @for (d of drivers; track d.driverId) {
                        <option [ngValue]="d.driverId" [disabled]="d.availabilityStatus === 'INACTIVE'">
                          {{ d.driverCode }} — {{ d.fullName }} ({{ d.availabilityStatus }})
                        </option>
                      }
                    </select>
                  </div>

                  <div class="col-md-8">
                    <label for="destinationAddress" class="form-label">Destination Street Address <span class="required-star">*</span></label>
                    <input
                      id="destinationAddress"
                      type="text"
                      class="form-control"
                      formControlName="destinationAddress"
                      placeholder="Full delivery address"
                      [class.is-invalid]="isInvalid('destinationAddress')" />
                    @if (isInvalid('destinationAddress')) {
                      <div class="invalid-feedback">{{ getError('destinationAddress') }}</div>
                    }
                  </div>

                  <div class="col-md-4">
                    <label for="destinationCity" class="form-label">Destination City <span class="required-star">*</span></label>
                    <input
                      id="destinationCity"
                      type="text"
                      class="form-control"
                      formControlName="destinationCity"
                      placeholder="e.g. Bengaluru"
                      [class.is-invalid]="isInvalid('destinationCity')" />
                    @if (isInvalid('destinationCity')) {
                      <div class="invalid-feedback">{{ getError('destinationCity') }}</div>
                    }
                  </div>

                  <div class="col-md-4">
                    <label for="createdDate" class="form-label">Created Date <span class="required-star">*</span></label>
                    <input
                      id="createdDate"
                      type="date"
                      class="form-control"
                      formControlName="createdDate"
                      [class.is-invalid]="isInvalid('createdDate')" />
                    @if (isInvalid('createdDate')) {
                      <div class="invalid-feedback">{{ getError('createdDate') }}</div>
                    }
                  </div>

                  <div class="col-md-4">
                    <label for="expectedDeliveryDate" class="form-label">Expected Delivery Date <span class="required-star">*</span></label>
                    <input
                      id="expectedDeliveryDate"
                      type="date"
                      class="form-control"
                      formControlName="expectedDeliveryDate"
                      [class.is-invalid]="isInvalid('expectedDeliveryDate') || hasDateOrderError()" />
                    @if (isInvalid('expectedDeliveryDate')) {
                      <div class="invalid-feedback">{{ getError('expectedDeliveryDate') }}</div>
                    } @else if (hasDateOrderError()) {
                      <div class="invalid-feedback">Expected delivery date cannot be earlier than created date.</div>
                    }
                  </div>

                  <div class="col-md-4">
                    <label for="shipmentStatus" class="form-label">Shipment Status <span class="required-star">*</span></label>
                    <select
                      id="shipmentStatus"
                      class="form-select"
                      formControlName="shipmentStatus">
                      @for (st of statuses; track st) {
                        <option
                          [value]="st"
                          [disabled]="isEditMode && existingEventCount > 0 && st !== initialSyncedStatus && (st !== 'CANCELLED' || initialSyncedStatus === 'DELIVERED')">
                          {{ st.replace('_', ' ') }}
                        </option>
                      }
                    </select>
                    @if (isEditMode && existingEventCount > 0) {
                      <div class="form-text text-primary">
                        <i class="bi bi-info-circle me-1"></i>
                        Synced with {{ existingEventCount }} tracking event(s). Add milestones on the detail page.
                      </div>
                    }
                  </div>
                </div>

                <div class="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
                  <a routerLink="/shipments" class="btn btn-outline-secondary">Cancel</a>
                  <button type="submit" class="btn btn-primary" [disabled]="submitting">
                    @if (submitting) {
                      <span class="spinner-border spinner-border-sm me-1"></span>
                    }
                    {{ isEditMode ? 'Update Shipment' : 'Register Shipment' }}
                  </button>
                </div>
              </form>
            }
          </div>
        </div>
      </div>
    </div>
  `
})
export class ShipmentFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly shipmentService = inject(ShipmentService);
  private readonly customerService = inject(CustomerService);
  private readonly driverService = inject(DriverService);
  private readonly hubService = inject(HubService);
  private readonly notification = inject(NotificationService);

  readonly statuses: ShipmentStatus[] = [
    'PENDING',
    'PICKED_UP',
    'IN_TRANSIT',
    'OUT_FOR_DELIVERY',
    'DELIVERED',
    'CANCELLED'
  ];

  customers: CustomerResponse[] = [];
  drivers: DriverResponse[] = [];
  hubs: HubResponse[] = [];

  shipmentId: number | null = null;
  isEditMode = false;
  existingEventCount = 0;
  initialSyncedStatus: ShipmentStatus = 'PENDING';
  loadingData = true;
  submitting = false;
  serverError: string | null = null;

  readonly form = this.fb.group(
    {
      trackingNumber: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(40), noWhitespaceValidator()]],
      customerId: [null as number | null, [Validators.required]],
      driverId: [null as number | null],
      originHubId: [null as number | null, [Validators.required]],
      destinationAddress: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(255), noWhitespaceValidator()]],
      destinationCity: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(80), noWhitespaceValidator()]],
      createdDate: [this.todayIso(), [Validators.required]],
      expectedDeliveryDate: [this.futureIso(3), [Validators.required]],
      shipmentStatus: ['PENDING' as ShipmentStatus, [Validators.required]],
      weight: [null as number | null, [Validators.required, positiveNumberValidator(0.01)]]
    },
    { validators: expectedDateAfterCreatedValidator('createdDate', 'expectedDeliveryDate') }
  );

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.shipmentId = Number(idParam);
      this.isEditMode = true;
    } else {
      this.generateTrackingNumber();
    }

    forkJoin({
      customers: this.customerService.getAll(),
      drivers: this.driverService.getAll(),
      hubs: this.hubService.getAll()
    }).subscribe({
      next: ({ customers, drivers, hubs }) => {
        this.customers = customers;
        this.drivers = drivers;
        this.hubs = hubs;

        if (this.isEditMode && this.shipmentId) {
          this.loadShipment(this.shipmentId);
        } else {
          const qpCustomerId = this.route.snapshot.queryParamMap.get('customerId');
          const qpHubId = this.route.snapshot.queryParamMap.get('originHubId');
          if (qpCustomerId) this.form.patchValue({ customerId: Number(qpCustomerId) });
          if (qpHubId) this.form.patchValue({ originHubId: Number(qpHubId) });
          this.loadingData = false;
        }
      },
      error: (err) => {
        this.serverError = err.message || 'Failed to load customers, drivers, and hubs.';
        this.loadingData = false;
      }
    });
  }

  private loadShipment(id: number): void {
    this.shipmentService.getById(id).subscribe({
      next: (s) => {
        this.existingEventCount = s.trackingEventCount;
        this.initialSyncedStatus = s.shipmentStatus;
        this.form.patchValue({
          trackingNumber: s.trackingNumber,
          customerId: s.customerId,
          driverId: s.driverId,
          originHubId: s.originHubId,
          destinationAddress: s.destinationAddress,
          destinationCity: s.destinationCity,
          createdDate: s.createdDate,
          expectedDeliveryDate: s.expectedDeliveryDate,
          shipmentStatus: s.shipmentStatus,
          weight: s.weight
        });
        this.loadingData = false;
      },
      error: (err) => {
        this.notification.error(err.message || 'Shipment not found.');
        this.router.navigate(['/shipments']);
      }
    });
  }

  generateTrackingNumber(): void {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    const rand = Math.floor(1000 + Math.random() * 9000);
    this.form.patchValue({ trackingNumber: `TRK-${y}${m}${d}-${rand}` });
  }

  onSubmit(): void {
    this.serverError = null;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const payload: ShipmentRequest = {
      trackingNumber: (raw.trackingNumber || '').trim().toUpperCase(),
      customerId: Number(raw.customerId),
      driverId: raw.driverId ? Number(raw.driverId) : null,
      originHubId: Number(raw.originHubId),
      destinationAddress: (raw.destinationAddress || '').trim(),
      destinationCity: (raw.destinationCity || '').trim(),
      createdDate: raw.createdDate || this.todayIso(),
      expectedDeliveryDate: raw.expectedDeliveryDate || this.todayIso(),
      shipmentStatus: raw.shipmentStatus || 'PENDING',
      weight: Number(raw.weight)
    };

    this.submitting = true;
    const req$ = this.isEditMode && this.shipmentId
      ? this.shipmentService.update(this.shipmentId, payload)
      : this.shipmentService.create(payload);

    req$.subscribe({
      next: (saved) => {
        this.submitting = false;
        this.notification.success(
          this.isEditMode
            ? `Shipment ${saved.trackingNumber} updated successfully.`
            : `Shipment ${saved.trackingNumber} registered successfully.`
        );
        this.router.navigate(['/shipments', saved.shipmentId]);
      },
      error: (err) => {
        this.submitting = false;
        this.serverError = err.message || 'Failed to save shipment.';
        if (err.fieldErrors) {
          Object.entries(err.fieldErrors as Record<string, string>).forEach(([field, msg]) => {
            const ctrl = this.form.get(field);
            if (ctrl) {
              ctrl.setErrors({ server: msg });
              ctrl.markAsTouched();
            }
          });
        }
      }
    });
  }

  hasDateOrderError(): boolean {
    const expCtrl = this.form.get('expectedDeliveryDate');
    return !!(this.form.errors?.['expectedBeforeCreated'] && (expCtrl?.touched || expCtrl?.dirty));
  }

  isInvalid(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl && ctrl.invalid && (ctrl.touched || ctrl.dirty));
  }

  getError(field: string): string {
    const ctrl = this.form.get(field);
    if (!ctrl || !ctrl.errors) return '';
    if (ctrl.errors['server']) return ctrl.errors['server'];
    if (ctrl.errors['required'] || ctrl.errors['whitespace']) return 'This field is required.';
    if (ctrl.errors['minlength']) return `Minimum ${ctrl.errors['minlength'].requiredLength} characters required.`;
    if (ctrl.errors['maxlength']) return `Maximum ${ctrl.errors['maxlength'].requiredLength} characters allowed.`;
    if (ctrl.errors['minPositive']) return 'Weight must be greater than 0.';
    return 'Invalid value.';
  }

  private todayIso(): string {
    return new Date().toISOString().slice(0, 10);
  }

  private futureIso(daysAhead: number): string {
    const d = new Date();
    d.setDate(d.getDate() + daysAhead);
    return d.toISOString().slice(0, 10);
  }
}

