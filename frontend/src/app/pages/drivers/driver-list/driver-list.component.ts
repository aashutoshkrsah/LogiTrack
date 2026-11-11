import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AvailabilityStatus, DriverResponse } from '../../../models/driver.model';
import { DriverService } from '../../../services/driver.service';
import { NotificationService } from '../../../services/notification.service';
import {
  ConfirmDialogComponent,
  DataTableComponent,
  SearchFilterBarComponent,
  StatusBadgeComponent
} from '../../../shared/shared-ui';

@Component({
  selector: 'app-driver-list',
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
        <h1 class="page-title">Driver Fleet Directory</h1>
        <p class="page-subtitle">Manage delivery personnel, driving licences, and availability statuses</p>
      </div>
      <a routerLink="/drivers/new" class="btn btn-primary btn-sm">
        <i class="bi bi-plus-lg me-1"></i>Add Driver
      </a>
    </div>

    <app-search-filter-bar
      searchLabel="Search Drivers"
      placeholder="Search by code, full name, phone, or licence..."
      [(searchTerm)]="searchTerm"
      (searchSubmit)="loadDrivers()"
      (resetFilters)="onReset()">
      <div class="col-12 col-md-3">
        <label class="form-label small text-muted mb-1">Availability Status</label>
        <select class="form-select form-select-sm" [(ngModel)]="selectedStatus" (change)="loadDrivers()">
          <option value="">All Statuses</option>
          <option value="AVAILABLE">Available</option>
          <option value="ON_DUTY">On Duty</option>
          <option value="ON_LEAVE">On Leave</option>
          <option value="INACTIVE">Inactive</option>
        </select>
      </div>
    </app-search-filter-bar>

    <app-data-table
      title="Registered Drivers"
      [subtitle]="drivers.length + ' driver record(s)'"
      [loading]="loading"
      [empty]="drivers.length === 0"
      [errorMessage]="errorMessage"
      emptyIcon="bi-person-badge"
      emptyTitle="No drivers found"
      emptyDescription="No drivers match your search criteria or none have been added yet."
      emptyActionLabel="Add Driver"
      emptyActionLink="/drivers/new"
      (retry)="loadDrivers()">
      <thead>
        <tr>
          <th>Code</th>
          <th>Full Name</th>
          <th>Phone</th>
          <th>Licence #</th>
          <th>Availability</th>
          <th>Quick Status</th>
          <th class="text-center">Assigned</th>
          <th class="text-end">Actions</th>
        </tr>
      </thead>
      <tbody>
        @for (driver of drivers; track driver.driverId) {
          <tr>
            <td><span class="code-badge">{{ driver.driverCode }}</span></td>
            <td>
              <a [routerLink]="['/drivers', driver.driverId]" class="fw-semibold text-decoration-none text-dark">
                {{ driver.fullName }}
              </a>
            </td>
            <td class="tabular-nums small">{{ driver.phone }}</td>
            <td class="tabular-nums small">{{ driver.licenceNumber }}</td>
            <td><app-status-badge [status]="driver.availabilityStatus"></app-status-badge></td>
            <td style="min-width: 145px;">
              <select
                class="form-select form-select-sm"
                [ngModel]="driver.availabilityStatus"
                (ngModelChange)="onQuickAvailabilityChange(driver, $event)">
                @for (st of statuses; track st) {
                  <option [value]="st">{{ st.replace('_', ' ') }}</option>
                }
              </select>
            </td>
            <td class="text-center tabular-nums">
              <span class="badge bg-light text-dark border">{{ driver.shipmentCount }}</span>
            </td>
            <td class="text-end">
              <div class="btn-group btn-group-sm">
                <a [routerLink]="['/drivers', driver.driverId]" class="btn btn-outline-secondary" title="View Details">
                  <i class="bi bi-eye"></i>
                </a>
                <a [routerLink]="['/drivers', driver.driverId, 'edit']" class="btn btn-outline-primary" title="Edit">
                  <i class="bi bi-pencil"></i>
                </a>
                <button
                  type="button"
                  class="btn btn-outline-danger"
                  title="Delete Driver"
                  (click)="promptDelete(driver)">
                  <i class="bi bi-trash"></i>
                </button>
              </div>
            </td>
          </tr>
        }
      </tbody>
    </app-data-table>

    <app-confirm-dialog
      [visible]="!!driverToDelete"
      title="Delete Driver"
      [message]="deleteConfirmMessage"
      confirmLabel="Delete Driver"
      confirmVariant="danger"
      [loading]="deleting"
      (confirmed)="confirmDelete()"
      (cancelled)="driverToDelete = null">
    </app-confirm-dialog>
  `
})
export class DriverListComponent implements OnInit {
  private readonly driverService = inject(DriverService);
  private readonly notification = inject(NotificationService);

  readonly statuses: AvailabilityStatus[] = ['AVAILABLE', 'ON_DUTY', 'ON_LEAVE', 'INACTIVE'];

  drivers: DriverResponse[] = [];
  searchTerm = '';
  selectedStatus: AvailabilityStatus | '' = '';
  loading = true;
  errorMessage: string | null = null;
  driverToDelete: DriverResponse | null = null;
  deleting = false;

  get deleteConfirmMessage(): string {
    if (!this.driverToDelete) return '';
    if (this.driverToDelete.shipmentCount > 0) {
      return `Driver "${this.driverToDelete.fullName}" is linked to ${this.driverToDelete.shipmentCount} shipment(s). Deletion is restricted; mark the driver as INACTIVE instead.`;
    }
    return `Are you sure you want to delete driver "${this.driverToDelete.fullName}" (${this.driverToDelete.driverCode})?`;
  }

  ngOnInit(): void {
    this.loadDrivers();
  }

  loadDrivers(): void {
    this.loading = true;
    this.errorMessage = null;
    this.driverService.getAll(this.searchTerm, this.selectedStatus).subscribe({
      next: (data) => {
        this.drivers = data;
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = err.message || 'Failed to load drivers.';
        this.loading = false;
      }
    });
  }

  onReset(): void {
    this.searchTerm = '';
    this.selectedStatus = '';
    this.loadDrivers();
  }

  onQuickAvailabilityChange(driver: DriverResponse, nextStatus: AvailabilityStatus): void {
    this.driverService.updateAvailability(driver.driverId, nextStatus).subscribe({
      next: (updated) => {
        driver.availabilityStatus = updated.availabilityStatus;
        this.notification.success(`Updated ${driver.fullName} availability to ${updated.availabilityStatus}.`);
      },
      error: (err) => {
        this.notification.error(err.message || 'Failed to update availability.');
        this.loadDrivers();
      }
    });
  }

  promptDelete(driver: DriverResponse): void {
    this.driverToDelete = driver;
  }

  confirmDelete(): void {
    if (!this.driverToDelete) return;
    this.deleting = true;
    this.driverService.delete(this.driverToDelete.driverId).subscribe({
      next: (res) => {
        this.notification.success(res.message || 'Driver deleted successfully.');
        this.driverToDelete = null;
        this.deleting = false;
        this.loadDrivers();
      },
      error: (err) => {
        this.notification.error(err.message || 'Unable to delete driver.');
        this.driverToDelete = null;
        this.deleting = false;
      }
    });
  }
}

