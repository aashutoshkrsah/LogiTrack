import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CustomerRequest, CustomerType } from '../../../models/customer.model';
import { CustomerService } from '../../../services/customer.service';
import { NotificationService } from '../../../services/notification.service';
import { LoadingSpinnerComponent } from '../../../shared/shared-ui';
import { noWhitespaceValidator, phoneValidator } from '../../../validators/custom-validators';

@Component({
  selector: 'app-customer-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, LoadingSpinnerComponent],
  template: `
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h1 class="page-title">{{ isEditMode ? 'Edit Customer' : 'Add New Customer' }}</h1>
        <p class="page-subtitle">
          {{ isEditMode ? 'Update customer contact and classification details' : 'Register a new customer in the logistics system' }}
        </p>
      </div>
      <a routerLink="/customers" class="btn btn-outline-secondary btn-sm">
        <i class="bi bi-arrow-left me-1"></i>Back to Customers
      </a>
    </div>

    <div class="row justify-content-center">
      <div class="col-12 col-lg-8">
        <div class="ops-card">
          <div class="ops-card-header">
            <h6 class="mb-0 fw-bold">Customer Master Details</h6>
          </div>
          <div class="ops-card-body">
            @if (loadingRecord) {
              <app-loading-spinner message="Loading customer record..."></app-loading-spinner>
            } @else {
              @if (serverError) {
                <div class="alert alert-danger mb-3">
                  <i class="bi bi-exclamation-octagon-fill me-2"></i>{{ serverError }}
                </div>
              }

              <form [formGroup]="form" (ngSubmit)="onSubmit()" novalidate>
                <div class="row g-3">
                  <div class="col-md-6">
                    <label for="customerCode" class="form-label">Customer Code <span class="required-star">*</span></label>
                    <input
                      id="customerCode"
                      type="text"
                      class="form-control text-uppercase"
                      formControlName="customerCode"
                      placeholder="e.g. CUST-1006"
                      [class.is-invalid]="isInvalid('customerCode')" />
                    @if (isInvalid('customerCode')) {
                      <div class="invalid-feedback">{{ getError('customerCode') }}</div>
                    }
                  </div>

                  <div class="col-md-6">
                    <label for="customerType" class="form-label">Customer Type <span class="required-star">*</span></label>
                    <select
                      id="customerType"
                      class="form-select"
                      formControlName="customerType"
                      [class.is-invalid]="isInvalid('customerType')">
                      @for (type of customerTypes; track type) {
                        <option [value]="type">{{ type }}</option>
                      }
                    </select>
                    @if (isInvalid('customerType')) {
                      <div class="invalid-feedback">{{ getError('customerType') }}</div>
                    }
                  </div>

                  <div class="col-12">
                    <label for="name" class="form-label">Customer / Organization Name <span class="required-star">*</span></label>
                    <input
                      id="name"
                      type="text"
                      class="form-control"
                      formControlName="name"
                      placeholder="e.g. Bharat Heavy Equipment Ltd"
                      [class.is-invalid]="isInvalid('name')" />
                    @if (isInvalid('name')) {
                      <div class="invalid-feedback">{{ getError('name') }}</div>
                    }
                  </div>

                  <div class="col-md-6">
                    <label for="phone" class="form-label">Phone Number <span class="required-star">*</span></label>
                    <input
                      id="phone"
                      type="text"
                      class="form-control"
                      formControlName="phone"
                      placeholder="e.g. +91-98201-55501"
                      [class.is-invalid]="isInvalid('phone')" />
                    @if (isInvalid('phone')) {
                      <div class="invalid-feedback">{{ getError('phone') }}</div>
                    }
                  </div>

                  <div class="col-md-6">
                    <label for="email" class="form-label">Email Address <span class="required-star">*</span></label>
                    <input
                      id="email"
                      type="email"
                      class="form-control"
                      formControlName="email"
                      placeholder="e.g. logistics@company.com"
                      [class.is-invalid]="isInvalid('email')" />
                    @if (isInvalid('email')) {
                      <div class="invalid-feedback">{{ getError('email') }}</div>
                    }
                  </div>
                </div>

                <div class="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
                  <a routerLink="/customers" class="btn btn-outline-secondary">Cancel</a>
                  <button type="submit" class="btn btn-primary" [disabled]="submitting">
                    @if (submitting) {
                      <span class="spinner-border spinner-border-sm me-1"></span>
                    }
                    {{ isEditMode ? 'Save Changes' : 'Create Customer' }}
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
export class CustomerFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly customerService = inject(CustomerService);
  private readonly notification = inject(NotificationService);

  readonly customerTypes: CustomerType[] = ['CORPORATE', 'ECOMMERCE', 'RETAIL', 'INDIVIDUAL'];

  customerId: number | null = null;
  isEditMode = false;
  loadingRecord = false;
  submitting = false;
  serverError: string | null = null;

  readonly form = this.fb.nonNullable.group({
    customerCode: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(30), noWhitespaceValidator()]],
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(120), noWhitespaceValidator()]],
    phone: ['', [Validators.required, phoneValidator()]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(150)]],
    customerType: ['CORPORATE' as CustomerType, [Validators.required]]
  });

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.customerId = Number(idParam);
      this.isEditMode = true;
      this.loadCustomer(this.customerId);
    }
  }

  private loadCustomer(id: number): void {
    this.loadingRecord = true;
    this.customerService.getById(id).subscribe({
      next: (customer) => {
        this.form.patchValue({
          customerCode: customer.customerCode,
          name: customer.name,
          phone: customer.phone,
          email: customer.email,
          customerType: customer.customerType
        });
        this.loadingRecord = false;
      },
      error: (err) => {
        this.notification.error(err.message || 'Customer not found.');
        this.router.navigate(['/customers']);
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
    const payload: CustomerRequest = {
      customerCode: raw.customerCode.trim().toUpperCase(),
      name: raw.name.trim(),
      phone: raw.phone.trim(),
      email: raw.email.trim(),
      customerType: raw.customerType
    };

    this.submitting = true;
    const req$ = this.isEditMode && this.customerId
      ? this.customerService.update(this.customerId, payload)
      : this.customerService.create(payload);

    req$.subscribe({
      next: (saved) => {
        this.submitting = false;
        this.notification.success(
          this.isEditMode
            ? `Customer "${saved.name}" updated successfully.`
            : `Customer "${saved.name}" created successfully.`
        );
        this.router.navigate(['/customers', saved.customerId]);
      },
      error: (err) => {
        this.submitting = false;
        this.serverError = err.message || 'Failed to save customer.';
        if (err.fieldErrors) {
          this.applyFieldErrors(err.fieldErrors);
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
    if (ctrl.errors['email']) return 'Enter a valid email address.';
    if (ctrl.errors['invalidPhone']) return 'Enter a valid phone number (7 to 15 digits).';
    return 'Invalid value.';
  }

  private applyFieldErrors(fieldErrors: Record<string, string>): void {
    Object.entries(fieldErrors).forEach(([field, msg]) => {
      const ctrl = this.form.get(field);
      if (ctrl) {
        ctrl.setErrors({ server: msg });
        ctrl.markAsTouched();
      }
    });
  }
}

