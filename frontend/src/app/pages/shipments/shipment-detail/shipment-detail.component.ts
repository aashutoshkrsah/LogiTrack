import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { DriverResponse } from '../../../models/driver.model';
import { HubResponse } from '../../../models/hub.model';
import { ShipmentRequest, ShipmentResponse, ShipmentStatus } from '../../../models/shipment.model';
import { TrackingEventRequest, TrackingEventResponse } from '../../../models/tracking-event.model';
import { DriverService } from '../../../services/driver.service';
import { HubService } from '../../../services/hub.service';
import { NotificationService } from '../../../services/notification.service';
import { ShipmentService } from '../../../services/shipment.service';
import { TrackingEventService } from '../../../services/tracking-event.service';
import {
  ConfirmDialogComponent,
  LoadingSpinnerComponent,
  StatusBadgeComponent,
  TrackingTimelineComponent
} from '../../../shared/shared-ui';
import { noWhitespaceValidator } from '../../../validators/custom-validators';

@Component({
  selector: 'app-shipment-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterLink,
    LoadingSpinnerComponent,
    StatusBadgeComponent,
    TrackingTimelineComponent,
    ConfirmDialogComponent
  ],
  template: `
    <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
      <div>
        <h1 class="page-title">Shipment Details &amp; Operational Tracking</h1>
        <p class="page-subtitle">Inspect consignment details, assign drivers, and record chronological milestones</p>
      </div>
      <div class="d-flex gap-2 flex-wrap">
        <a routerLink="/shipments" class="btn btn-outline-secondary btn-sm">
          <i class="bi bi-arrow-left me-1"></i>All Shipments
        </a>
        @if (shipment) {
          <a [routerLink]="['/shipments', shipment.shipmentId, 'edit']" class="btn btn-outline-primary btn-sm">
            <i class="bi bi-pencil me-1"></i>Edit Shipment
          </a>
          <button type="button" class="btn btn-outline-danger btn-sm" (click)="showDeleteShipmentModal = true">
            <i class="bi bi-trash me-1"></i>Delete
          </button>
        }
      </div>
    </div>

    @if (loading) {
      <div class="ops-card"><app-loading-spinner message="Loading shipment and tracking timeline..."></app-loading-spinner></div>
    } @else if (shipment) {
      <!-- Top Consignment Summary -->
      <div class="ops-card mb-4">
        <div class="ops-card-header">
          <div class="d-flex align-items-center gap-2 flex-wrap">
            <span class="code-badge fs-6">{{ shipment.trackingNumber }}</span>
            <app-status-badge [status]="shipment.shipmentStatus"></app-status-badge>
            @if (shipment.delayed) {
              <app-status-badge status="DELAYED" [delayed]="true"></app-status-badge>
            }
          </div>
          <div class="small text-muted tabular-nums">
            Created: <strong>{{ shipment.createdDate | date:'dd MMM yyyy' }}</strong> ·
            Expected: <strong [class.text-danger]="shipment.delayed">{{ shipment.expectedDeliveryDate | date:'dd MMM yyyy' }}</strong>
          </div>
        </div>
        <div class="ops-card-body">
          <div class="row g-4">
            <div class="col-md-4">
              <div class="small text-muted fw-semibold text-uppercase mb-1">Customer</div>
              <div class="fw-bold">{{ shipment.customerName }}</div>
              <div class="small text-muted">{{ shipment.customerCode }}</div>
            </div>
            <div class="col-md-4">
              <div class="small text-muted fw-semibold text-uppercase mb-1">Origin Hub</div>
              <div class="fw-bold">{{ shipment.originHubName }}</div>
              <div class="small text-muted">{{ shipment.originHubCode }} · {{ shipment.originCity }}</div>
            </div>
            <div class="col-md-4">
              <div class="small text-muted fw-semibold text-uppercase mb-1">Consignment Weight</div>
              <div class="fw-bold tabular-nums">{{ shipment.weight | number:'1.2-2' }} kg</div>
              <div class="small text-muted">{{ events.length }} milestone event(s)</div>
            </div>
            <div class="col-md-8">
              <div class="small text-muted fw-semibold text-uppercase mb-1">Delivery Destination</div>
              <div class="fw-medium">{{ shipment.destinationAddress }}, <strong>{{ shipment.destinationCity }}</strong></div>
            </div>
            <div class="col-md-4">
              <div class="small text-muted fw-semibold text-uppercase mb-1">Assigned Driver</div>
              <div class="input-group input-group-sm mt-1">
                <select class="form-select" [(ngModel)]="selectedDriverId">
                  <option [ngValue]="null">-- Unassigned --</option>
                  @for (d of drivers; track d.driverId) {
                    <option [ngValue]="d.driverId" [disabled]="d.availabilityStatus === 'INACTIVE' && d.driverId !== shipment.driverId">
                      {{ d.fullName }} ({{ d.availabilityStatus }})
                    </option>
                  }
                </select>
                <button
                  type="button"
                  class="btn btn-primary"
                  [disabled]="assigningDriver"
                  (click)="onAssignDriver()">
                  {{ assigningDriver ? 'Saving...' : 'Assign' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="row g-4">
        <!-- Record New Milestone Event -->
        <div class="col-12 col-lg-5">
          <div class="ops-card">
            <div class="ops-card-header">
              <div>
                <h6 class="mb-0 fw-bold">Record Tracking Event</h6>
                <div class="small text-muted">Append milestone to synchronize shipment status</div>
              </div>
            </div>
            <div class="ops-card-body">
              @if (shipment.shipmentStatus === 'CANCELLED') {
                <div class="alert alert-secondary small mb-0">
                  This shipment is cancelled. New delivery milestones cannot be appended.
                </div>
              } @else {
                @if (eventServerError) {
                  <div class="alert alert-danger small mb-3">{{ eventServerError }}</div>
                }
                <form [formGroup]="eventForm" (ngSubmit)="onRecordEvent()" novalidate>
                  <div class="mb-3">
                    <label for="eventStatus" class="form-label">Milestone Status <span class="required-star">*</span></label>
                    <select id="eventStatus" class="form-select" formControlName="eventStatus">
                      @for (st of milestoneStatuses; track st) {
                        <option [value]="st">{{ st.replace('_', ' ') }}</option>
                      }
                    </select>
                  </div>

                  <div class="mb-3">
                    <label for="eventDateTime" class="form-label">Event Date &amp; Time <span class="required-star">*</span></label>
                    <input
                      id="eventDateTime"
                      type="datetime-local"
                      class="form-control"
                      formControlName="eventDateTime"
                      [class.is-invalid]="isEventFieldInvalid('eventDateTime')" />
                    @if (isEventFieldInvalid('eventDateTime')) {
                      <div class="invalid-feedback">Event date and time is required.</div>
                    }
                  </div>

                  <div class="mb-3">
                    <label for="hubId" class="form-label">Hub Checkpoint (Optional)</label>
                    <select id="hubId" class="form-select" formControlName="hubId">
                      <option [ngValue]="null">-- In Transit / Field Location --</option>
                      @for (h of hubs; track h.hubId) {
                        <option [ngValue]="h.hubId">{{ h.hubCode }} — {{ h.hubName }} ({{ h.city }})</option>
                      }
                    </select>
                  </div>

                  <div class="mb-3">
                    <label for="updatedBy" class="form-label">Updated By (Staff Name) <span class="required-star">*</span></label>
                    <input
                      id="updatedBy"
                      type="text"
                      class="form-control"
                      formControlName="updatedBy"
                      placeholder="e.g. Operator R. Sharma"
                      [class.is-invalid]="isEventFieldInvalid('updatedBy')" />
                    @if (isEventFieldInvalid('updatedBy')) {
                      <div class="invalid-feedback">Operator name is required (min 2 characters).</div>
                    }
                  </div>

                  <div class="mb-3">
                    <label for="remarks" class="form-label">Operational Remarks</label>
                    <textarea
                      id="remarks"
                      rows="2"
                      class="form-control"
                      formControlName="remarks"
                      placeholder="Checkpoint notes, seal number, or delivery receiver..."></textarea>
                  </div>

                  <button type="submit" class="btn btn-primary w-100" [disabled]="submittingEvent">
                    @if (submittingEvent) {
                      <span class="spinner-border spinner-border-sm me-1"></span>
                    }
                    <i class="bi bi-plus-circle me-1"></i>Append Tracking Event
                  </button>
                </form>
              }
            </div>
          </div>
        </div>

        <!-- Chronological Tracking Timeline -->
        <div class="col-12 col-lg-7">
          <div class="ops-card">
            <div class="ops-card-header">
              <div>
                <h6 class="mb-0 fw-bold">Chronological Tracking History</h6>
                <div class="small text-muted">Append-only audit log · Corrections require explicit remarks</div>
              </div>
              <span class="badge bg-light text-dark border tabular-nums">{{ events.length }} Event(s)</span>
            </div>
            <div class="ops-card-body">
              <app-tracking-timeline
                [events]="events"
                [currentShipmentStatus]="shipment.shipmentStatus"
                [editable]="true"
                (correctEvent)="openCorrectionModal($event)"
                (deleteEvent)="promptDeleteEvent($event)">
              </app-tracking-timeline>
            </div>
          </div>
        </div>
      </div>

      <!-- Correction Modal (PUT /api/tracking-events/{id} with mandatory remarks) -->
      @if (eventToCorrect) {
        <div class="modal-backdrop fade show"></div>
        <div class="modal d-block fade show" tabindex="-1" role="dialog" aria-modal="true">
          <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content border-0 shadow-lg rounded-3">
              <div class="modal-header border-bottom px-4 py-3">
                <h5 class="modal-title fw-bold fs-6">Correct Tracking Event #{{ eventToCorrect.eventId }}</h5>
                <button type="button" class="btn-close" (click)="eventToCorrect = null" aria-label="Close"></button>
              </div>
              <form [formGroup]="correctionForm" (ngSubmit)="submitCorrection()" novalidate>
                <div class="modal-body px-4 py-3">
                  @if (correctionError) {
                    <div class="alert alert-danger small">{{ correctionError }}</div>
                  }
                  <div class="mb-3">
                    <label class="form-label">Corrected Status <span class="required-star">*</span></label>
                    <select class="form-select" formControlName="eventStatus">
                      @for (st of milestoneStatuses; track st) {
                        <option [value]="st">{{ st.replace('_', ' ') }}</option>
                      }
                    </select>
                  </div>
                  <div class="mb-3">
                    <label class="form-label">Event Date &amp; Time <span class="required-star">*</span></label>
                    <input type="datetime-local" class="form-control" formControlName="eventDateTime" />
                  </div>
                  <div class="mb-3">
                    <label class="form-label">Hub (Optional)</label>
                    <select class="form-select" formControlName="hubId">
                      <option [ngValue]="null">-- None --</option>
                      @for (h of hubs; track h.hubId) {
                        <option [ngValue]="h.hubId">{{ h.hubCode }} — {{ h.hubName }}</option>
                      }
                    </select>
                  </div>
                  <div class="mb-3">
                    <label class="form-label">Updated By <span class="required-star">*</span></label>
                    <input type="text" class="form-control" formControlName="updatedBy" />
                  </div>
                  <div class="mb-2">
                    <label class="form-label">Correction Remarks <span class="required-star">*</span></label>
                    <textarea
                      rows="2"
                      class="form-control"
                      formControlName="remarks"
                      placeholder="Required: Explain reason for correcting this tracking record..."
                      [class.is-invalid]="correctionForm.get('remarks')?.invalid && correctionForm.get('remarks')?.touched"></textarea>
                    <div class="invalid-feedback">Explicit remarks are mandatory when correcting a tracking event.</div>
                  </div>
                </div>
                <div class="modal-footer border-top px-4 py-3 bg-light">
                  <button type="button" class="btn btn-outline-secondary btn-sm" (click)="eventToCorrect = null">Cancel</button>
                  <button type="submit" class="btn btn-primary btn-sm" [disabled]="submittingCorrection">
                    {{ submittingCorrection ? 'Saving...' : 'Save Correction' }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      }

      <!-- Delete Shipment Dialog -->
      <app-confirm-dialog
        [visible]="showDeleteShipmentModal"
        title="Delete Shipment"
        [message]="events.length > 0 ? 'Shipment ' + shipment.trackingNumber + ' has tracking history and cannot be deleted.' : 'Delete shipment ' + shipment.trackingNumber + '?'"
        confirmLabel="Delete Shipment"
        confirmVariant="danger"
        [loading]="deletingShipment"
        (confirmed)="onDeleteShipment()"
        (cancelled)="showDeleteShipmentModal = false">
      </app-confirm-dialog>

      <!-- Delete Latest Tracking Event Dialog -->
      <app-confirm-dialog
        [visible]="!!eventToDelete"
        title="Remove Latest Tracking Event"
        [message]="'Remove latest event (' + (eventToDelete?.eventStatus || '') + ')? The shipment status will re-synchronize to the previous milestone.'"
        confirmLabel="Remove Event"
        confirmVariant="danger"
        [loading]="deletingEvent"
        (confirmed)="confirmDeleteEvent()"
        (cancelled)="eventToDelete = null">
      </app-confirm-dialog>
    }
  `
})
export class ShipmentDetailComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly shipmentService = inject(ShipmentService);
  private readonly trackingEventService = inject(TrackingEventService);
  private readonly driverService = inject(DriverService);
  private readonly hubService = inject(HubService);
  private readonly notification = inject(NotificationService);

  readonly milestoneStatuses: ShipmentStatus[] = [
    'PENDING',
    'PICKED_UP',
    'IN_TRANSIT',
    'OUT_FOR_DELIVERY',
    'DELIVERED',
    'CANCELLED'
  ];

  shipment: ShipmentResponse | null = null;
  events: TrackingEventResponse[] = [];
  drivers: DriverResponse[] = [];
  hubs: HubResponse[] = [];

  selectedDriverId: number | null = null;
  assigningDriver = false;
  loading = true;

  submittingEvent = false;
  eventServerError: string | null = null;

  eventToCorrect: TrackingEventResponse | null = null;
  submittingCorrection = false;
  correctionError: string | null = null;

  eventToDelete: TrackingEventResponse | null = null;
  deletingEvent = false;

  showDeleteShipmentModal = false;
  deletingShipment = false;

  readonly eventForm = this.fb.group({
    eventStatus: ['PICKED_UP' as ShipmentStatus, [Validators.required]],
    eventDateTime: [this.nowLocalDateTime(), [Validators.required]],
    hubId: [null as number | null],
    updatedBy: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100), noWhitespaceValidator()]],
    remarks: ['', [Validators.maxLength(500)]]
  });

  readonly correctionForm = this.fb.group({
    eventStatus: ['IN_TRANSIT' as ShipmentStatus, [Validators.required]],
    eventDateTime: ['', [Validators.required]],
    hubId: [null as number | null],
    updatedBy: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100), noWhitespaceValidator()]],
    remarks: ['', [Validators.required, Validators.maxLength(500), noWhitespaceValidator()]]
  });

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadData(id);
  }

  private loadData(shipmentId: number): void {
    this.loading = true;
    forkJoin({
      shipment: this.shipmentService.getById(shipmentId),
      drivers: this.driverService.getAll(),
      hubs: this.hubService.getAll()
    }).subscribe({
      next: ({ shipment, drivers, hubs }) => {
        this.shipment = shipment;
        this.selectedDriverId = shipment.driverId;
        this.drivers = drivers;
        this.hubs = hubs;
        this.suggestNextMilestone(shipment.shipmentStatus);
        this.loadTimeline(shipment.trackingNumber);
      },
      error: (err) => {
        this.notification.error(err.message || 'Shipment not found.');
        this.router.navigate(['/shipments']);
      }
    });
  }

  private loadTimeline(trackingNumber: string): void {
    this.shipmentService.getTimelineByTrackingNumber(trackingNumber).subscribe({
      next: (timeline) => {
        this.shipment = timeline.shipment;
        this.selectedDriverId = timeline.shipment.driverId;
        this.events = timeline.events;
        this.suggestNextMilestone(timeline.shipment.shipmentStatus);
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  onAssignDriver(): void {
    if (!this.shipment) return;
    this.assigningDriver = true;
    const payload: ShipmentRequest = {
      trackingNumber: this.shipment.trackingNumber,
      customerId: this.shipment.customerId,
      driverId: this.selectedDriverId,
      originHubId: this.shipment.originHubId,
      destinationAddress: this.shipment.destinationAddress,
      destinationCity: this.shipment.destinationCity,
      createdDate: this.shipment.createdDate,
      expectedDeliveryDate: this.shipment.expectedDeliveryDate,
      shipmentStatus: this.shipment.shipmentStatus,
      weight: this.shipment.weight
    };
    this.shipmentService.update(this.shipment.shipmentId, payload).subscribe({
      next: (updated) => {
        this.shipment = updated;
        this.assigningDriver = false;
        this.notification.success(
          updated.driverName
            ? `Driver ${updated.driverName} assigned to ${updated.trackingNumber}.`
            : `Driver unassigned from ${updated.trackingNumber}.`
        );
      },
      error: (err) => {
        this.assigningDriver = false;
        this.notification.error(err.message || 'Unable to assign driver.');
      }
    });
  }

  onRecordEvent(): void {
    if (!this.shipment) return;
    this.eventServerError = null;
    if (this.eventForm.invalid) {
      this.eventForm.markAllAsTouched();
      return;
    }

    const raw = this.eventForm.getRawValue();
    const payload: TrackingEventRequest = {
      shipmentId: this.shipment.shipmentId,
      eventDateTime: this.normalizeDateTime(raw.eventDateTime || ''),
      eventStatus: raw.eventStatus || 'PICKED_UP',
      hubId: raw.hubId ? Number(raw.hubId) : null,
      remarks: raw.remarks ? raw.remarks.trim() : null,
      updatedBy: (raw.updatedBy || '').trim()
    };

    this.submittingEvent = true;
    this.trackingEventService.create(payload).subscribe({
      next: () => {
        this.submittingEvent = false;
        this.notification.success('Tracking event recorded and shipment status synchronized.');
        this.eventForm.patchValue({
          eventDateTime: this.nowLocalDateTime(),
          remarks: ''
        });
        if (this.shipment) {
          this.loadTimeline(this.shipment.trackingNumber);
        }
      },
      error: (err) => {
        this.submittingEvent = false;
        this.eventServerError = err.message || 'Failed to record tracking event.';
      }
    });
  }

  openCorrectionModal(event: TrackingEventResponse): void {
    this.eventToCorrect = event;
    this.correctionError = null;
    this.correctionForm.patchValue({
      eventStatus: event.eventStatus,
      eventDateTime: event.eventDateTime.slice(0, 16),
      hubId: event.hubId,
      updatedBy: event.updatedBy,
      remarks: event.remarks || ''
    });
  }

  submitCorrection(): void {
    if (!this.eventToCorrect || !this.shipment) return;
    this.correctionError = null;
    if (this.correctionForm.invalid) {
      this.correctionForm.markAllAsTouched();
      return;
    }

    const raw = this.correctionForm.getRawValue();
    const payload: TrackingEventRequest = {
      shipmentId: this.shipment.shipmentId,
      eventDateTime: this.normalizeDateTime(raw.eventDateTime || ''),
      eventStatus: raw.eventStatus || 'IN_TRANSIT',
      hubId: raw.hubId ? Number(raw.hubId) : null,
      remarks: (raw.remarks || '').trim(),
      updatedBy: (raw.updatedBy || '').trim()
    };

    this.submittingCorrection = true;
    this.trackingEventService.update(this.eventToCorrect.eventId, payload).subscribe({
      next: () => {
        this.submittingCorrection = false;
        this.eventToCorrect = null;
        this.notification.success('Tracking event corrected and shipment status updated.');
        if (this.shipment) {
          this.loadTimeline(this.shipment.trackingNumber);
        }
      },
      error: (err) => {
        this.submittingCorrection = false;
        this.correctionError = err.message || 'Unable to correct tracking event.';
      }
    });
  }

  promptDeleteEvent(event: TrackingEventResponse): void {
    this.eventToDelete = event;
  }

  confirmDeleteEvent(): void {
    if (!this.eventToDelete || !this.shipment) return;
    this.deletingEvent = true;
    this.trackingEventService.delete(this.eventToDelete.eventId).subscribe({
      next: (res) => {
        this.deletingEvent = false;
        this.eventToDelete = null;
        this.notification.success(res.message || 'Tracking event removed.');
        if (this.shipment) {
          this.loadTimeline(this.shipment.trackingNumber);
        }
      },
      error: (err) => {
        this.deletingEvent = false;
        this.eventToDelete = null;
        this.notification.error(err.message || 'Unable to delete tracking event.');
      }
    });
  }

  onDeleteShipment(): void {
    if (!this.shipment) return;
    this.deletingShipment = true;
    this.shipmentService.delete(this.shipment.shipmentId).subscribe({
      next: (res) => {
        this.deletingShipment = false;
        this.showDeleteShipmentModal = false;
        this.notification.success(res.message || 'Shipment deleted.');
        this.router.navigate(['/shipments']);
      },
      error: (err) => {
        this.deletingShipment = false;
        this.showDeleteShipmentModal = false;
        this.notification.error(err.message || 'Cannot delete shipment.');
      }
    });
  }

  isEventFieldInvalid(field: string): boolean {
    const ctrl = this.eventForm.get(field);
    return !!(ctrl && ctrl.invalid && (ctrl.touched || ctrl.dirty));
  }

  private suggestNextMilestone(current: ShipmentStatus): void {
    const nextMap: Record<ShipmentStatus, ShipmentStatus> = {
      PENDING: 'PICKED_UP',
      PICKED_UP: 'IN_TRANSIT',
      IN_TRANSIT: 'OUT_FOR_DELIVERY',
      OUT_FOR_DELIVERY: 'DELIVERED',
      DELIVERED: 'DELIVERED',
      CANCELLED: 'CANCELLED'
    };
    this.eventForm.patchValue({ eventStatus: nextMap[current] || 'IN_TRANSIT' });
  }

  private nowLocalDateTime(): string {
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  private normalizeDateTime(val: string): string {
    return val.length === 16 ? `${val}:00` : val;
  }
}

