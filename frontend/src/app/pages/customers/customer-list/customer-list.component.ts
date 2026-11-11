import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CustomerResponse, CustomerType } from '../../../models/customer.model';
import { CustomerService } from '../../../services/customer.service';
import { NotificationService } from '../../../services/notification.service';
import {
  ConfirmDialogComponent,
  DataTableComponent,
  SearchFilterBarComponent,
  StatusBadgeComponent
} from '../../../shared/shared-ui';

@Component({
  selector: 'app-customer-list',
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
        <h1 class="page-title">Customer Directory</h1>
        <p class="page-subtitle">Manage shippers, corporate accounts, and retail consignors</p>
      </div>
      <a routerLink="/customers/new" class="btn btn-primary btn-sm">
        <i class="bi bi-plus-lg me-1"></i>Add Customer
      </a>
    </div>

    <app-search-filter-bar
      searchLabel="Search Customers"
      placeholder="Search by code, name, email, or phone..."
      [(searchTerm)]="searchTerm"
      (searchSubmit)="loadCustomers()"
      (resetFilters)="onReset()">
      <div class="col-12 col-md-3">
        <label class="form-label small text-muted mb-1">Customer Type</label>
        <select class="form-select form-select-sm" [(ngModel)]="selectedType" (change)="loadCustomers()">
          <option value="">All Types</option>
          <option value="CORPORATE">Corporate</option>
          <option value="ECOMMERCE">E-Commerce</option>
          <option value="RETAIL">Retail</option>
          <option value="INDIVIDUAL">Individual</option>
        </select>
      </div>
    </app-search-filter-bar>

    <app-data-table
      title="Registered Customers"
      [subtitle]="customers.length + ' customer record(s)'"
      [loading]="loading"
      [empty]="customers.length === 0"
      [errorMessage]="errorMessage"
      emptyIcon="bi-buildings"
      emptyTitle="No customers found"
      emptyDescription="No customers match your current filter or none have been created yet."
      emptyActionLabel="Add Customer"
      emptyActionLink="/customers/new"
      (retry)="loadCustomers()">
      <thead>
        <tr>
          <th>Code</th>
          <th>Customer Name</th>
          <th>Phone</th>
          <th>Email</th>
          <th>Type</th>
          <th class="text-center">Shipments</th>
          <th class="text-end">Actions</th>
        </tr>
      </thead>
      <tbody>
        @for (customer of customers; track customer.customerId) {
          <tr>
            <td><span class="code-badge">{{ customer.customerCode }}</span></td>
            <td>
              <a [routerLink]="['/customers', customer.customerId]" class="fw-semibold text-decoration-none text-dark">
                {{ customer.name }}
              </a>
            </td>
            <td class="tabular-nums small">{{ customer.phone }}</td>
            <td class="small">{{ customer.email }}</td>
            <td><app-status-badge [status]="customer.customerType"></app-status-badge></td>
            <td class="text-center tabular-nums">
              <span class="badge bg-light text-dark border">{{ customer.shipmentCount }}</span>
            </td>
            <td class="text-end">
              <div class="btn-group btn-group-sm">
                <a [routerLink]="['/customers', customer.customerId]" class="btn btn-outline-secondary" title="View Details">
                  <i class="bi bi-eye"></i>
                </a>
                <a [routerLink]="['/customers', customer.customerId, 'edit']" class="btn btn-outline-primary" title="Edit">
                  <i class="bi bi-pencil"></i>
                </a>
                <button
                  type="button"
                  class="btn btn-outline-danger"
                  title="Delete Customer"
                  (click)="promptDelete(customer)">
                  <i class="bi bi-trash"></i>
                </button>
              </div>
            </td>
          </tr>
        }
      </tbody>
    </app-data-table>

    <app-confirm-dialog
      [visible]="!!customerToDelete"
      title="Delete Customer"
      [message]="deleteConfirmMessage"
      confirmLabel="Delete Customer"
      confirmVariant="danger"
      [loading]="deleting"
      (confirmed)="confirmDelete()"
      (cancelled)="customerToDelete = null">
    </app-confirm-dialog>
  `
})
export class CustomerListComponent implements OnInit {
  private readonly customerService = inject(CustomerService);
  private readonly notification = inject(NotificationService);

  customers: CustomerResponse[] = [];
  searchTerm = '';
  selectedType: CustomerType | '' = '';
  loading = true;
  errorMessage: string | null = null;
  customerToDelete: CustomerResponse | null = null;
  deleting = false;

  get deleteConfirmMessage(): string {
    if (!this.customerToDelete) return '';
    if (this.customerToDelete.shipmentCount > 0) {
      return `Customer "${this.customerToDelete.name}" has ${this.customerToDelete.shipmentCount} associated shipment(s). Deletion is restricted by business rules, so attempting to delete will be rejected.`;
    }
    return `Are you sure you want to delete customer "${this.customerToDelete.name}" (${this.customerToDelete.customerCode})? This action cannot be undone.`;
  }

  ngOnInit(): void {
    this.loadCustomers();
  }

  loadCustomers(): void {
    this.loading = true;
    this.errorMessage = null;
    this.customerService.getAll(this.searchTerm, this.selectedType).subscribe({
      next: (data) => {
        this.customers = data;
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = err.message || 'Failed to load customers.';
        this.loading = false;
      }
    });
  }

  onReset(): void {
    this.searchTerm = '';
    this.selectedType = '';
    this.loadCustomers();
  }

  promptDelete(customer: CustomerResponse): void {
    this.customerToDelete = customer;
  }

  confirmDelete(): void {
    if (!this.customerToDelete) return;
    this.deleting = true;
    this.customerService.delete(this.customerToDelete.customerId).subscribe({
      next: (res) => {
        this.notification.success(res.message || 'Customer deleted successfully.');
        this.customerToDelete = null;
        this.deleting = false;
        this.loadCustomers();
      },
      error: (err) => {
        this.notification.error(err.message || 'Unable to delete customer.');
        this.customerToDelete = null;
        this.deleting = false;
      }
    });
  }
}

