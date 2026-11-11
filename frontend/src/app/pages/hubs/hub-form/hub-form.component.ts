import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HubRequest } from '../../../models/hub.model';
import { HubService } from '../../../services/hub.service';
import { NotificationService } from '../../../services/notification.service';
import { LoadingSpinnerComponent } from '../../../shared/shared-ui';
import { noWhitespaceValidator, phoneValidator } from '../../../validators/custom-validators';

@Component({
  selector: 'app-hub-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, LoadingSpinnerComponent],
  template: `
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h1 class="page-title">{{ isEditMode ? 'Edit Hub' : 'Add New Hub' }}</h1>
        <p class="page-subtitle">
          {{ isEditMode ? 'Update hub location and contact details' : 'Register a new origin or transit hub in the network' }}
        </p>
      </div>
      <a routerLink="/hubs" class="btn btn-outline-secondary btn-sm">
        <i class="bi bi-arrow-left me-1"></i>Back to Hubs
      </a>
    </div>

    <div class="row justify-content-center">
      <div class="col-12 col-lg-8">
        <div class="ops-card">
          <div class="ops-card-header">
            <h6 class="mb-0 fw-bold">Hub Facility Details</h6>
          </div>
          <div class="ops-card-body">
            @if (loadingRecord) {
              <app-loading-spinner message="Loading hub record..."></app-loading-spinner>
            } @else {
              @if (serverError) {
                <div class="alert alert-danger mb-3">
                  <i class="bi bi-exclamation-octagon-fill me-2"></i>{{ serverError }}
                </div>
              }

              <form [formGroup]="form" (ngSubmit)="onSubmit()" novalidate>
                <div class="row g-3">
                  <div class="col-md-6">
                    <label for="hubCode" class="form-label">Hub Code <span class="required-star">*</span></label>
                    <input
                      id="hubCode"
                      type="text"
                      class="form-control text-uppercase"
                      formControlName="hubCode"
                      placeholder="e.g. HUB-CHN-06"
                      [class.is-invalid]="isInvalid('hubCode')" />
                    @if (isInvalid('hubCode')) {
                      <div class="invalid-feedback">{{ getError('hubCode') }}</div>
                    }
                  </div>

                  <div class="col-md-6">
                    <label for="city" class="form-label">City <span class="required-star">*</span></label>
                    <input
                      id="city"
                      type="text"
                      class="form-control"
                      formControlName="city"
                      placeholder="e.g. Chennai"
                      [class.is-invalid]="isInvalid('city')" />
                    @if (isInvalid('city')) {
                      <div class="invalid-feedback">{{ getError('city') }}</div>
                    }
                  </div>

                  <div class="col-12">
                    <label for="hubName" class="form-label">Hub Facility Name <span class="required-star">*</span></label>
                    <input
                      id="hubName"
                      type="text"
                      class="form-control"
                      formControlName="hubName"
                      placeholder="e.g. Chennai Harbor Freight Center"
                      [class.is-invalid]="isInvalid('hubName')" />
                    @if (isInvalid('hubName')) {
                      <div class="invalid-feedback">{{ getError('hubName') }}</div>
                    }
                  </div>

                  <div class="col-12">
                    <label for="address" class="form-label">Facility Address <span class="required-star">*</span></label>
                    <textarea
                      id="address"
                      rows="2"
                      class="form-control"
                      formControlName="address"
                      placeholder="Full street address and postal code"
                      [class.is-invalid]="isInvalid('address')"></textarea>
                    @if (isInvalid('address')) {
                      <div class="invalid-feedback">{{ getError('address') }}</div>
                    }
                  </div>

                  <div class="col-md-6">
                    <label for="contactNumber" class="form-label">Contact Number <span class="required-star">*</span></label>
                    <input
                      id="contactNumber"
                      type="text"
                      class="form-control"
                      formControlName="contactNumber"
                      placeholder="e.g. +91-44-4006-6000"
                      [class.is-invalid]="isInvalid('contactNumber')" />
                    @if (isInvalid('contactNumber')) {
                      <div class="invalid-feedback">{{ getError('contactNumber') }}</div>
                    }
                  </div>
                </div>

                <div class="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
                  <a routerLink="/hubs" class="btn btn-outline-secondary">Cancel</a>
                  <button type="submit" class="btn btn-primary" [disabled]="submitting">
                    @if (submitting) {
                      <span class="spinner-border spinner-border-sm me-1"></span>
                    }
                    {{ isEditMode ? 'Save Changes' : 'Create Hub' }}
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
export class HubFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly hubService = inject(HubService);
  private readonly notification = inject(NotificationService);

  hubId: number | null = null;
  isEditMode = false;
  loadingRecord = false;
  submitting = false;
  serverError: string | null = null;

  readonly form = this.fb.nonNullable.group({
    hubCode: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(30), noWhitespaceValidator()]],
    hubName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(120), noWhitespaceValidator()]],
    city: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(80), noWhitespaceValidator()]],
    address: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(255), noWhitespaceValidator()]],
    contactNumber: ['', [Validators.required, phoneValidator()]]
  });

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.hubId = Number(idParam);
      this.isEditMode = true;
      this.loadHub(this.hubId);
    }
  }

  private loadHub(id: number): void {
    this.loadingRecord = true;
    this.hubService.getById(id).subscribe({
      next: (hub) => {
        this.form.patchValue({
          hubCode: hub.hubCode,
          hubName: hub.hubName,
          city: hub.city,
          address: hub.address,
          contactNumber: hub.contactNumber
        });
        this.loadingRecord = false;
      },
      error: (err) => {
        this.notification.error(err.message || 'Hub not found.');
        this.router.navigate(['/hubs']);
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
    const payload: HubRequest = {
      hubCode: raw.hubCode.trim().toUpperCase(),
      hubName: raw.hubName.trim(),
      city: raw.city.trim(),
      address: raw.address.trim(),
      contactNumber: raw.contactNumber.trim()
    };

    this.submitting = true;
    const req$ = this.isEditMode && this.hubId
      ? this.hubService.update(this.hubId, payload)
      : this.hubService.create(payload);

    req$.subscribe({
      next: (saved) => {
        this.submitting = false;
        this.notification.success(
          this.isEditMode
            ? `Hub "${saved.hubName}" updated successfully.`
            : `Hub "${saved.hubName}" created successfully.`
        );
        this.router.navigate(['/hubs', saved.hubId]);
      },
      error: (err) => {
        this.submitting = false;
        this.serverError = err.message || 'Failed to save hub.';
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

