import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AvailabilityStatus, DriverRequest } from '../../../models/driver.model';
import { DriverService } from '../../../services/driver.service';
import { NotificationService } from '../../../services/notification.service';
import { LoadingSpinnerComponent } from '../../../shared/shared-ui';
import { noWhitespaceValidator, phoneValidator } from '../../../validators/custom-validators';

@Component({
  selector: 'app-driver-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, LoadingSpinnerComponent],
  template: `
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h1 class="page-title">{{ isEditMode ? 'Edit Driver' : 'Add New Driver' }}</h1>
        <p class="page-subtitle">
          {{ isEditMode ? 'Modify driver profile, licence, or availability' : 'Register a new driver in the logistics fleet' }}
        </p>
      </div>
      <a routerLink="/drivers" class="btn btn-outline-secondary btn-sm">
        <i class="bi bi-arrow-left me-1"></i>Back to Drivers
      </a>
    </div>

    <div class="row justify-content-center">
      <div class="col-12 col-lg-8">
        <div class="ops-card">
          <div class="ops-card-header">
            <h6 class="mb-0 fw-bold">Driver Master Details</h6>
          </div>
          <div class="ops-card-body">
            @if (loadingRecord) {
              <app-loading-spinner message="Loading driver record..."></app-loading-spinner>
            } @else {
              @if (serverError) {
                <div class="alert alert-danger mb-3">
                  <i class="bi bi-exclamation-octagon-fill me-2"></i>{{ serverError }}
                </div>
              }

              <form [formGroup]="form" (ngSubmit)="onSubmit()" novalidate>
                <div class="row g-3">
                  <div class="col-md-6">
                    <label for="driverCode" class="form-label">Driver Code <span class="required-star">*</span></label>
                    <input
                      id="driverCode"
                      type="text"
                      class="form-control text-uppercase"
                      formControlName="driverCode"
                      placeholder="e.g. DRV-2006"
                      [class.is-invalid]="isInvalid('driverCode')" />
                    @if (isInvalid('driverCode')) {
                      <div class="invalid-feedback">{{ getError('driverCode') }}</div>
                    }
                  </div>

                  <div class="col-md-6">
                    <label for="availabilityStatus" class="form-label">Availability Status <span class="required-star">*</span></label>
                    <select
                      id="availabilityStatus"
                      class="form-select"
                      formControlName="availabilityStatus"
                      [class.is-invalid]="isInvalid('availabilityStatus')">
                      @for (st of statuses; track st) {
                        <option [value]="st">{{ st.replace('_', ' ') }}</option>
                      }
                    </select>
                    @if (isInvalid('availabilityStatus')) {
                      <div class="invalid-feedback">{{ getError('availabilityStatus') }}</div>
                    }
                  </div>

                  <div class="col-12">
                    <label for="fullName" class="form-label">Full Name <span class="required-star">*</span></label>
                    <input
                      id="fullName"
                      type="text"
                      class="form-control"
                      formControlName="fullName"
                      placeholder="e.g. Manoj Kumar Singh"
                      [class.is-invalid]="isInvalid('fullName')" />
                    @if (isInvalid('fullName')) {
                      <div class="invalid-feedback">{{ getError('fullName') }}</div>
                    }
                  </div>

                  <div class="col-md-6">
                    <label for="phone" class="form-label">Phone Number <span class="required-star">*</span></label>
                    <input
                      id="phone"
                      type="text"
                      class="form-control"
                      formControlName="phone"
                      placeholder="e.g. +91-98220-10006"
                      [class.is-invalid]="isInvalid('phone')" />
                    @if (isInvalid('phone')) {
                      <div class="invalid-feedback">{{ getError('phone') }}</div>
                    }
                  </div>

                  <div class="col-md-6">
                    <label for="licenceNumber" class="form-label">Licence Number <span class="required-star">*</span></label>
                    <input
                      id="licenceNumber"
                      type="text"
                      class="form-control text-uppercase"
                      formControlName="licenceNumber"
                      placeholder="e.g. MH12-20210099112"
                      [class.is-invalid]="isInvalid('licenceNumber')" />
                    @if (isInvalid('licenceNumber')) {
                      <div class="invalid-feedback">{{ getError('licenceNumber') }}</div>
                    }
                  </div>
                </div>

                <div class="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
                  <a routerLink="/drivers" class="btn btn-outline-secondary">Cancel</a>
                  <button type="submit" class="btn btn-primary" [disabled]="submitting">
                    @if (submitting) {
                      <span class="spinner-border spinner-border-sm me-1"></span>
                    }
                    {{ isEditMode ? 'Save Changes' : 'Create Driver' }}
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
export class DriverFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly driverService = inject(DriverService);
  private readonly notification = inject(NotificationService);

  readonly statuses: AvailabilityStatus[] = ['AVAILABLE', 'ON_DUTY', 'ON_LEAVE', 'INACTIVE'];

  driverId: number | null = null;
  isEditMode = false;
  loadingRecord = false;
  submitting = false;
  serverError: string | null = null;

  readonly form = this.fb.nonNullable.group({
    driverCode: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(30), noWhitespaceValidator()]],
    fullName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(120), noWhitespaceValidator()]],
    phone: ['', [Validators.required, phoneValidator()]],
    licenceNumber: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(50), noWhitespaceValidator()]],
    availabilityStatus: ['AVAILABLE' as AvailabilityStatus, [Validators.required]]
  });

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.driverId = Number(idParam);
      this.isEditMode = true;
      this.loadDriver(this.driverId);
    }
  }

  private loadDriver(id: number): void {
    this.loadingRecord = true;
    this.driverService.getById(id).subscribe({
      next: (driver) => {
        this.form.patchValue({
          driverCode: driver.driverCode,
          fullName: driver.fullName,
          phone: driver.phone,
          licenceNumber: driver.licenceNumber,
          availabilityStatus: driver.availabilityStatus
        });
        this.loadingRecord = false;
      },
      error: (err) => {
        this.notification.error(err.message || 'Driver not found.');
        this.router.navigate(['/drivers']);
      }
    });
  }

  onSubmit(): void {
    this.serverError = null;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const payload: DriverRequest = {
      driverCode: raw.driverCode.trim().toUpperCase(),
      fullName: raw.fullName.trim(),
      phone: raw.phone.trim(),
      licenceNumber: raw.licenceNumber.trim().toUpperCase(),
      availabilityStatus: raw.availabilityStatus
    };

    this.submitting = true;
    const req$ = this.isEditMode && this.driverId
      ? this.driverService.update(this.driverId, payload)
      : this.driverService.create(payload);

    req$.subscribe({
      next: (saved) => {
        this.submitting = false;
        this.notification.success(
          this.isEditMode
            ? `Driver "${saved.fullName}" updated successfully.`
            : `Driver "${saved.fullName}" added successfully.`
        );
        this.router.navigate(['/drivers', saved.driverId]);
      },
      error: (err) => {
        this.submitting = false;
        this.serverError = err.message || 'Failed to save driver.';
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
    if (ctrl.errors['invalidPhone']) return 'Enter a valid phone number (7 to 15 digits).';
    return 'Invalid value.';
  }
}

