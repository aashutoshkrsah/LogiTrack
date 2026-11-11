import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { from, of } from 'rxjs';
import { catchError, concatMap } from 'rxjs/operators';
import { DriverResponse } from '../../../models/driver.model';
import { PageResponse, paginateClient } from '../../../models/page.model';
import { ShipmentResponse, ShipmentStatus } from '../../../models/shipment.model';
import { environment } from '../../../../environments/environment';
import { DemoDataService } from '../../../services/demo-data.service';
import { DriverService } from '../../../services/driver.service';
import { ExportService } from '../../../services/export.service';
import { NotificationService } from '../../../services/notification.service';
import { SettingsService } from '../../../services/settings.service';
import { NEXT_STATUS, ShipmentService, nextStatusLabel } from '../../../services/shipment.service';
import {
  ConfirmDialogComponent,
  DataTableComponent,
  PaginationComponent,
  SearchFilterBarComponent,
  StatusBadgeComponent
} from '../../../shared/shared-ui';

@Component({
  selector: 'app-shipment-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    DataTableComponent,
    SearchFilterBarComponent,
    StatusBadgeComponent,
    ConfirmDialogComponent,
    PaginationComponent
  ],
  template: `
    <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
      <div>
        <h1 class="page-title">Shipment Consignments</h1>
        <p class="page-subtitle">Register consignments, filter by status or date, and monitor delivery progress</p>
      </div>
      <div class="d-flex gap-2 flex-wrap">
        <button type="button" class="btn btn-outline-secondary btn-sm" (click)="exportCsv()" [disabled]="loading || demoMode" title="Download the current filtered list as CSV">
          <i class="bi bi-download me-1"></i>Export CSV
        </button>
        <button type="button" class="btn btn-outline-secondary btn-sm" (click)="viewMode = viewMode === 'table' ? 'board' : 'table'">
          <i class="bi me-1" [ngClass]="viewMode === 'board' ? 'bi-table' : 'bi-kanban'"></i>
          {{ viewMode === 'board' ? 'Table view' : 'Board view' }}
        </button>
        <a routerLink="/tracking" class="btn btn-outline-secondary btn-sm">
          <i class="bi bi-signpost-split me-1"></i>Track by Number
        </a>
        <a routerLink="/shipments/new" class="btn btn-primary btn-sm">
          <i class="bi bi-plus-lg me-1"></i>Register Shipment
        </a>
      </div>
    </div>

    @if (demoMode) {
      <div class="demo-banner mb-3" role="alert">
        <i class="bi bi-exclamation-triangle-fill me-1"></i>
        <strong>DEMO DATA</strong> — backend unreachable at {{ apiBaseUrl }}. Start the Spring Boot API to see live data. Workflow actions are disabled in demo mode.
      </div>
    }

    <app-search-filter-bar
      searchLabel="Search Tracking / City / Customer"
      placeholder="Tracking #, destination city, or customer..."
      [(searchTerm)]="trackingSearch"
      (searchSubmit)="onFilterChange()"
      (resetFilters)="onReset()">
      <div class="col-6 col-md-2">
        <label class="form-label small text-muted mb-1">Status</label>
        <select class="form-select form-select-sm" [(ngModel)]="statusFilter" (change)="onFilterChange()">
          <option value="">All Statuses</option>
          @for (st of statuses; track st) {
            <option [value]="st">{{ st.replace('_', ' ') }}</option>
          }
        </select>
      </div>
      <div class="col-6 col-md-2">
        <label class="form-label small text-muted mb-1">Sort by</label>
        <select class="form-select form-select-sm" [(ngModel)]="sortValue" (change)="onFilterChange()">
          <option value="createdDate,desc">Newest first</option>
          <option value="createdDate,asc">Oldest first</option>
          <option value="status,asc">Status A–Z</option>
          <option value="expectedDeliveryDate,asc">Expected date</option>
        </select>
      </div>
      <div class="col-6 col-md-2">
        <label class="form-label small text-muted mb-1">Created From</label>
        <input type="date" class="form-control form-control-sm" [(ngModel)]="fromDate" (change)="onFilterChange()" />
      </div>
      <div class="col-6 col-md-2">
        <label class="form-label small text-muted mb-1">Created To</label>
        <input type="date" class="form-control form-control-sm" [(ngModel)]="toDate" (change)="onFilterChange()" />
      </div>
      <div class="col-6 col-md-auto d-flex align-items-center pt-md-3">
        <div class="form-check form-switch mb-0">
          <input
            id="delayedSwitch"
            class="form-check-input"
            type="checkbox"
            [(ngModel)]="delayedOnly"
            (change)="onFilterChange()" />
          <label class="form-check-label small fw-semibold text-danger" for="delayedSwitch">Overdue Only</label>
        </div>
      </div>
    </app-search-filter-bar>

    @if (selectedIds.size > 0) {
      <div class="alert alert-warning d-flex flex-wrap justify-content-between align-items-center gap-2">
        <span><strong class="tabular-nums">{{ selectedIds.size }}</strong> shipment(s) selected.</span>
        <div class="d-flex gap-2">
          <button type="button" class="btn btn-danger btn-sm" (click)="promptBulkCancel()" [disabled]="demoMode">
            <i class="bi bi-x-circle me-1"></i>Cancel selected
          </button>
          <button type="button" class="btn btn-outline-secondary btn-sm" (click)="selectedIds.clear()">Clear selection</button>
        </div>
      </div>
    }

    @if (viewMode === 'board') {
      <div class="row g-3">
        @for (st of statuses; track st) {
          <div class="col-12 col-md-6 col-xl-2">
            <div class="ops-card h-100">
              <div class="ops-card-header py-2">
                <app-status-badge [status]="st"></app-status-badge>
                <span class="badge bg-light text-dark border tabular-nums">{{ boardGroup(st).length }}</span>
              </div>
              <div class="ops-card-body d-flex flex-column gap-2 p-2">
                @for (s of boardGroup(st); track s.shipmentId) {
                  <div class="border rounded p-2 bg-white">
                    <a [routerLink]="['/shipments', s.shipmentId]" class="code-badge text-decoration-none">{{ s.trackingNumber }}</a>
                    <div class="small fw-medium mt-1">{{ s.customerName }}</div>
                    <div class="small text-muted">{{ s.originCity }} → {{ s.destinationCity }}</div>
                    <div class="d-flex gap-1 mt-2 flex-wrap">
                      @if (nextStatus(s)) {
                        <button type="button" class="btn btn-outline-primary btn-sm" (click)="advance(s)" [disabled]="demoMode || busyId === s.shipmentId" [title]="demoMode ? 'Unavailable in demo mode' : nextStatusLabel(s.shipmentStatus)">
                          <i class="bi bi-arrow-right-circle me-1"></i>Advance
                        </button>
                      }
                      <a [routerLink]="['/shipments', s.shipmentId]" class="btn btn-outline-secondary btn-sm">View</a>
                    </div>
                  </div>
                } @empty {
                  <div class="small text-muted text-center py-3">No shipments</div>
                }
              </div>
            </div>
          </div>
        }
      </div>
      <app-pagination
        [page]="page" [totalPages]="totalPages" [totalElements]="totalElements" [pageSize]="pageSize"
        (pageChange)="onPageChange($event)" (pageSizeChange)="onPageSizeChange($event)">
      </app-pagination>
    } @else {
      @if (loading) {
        <div class="ops-card p-3 mb-3">
          <div class="skeleton skeleton-row" style="width: 30%;"></div>
          <div class="skeleton skeleton-row" style="width: 95%;"></div>
          <div class="skeleton skeleton-row" style="width: 85%;"></div>
          <div class="skeleton skeleton-row" style="width: 90%;"></div>
        </div>
      }
      <app-data-table
        title="Shipments Registry"
        [subtitle]="totalElements + ' shipment(s) matching filters'"
        [loading]="loading"
        [empty]="shipments.length === 0"
        [errorMessage]="errorMessage"
        emptyIcon="bi-box-seam"
        emptyTitle="No shipments found"
        emptyDescription="No shipments match your search or date filters."
        emptyActionLabel="Register Shipment"
        emptyActionLink="/shipments/new"
        (retry)="loadShipments()">
        <thead>
          <tr>
            <th><input type="checkbox" class="form-check-input" [checked]="allPageSelected" (change)="toggleSelectAll($event)" aria-label="Select all shipments on this page" /></th>
            <th>Tracking #</th>
            <th>Customer</th>
            <th>Route</th>
            <th>Driver</th>
            <th>Weight</th>
            <th>Expected Date</th>
            <th>Status</th>
            <th class="text-center">Events</th>
            <th class="text-end">Actions</th>
          </tr>
        </thead>
        <tbody>
          @for (s of shipments; track s.shipmentId) {
            <tr [class.table-danger]="s.delayed" [class.bg-opacity-10]="s.delayed">
              <td><input type="checkbox" class="form-check-input" [checked]="selectedIds.has(s.shipmentId)" (change)="toggleSelect(s.shipmentId, $event)" [attr.aria-label]="'Select ' + s.trackingNumber" /></td>
              <td>
                <a [routerLink]="['/shipments', s.shipmentId]" class="code-badge text-decoration-none">
                  {{ s.trackingNumber }}
                </a>
              </td>
              <td>
                <div class="fw-semibold small">{{ s.customerName }}</div>
                <div class="small text-muted">{{ s.customerCode }}</div>
              </td>
              <td>
                <div class="small fw-medium">{{ s.originCity }} <i class="bi bi-arrow-right mx-1"></i> {{ s.destinationCity }}</div>
                <div class="small text-muted">{{ s.originHubCode }}</div>
              </td>
              <td>
                @if (assigningId === s.shipmentId) {
                  <div class="d-flex gap-1" style="min-width: 180px;">
                    <select class="form-select form-select-sm" [(ngModel)]="assignDriverId">
                      <option [ngValue]="null">Select driver…</option>
                      @for (d of availableDrivers; track d.driverId) {
                        <option [ngValue]="d.driverId">{{ d.fullName }} ({{ d.driverCode }})</option>
                      }
                    </select>
                    <button type="button" class="btn btn-primary btn-sm" (click)="confirmAssign(s)" [disabled]="!assignDriverId || busyId === s.shipmentId" title="Assign driver"><i class="bi bi-check-lg"></i></button>
                    <button type="button" class="btn btn-outline-secondary btn-sm" (click)="assigningId = null" title="Cancel"><i class="bi bi-x-lg"></i></button>
                  </div>
                } @else if (s.driverName) {
                  <div class="small fw-medium">{{ s.driverName }}</div>
                  <div class="small text-muted">{{ s.driverCode }}</div>
                } @else {
                  <span class="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle">Unassigned</span>
                }
              </td>
              <td class="tabular-nums small">{{ s.weight | number:'1.2-2' }} kg</td>
              <td class="tabular-nums small" [class.text-danger]="s.delayed" [class.fw-semibold]="s.delayed">
                {{ s.expectedDeliveryDate | date:'dd MMM yyyy' }}
              </td>
              <td>
                <div class="d-flex flex-wrap gap-1 align-items-center">
                  <app-status-badge [status]="s.shipmentStatus"></app-status-badge>
                  @if (s.delayed) {
                    <app-status-badge status="DELAYED" [delayed]="true"></app-status-badge>
                  }
                </div>
              </td>
              <td class="text-center tabular-nums">
                <span class="badge bg-light text-dark border">{{ s.trackingEventCount }}</span>
              </td>
              <td class="text-end">
                <div class="btn-group btn-group-sm">
                  <a [routerLink]="['/shipments', s.shipmentId]" class="btn btn-outline-secondary" title="Details &amp; Tracking">
                    <i class="bi bi-eye"></i>
                  </a>
                  @if (!s.driverId) {
                    <button type="button" class="btn btn-outline-info" title="Assign driver" [disabled]="demoMode" (click)="startAssign(s)">
                      <i class="bi bi-person-plus"></i>
                    </button>
                  }
                  @if (nextStatus(s)) {
                    <button type="button" class="btn btn-outline-success" [title]="demoMode ? 'Unavailable in demo mode' : nextStatusLabel(s.shipmentStatus)" [disabled]="demoMode || busyId === s.shipmentId" (click)="advance(s)">
                      <i class="bi bi-arrow-right-circle"></i>
                    </button>
                  }
                  @if (s.shipmentStatus === 'OUT_FOR_DELIVERY') {
                    <button type="button" class="btn btn-outline-success" title="Mark delivered" [disabled]="demoMode || busyId === s.shipmentId" (click)="deliver(s)">
                      <i class="bi bi-check2-circle"></i>
                    </button>
                  }
                  @if (s.shipmentStatus !== 'DELIVERED' && s.shipmentStatus !== 'CANCELLED') {
                    <button type="button" class="btn btn-outline-warning" title="Cancel shipment" [disabled]="demoMode || busyId === s.shipmentId" (click)="promptCancel(s)">
                      <i class="bi bi-x-circle"></i>
                    </button>
                  }
                  <a [routerLink]="['/shipments', s.shipmentId, 'edit']" class="btn btn-outline-primary" title="Edit Shipment">
                    <i class="bi bi-pencil"></i>
                  </a>
                  <button
                    type="button"
                    class="btn btn-outline-danger"
                    title="Delete Shipment"
                    (click)="promptDelete(s)">
                    <i class="bi bi-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          }
        </tbody>
      </app-data-table>
      <app-pagination
        [page]="page" [totalPages]="totalPages" [totalElements]="totalElements" [pageSize]="pageSize"
        (pageChange)="onPageChange($event)" (pageSizeChange)="onPageSizeChange($event)">
      </app-pagination>
    }

    <app-confirm-dialog
      [visible]="!!shipmentToDelete"
      title="Delete Shipment"
      [message]="deleteConfirmMessage"
      confirmLabel="Delete Shipment"
      confirmVariant="danger"
      [loading]="deleting"
      (confirmed)="confirmDelete()"
      (cancelled)="shipmentToDelete = null">
    </app-confirm-dialog>

    <app-confirm-dialog
      [visible]="!!shipmentToCancel"
      title="Cancel Shipment"
      [message]="shipmentToCancel ? 'Cancel shipment ' + shipmentToCancel.trackingNumber + '? The shipment will be marked CANCELLED.' : ''"
      confirmLabel="Cancel Shipment"
      confirmVariant="warning"
      [loading]="busyId !== null"
      (confirmed)="confirmCancel()"
      (cancelled)="shipmentToCancel = null">
    </app-confirm-dialog>

    <app-confirm-dialog
      [visible]="bulkCancelOpen"
      title="Cancel selected shipments"
      [message]="'Cancel ' + selectedIds.size + ' selected shipment(s)? Each will be marked CANCELLED.'"
      confirmLabel="Cancel Selected"
      confirmVariant="danger"
      [loading]="bulkBusy"
      (confirmed)="confirmBulkCancel()"
      (cancelled)="bulkCancelOpen = false">
    </app-confirm-dialog>
  `
})
export class ShipmentListComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly shipmentService = inject(ShipmentService);
  private readonly driverService = inject(DriverService);
  private readonly demoData = inject(DemoDataService);
  private readonly exportService = inject(ExportService);
  private readonly settingsService = inject(SettingsService);
  private readonly notification = inject(NotificationService);

  readonly statuses: ShipmentStatus[] = [
    'PENDING',
    'PICKED_UP',
    'IN_TRANSIT',
    'OUT_FOR_DELIVERY',
    'DELIVERED',
    'CANCELLED'
  ];

  shipments: ShipmentResponse[] = [];
  availableDrivers: DriverResponse[] = [];
  trackingSearch = '';
  statusFilter: ShipmentStatus | '' = '';
  fromDate = '';
  toDate = '';
  delayedOnly = false;
  sortValue = 'createdDate,desc';
  viewMode: 'table' | 'board' = 'table';

  page = 0;
  pageSize = this.settingsService.settings().pageSize;
  totalElements = 0;
  totalPages = 0;

  loading = true;
  errorMessage: string | null = null;
  demoMode = false;
  readonly apiBaseUrl = environment.apiBaseUrl;
  shipmentToDelete: ShipmentResponse | null = null;
  shipmentToCancel: ShipmentResponse | null = null;
  bulkCancelOpen = false;
  bulkBusy = false;
  deleting = false;
  busyId: number | null = null;
  assigningId: number | null = null;
  assignDriverId: number | null = null;
  selectedIds = new Set<number>();

  get deleteConfirmMessage(): string {
    if (!this.shipmentToDelete) return '';
    if (this.shipmentToDelete.trackingEventCount > 0) {
      return `Shipment "${this.shipmentToDelete.trackingNumber}" has ${this.shipmentToDelete.trackingEventCount} tracking event(s). Deletion is prohibited when tracking history exists.`;
    }
    return `Are you sure you want to delete shipment "${this.shipmentToDelete.trackingNumber}"?`;
  }

  get allPageSelected(): boolean {
    return this.shipments.length > 0 && this.shipments.every((s) => this.selectedIds.has(s.shipmentId));
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      if (params['status']) {
        this.statusFilter = params['status'] as ShipmentStatus;
      }
      if (params['delayedOnly'] === 'true') {
        this.delayedOnly = true;
      }
      if (params['trackingNumber']) {
        this.trackingSearch = params['trackingNumber'];
      }
      this.loadShipments();
    });
    this.driverService.getAll().subscribe({
      next: (drivers) => { this.availableDrivers = drivers.filter((d) => d.availabilityStatus !== 'INACTIVE'); },
      error: () => { this.availableDrivers = this.demoData.drivers; }
    });
  }

  nextStatus(s: ShipmentResponse): ShipmentStatus | null {
    return NEXT_STATUS[s.shipmentStatus];
  }

  nextStatusLabel(status: ShipmentStatus): string {
    return nextStatusLabel(status);
  }

  boardGroup(status: ShipmentStatus): ShipmentResponse[] {
    return this.shipments.filter((s) => s.shipmentStatus === status);
  }

  onFilterChange(): void {
    this.page = 0;
    this.loadShipments();
  }

  onPageChange(p: number): void {
    this.page = p;
    this.loadShipments();
  }

  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.settingsService.setPageSize(size);
    this.page = 0;
    this.loadShipments();
  }

  loadShipments(): void {
    if (this.fromDate && this.toDate && this.toDate < this.fromDate) {
      this.notification.warning('Created To date cannot be earlier than Created From date.');
      return;
    }

    this.loading = true;
    this.errorMessage = null;
    const filters = {
      trackingNumber: this.trackingSearch,
      status: this.statusFilter,
      fromDate: this.fromDate,
      toDate: this.toDate,
      delayedOnly: this.delayedOnly
    };
    this.shipmentService.getPaged(filters, this.page, this.pageSize, this.sortValue).subscribe({
      next: (data: PageResponse<ShipmentResponse>) => {
        this.applyPage(data);
        this.demoMode = false;
        this.loading = false;
      },
      error: (err) => {
        if (err?.status === 0) {
          // Demo mode: read-only demo shipments, paged + sorted client-side.
          let demo = this.demoData.shipments.filter((s) => {
            if (this.statusFilter && s.shipmentStatus !== this.statusFilter) return false;
            if (this.delayedOnly && !s.delayed) return false;
            if (this.trackingSearch) {
              const q = this.trackingSearch.toLowerCase();
              if (!s.trackingNumber.toLowerCase().includes(q) && !s.customerName.toLowerCase().includes(q) && !s.destinationCity.toLowerCase().includes(q)) return false;
            }
            return true;
          });
          const [field, dir] = this.sortValue.split(',');
          demo = [...demo].sort((a, b) => {
            const av = String((a as unknown as Record<string, unknown>)[field] ?? '');
            const bv = String((b as unknown as Record<string, unknown>)[field] ?? '');
            return dir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
          });
          this.applyPage(paginateClient(demo, this.page, this.pageSize));
          this.demoMode = true;
          this.loading = false;
        } else {
          this.errorMessage = err.message || 'Failed to load shipments.';
          this.loading = false;
        }
      }
    });
  }

  private applyPage(data: PageResponse<ShipmentResponse>): void {
    this.shipments = data.content;
    this.page = data.page;
    this.pageSize = data.size;
    this.totalElements = data.totalElements;
    this.totalPages = data.totalPages;
  }

  onReset(): void {
    this.trackingSearch = '';
    this.statusFilter = '';
    this.fromDate = '';
    this.toDate = '';
    this.delayedOnly = false;
    this.page = 0;
    this.loadShipments();
  }

  exportCsv(): void {
    this.shipmentService.exportCsv({
      trackingNumber: this.trackingSearch,
      status: this.statusFilter,
      fromDate: this.fromDate,
      toDate: this.toDate,
      delayedOnly: this.delayedOnly
    }).subscribe({
      next: (blob) => {
        this.exportService.downloadBlob(blob, `shipments-${new Date().toISOString().slice(0, 10)}.csv`);
        this.notification.success('Shipments CSV downloaded.');
      },
      error: (err) => this.notification.error(err?.message || 'Export failed.')
    });
  }

  toggleSelect(id: number, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) this.selectedIds.add(id);
    else this.selectedIds.delete(id);
  }

  toggleSelectAll(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) this.shipments.forEach((s) => this.selectedIds.add(s.shipmentId));
    else this.shipments.forEach((s) => this.selectedIds.delete(s.shipmentId));
  }

  promptBulkCancel(): void {
    this.bulkCancelOpen = true;
  }

  confirmBulkCancel(): void {
    const ids = [...this.selectedIds];
    this.bulkBusy = true;
    let succeeded = 0;
    let failed = 0;
    from(ids)
      .pipe(
        concatMap((id) =>
          this.shipmentService.cancel(id, 'Bulk cancel from shipment list').pipe(
            catchError(() => {
              failed++;
              return of(null);
            })
          )
        )
      )
      .subscribe({
        next: (res) => {
          if (res) succeeded++;
        },
        complete: () => {
          this.bulkBusy = false;
          this.bulkCancelOpen = false;
          this.selectedIds.clear();
          this.notification.success(`Bulk cancel finished: ${succeeded} cancelled, ${failed} failed.`);
          this.loadShipments();
        }
      });
  }

  startAssign(s: ShipmentResponse): void {
    this.assigningId = s.shipmentId;
    this.assignDriverId = null;
  }

  confirmAssign(s: ShipmentResponse): void {
    if (!this.assignDriverId) return;
    this.busyId = s.shipmentId;
    this.shipmentService.assignDriver(s.shipmentId, this.assignDriverId).subscribe({
      next: (updated) => {
        this.busyId = null;
        this.assigningId = null;
        this.notification.success(`Driver ${updated.driverName ?? ''} assigned to ${updated.trackingNumber}.`);
        this.loadShipments();
      },
      error: (err) => {
        this.busyId = null;
        this.notification.error(err?.message || 'Could not assign driver.');
      }
    });
  }

  advance(s: ShipmentResponse): void {
    this.busyId = s.shipmentId;
    this.shipmentService.advance(s.shipmentId).subscribe({
      next: (updated) => {
        this.busyId = null;
        this.notification.success(`${updated.trackingNumber} advanced to ${updated.shipmentStatus.replace(/_/g, ' ')}.`);
        this.loadShipments();
      },
      error: (err) => {
        this.busyId = null;
        this.notification.error(err?.message || 'Could not advance shipment.');
      }
    });
  }

  promptCancel(s: ShipmentResponse): void {
    this.shipmentToCancel = s;
  }

  confirmCancel(): void {
    if (!this.shipmentToCancel) return;
    const s = this.shipmentToCancel;
    this.busyId = s.shipmentId;
    this.shipmentService.cancel(s.shipmentId, 'Cancelled from shipment list').subscribe({
      next: (updated) => {
        this.busyId = null;
        this.shipmentToCancel = null;
        this.notification.success(`${updated.trackingNumber} cancelled.`);
        this.loadShipments();
      },
      error: (err) => {
        this.busyId = null;
        this.notification.error(err?.message || 'Could not cancel shipment.');
      }
    });
  }

  deliver(s: ShipmentResponse): void {
    const receivedBy = window.prompt(`Who received shipment ${s.trackingNumber}?`, s.customerName);
    if (!receivedBy || !receivedBy.trim()) return;
    this.busyId = s.shipmentId;
    this.shipmentService.deliver(s.shipmentId, receivedBy.trim()).subscribe({
      next: (updated) => {
        this.busyId = null;
        this.notification.success(`${updated.trackingNumber} marked as delivered.`);
        this.loadShipments();
      },
      error: (err) => {
        this.busyId = null;
        this.notification.error(err?.message || 'Could not mark shipment delivered.');
      }
    });
  }

  promptDelete(shipment: ShipmentResponse): void {
    this.shipmentToDelete = shipment;
  }

  confirmDelete(): void {
    if (!this.shipmentToDelete) return;
    this.deleting = true;
    this.shipmentService.delete(this.shipmentToDelete.shipmentId).subscribe({
      next: (res) => {
        this.notification.success(res.message || 'Shipment deleted successfully.');
        this.shipmentToDelete = null;
        this.deleting = false;
        this.loadShipments();
      },
      error: (err) => {
        this.notification.error(err.message || 'Cannot delete shipment.');
        this.shipmentToDelete = null;
        this.deleting = false;
      }
    });
  }
}
