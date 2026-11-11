import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HubResponse } from '../../../models/hub.model';
import { HubService } from '../../../services/hub.service';
import { NotificationService } from '../../../services/notification.service';
import {
  ConfirmDialogComponent,
  DataTableComponent,
  SearchFilterBarComponent
} from '../../../shared/shared-ui';

@Component({
  selector: 'app-hub-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    DataTableComponent,
    SearchFilterBarComponent,
    ConfirmDialogComponent
  ],
  template: `
    <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
      <div>
        <h1 class="page-title">Logistics Hub Directory</h1>
        <p class="page-subtitle">Manage regional sorting centers, origin terminals, and transit hubs</p>
      </div>
      <a routerLink="/hubs/new" class="btn btn-primary btn-sm">
        <i class="bi bi-plus-lg me-1"></i>Add Hub
      </a>
    </div>

    <app-search-filter-bar
      searchLabel="Search Hubs"
      placeholder="Search by hub code, name, city, or address..."
      [(searchTerm)]="searchTerm"
      (searchSubmit)="loadHubs()"
      (resetFilters)="onReset()">
      <div class="col-12 col-md-3">
        <label class="form-label small text-muted mb-1">Filter by City</label>
        <input
          type="text"
          class="form-control form-control-sm"
          placeholder="e.g. Mumbai, Pune..."
          [(ngModel)]="cityFilter"
          (keyup.enter)="loadHubs()" />
      </div>
    </app-search-filter-bar>

    <app-data-table
      title="Delivery &amp; Transit Hubs"
      [subtitle]="hubs.length + ' hub facility(ies)'"
      [loading]="loading"
      [empty]="hubs.length === 0"
      [errorMessage]="errorMessage"
      emptyIcon="bi-geo-alt"
      emptyTitle="No hubs found"
      emptyDescription="No hubs match your filter or none have been registered yet."
      emptyActionLabel="Add Hub"
      emptyActionLink="/hubs/new"
      (retry)="loadHubs()">
      <thead>
        <tr>
          <th>Hub Code</th>
          <th>Hub Name</th>
          <th>City</th>
          <th>Address</th>
          <th>Contact #</th>
          <th class="text-center">Origin Shipments</th>
          <th class="text-end">Actions</th>
        </tr>
      </thead>
      <tbody>
        @for (hub of hubs; track hub.hubId) {
          <tr>
            <td><span class="code-badge">{{ hub.hubCode }}</span></td>
            <td>
              <a [routerLink]="['/hubs', hub.hubId]" class="fw-semibold text-decoration-none text-dark">
                {{ hub.hubName }}
              </a>
            </td>
            <td class="fw-medium">{{ hub.city }}</td>
            <td class="small text-secondary text-truncate" style="max-width: 240px;">{{ hub.address }}</td>
            <td class="tabular-nums small">{{ hub.contactNumber }}</td>
            <td class="text-center tabular-nums">
              <span class="badge bg-light text-dark border">{{ hub.originShipmentCount }}</span>
            </td>
            <td class="text-end">
              <div class="btn-group btn-group-sm">
                <a [routerLink]="['/hubs', hub.hubId]" class="btn btn-outline-secondary" title="View Details">
                  <i class="bi bi-eye"></i>
                </a>
                <a [routerLink]="['/hubs', hub.hubId, 'edit']" class="btn btn-outline-primary" title="Edit">
                  <i class="bi bi-pencil"></i>
                </a>
                <button type="button" class="btn btn-outline-danger" title="Delete Hub" (click)="promptDelete(hub)">
                  <i class="bi bi-trash"></i>
                </button>
              </div>
            </td>
          </tr>
        }
      </tbody>
    </app-data-table>

    <app-confirm-dialog
      [visible]="!!hubToDelete"
      title="Delete Hub"
      [message]="deleteConfirmMessage"
      confirmLabel="Delete Hub"
      confirmVariant="danger"
      [loading]="deleting"
      (confirmed)="confirmDelete()"
      (cancelled)="hubToDelete = null">
    </app-confirm-dialog>
  `
})
export class HubListComponent implements OnInit {
  private readonly hubService = inject(HubService);
  private readonly notification = inject(NotificationService);

  hubs: HubResponse[] = [];
  searchTerm = '';
  cityFilter = '';
  loading = true;
  errorMessage: string | null = null;
  hubToDelete: HubResponse | null = null;
  deleting = false;

  get deleteConfirmMessage(): string {
    if (!this.hubToDelete) return '';
    return `Are you sure you want to delete hub "${this.hubToDelete.hubName}" (${this.hubToDelete.hubCode})? Referenced hubs cannot be deleted.`;
  }

  ngOnInit(): void {
    this.loadHubs();
  }

  loadHubs(): void {
    this.loading = true;
    this.errorMessage = null;
    this.hubService.getAll(this.searchTerm, this.cityFilter).subscribe({
      next: (data) => {
        this.hubs = data;
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = err.message || 'Failed to load hubs.';
        this.loading = false;
      }
    });
  }

  onReset(): void {
    this.searchTerm = '';
    this.cityFilter = '';
    this.loadHubs();
  }

  promptDelete(hub: HubResponse): void {
    this.hubToDelete = hub;
  }

  confirmDelete(): void {
    if (!this.hubToDelete) return;
    this.deleting = true;
    this.hubService.delete(this.hubToDelete.hubId).subscribe({
      next: (res) => {
        this.notification.success(res.message || 'Hub deleted successfully.');
        this.hubToDelete = null;
        this.deleting = false;
        this.loadHubs();
      },
      error: (err) => {
        this.notification.error(err.message || 'Unable to delete hub.');
        this.hubToDelete = null;
        this.deleting = false;
      }
    });
  }
}

