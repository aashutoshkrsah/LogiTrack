import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ShipmentStatus } from '../../models/shipment.model';
import { TrackingEventResponse } from '../../models/tracking-event.model';
import { StatusBadgeComponent } from '../status-badge/status-badge.component';

@Component({
  selector: 'app-tracking-timeline',
  standalone: true,
  imports: [CommonModule, StatusBadgeComponent],
  template: `
    @if (events.length === 0) {
      <div class="text-center py-4 text-muted">
        <i class="bi bi-clock-history fs-2 d-block mb-2"></i>
        <div class="fw-medium">No tracking milestones recorded yet.</div>
        <div class="small">Record the first pickup or checkpoint event to begin tracking history.</div>
      </div>
    } @else {
      <div class="timeline-wrapper">
        @for (event of events; track event.eventId; let idx = $index; let last = $last) {
          <div class="timeline-item" [class.is-latest]="last">
            <div class="timeline-rail">
              <div class="timeline-node" [ngClass]="'node-' + event.eventStatus.toLowerCase()">
                <i class="bi" [ngClass]="iconFor(event.eventStatus)"></i>
              </div>
              @if (!last) {
                <div class="timeline-line"></div>
              }
            </div>

            <div class="timeline-card">
              <div class="d-flex flex-wrap justify-content-between align-items-start gap-2 mb-2">
                <div class="d-flex align-items-center gap-2 flex-wrap">
                  <app-status-badge [status]="event.eventStatus"></app-status-badge>
                  @if (last) {
                    <span class="badge bg-primary-subtle text-primary border border-primary-subtle">Latest Milestone</span>
                  }
                </div>
                <span class="small text-muted tabular-nums">
                  <i class="bi bi-calendar-event me-1"></i>
                  {{ event.eventDateTime | date:'dd MMM yyyy, HH:mm' }}
                </span>
              </div>

              @if (event.remarks) {
                <p class="mb-2 text-dark small">{{ event.remarks }}</p>
              } @else {
                <p class="mb-2 text-muted fst-italic small">No remarks entered.</p>
              }

              <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 pt-2 border-top border-light-subtle small text-muted">
                <div class="d-flex flex-wrap gap-3">
                  <span>
                    <i class="bi bi-building me-1"></i>
                    @if (event.hubName) {
                      {{ event.hubName }} ({{ event.hubCity }})
                    } @else {
                      Field / In-Transit Checkpoint
                    }
                  </span>
                  <span>
                    <i class="bi bi-person-check me-1"></i>
                    Updated by <strong>{{ event.updatedBy }}</strong>
                  </span>
                </div>

                @if (editable) {
                  <div class="d-flex gap-2">
                    <button
                      type="button"
                      class="btn btn-outline-secondary btn-sm py-0 px-2"
                      title="Correct event (requires remarks)"
                      (click)="correctEvent.emit(event)">
                      <i class="bi bi-pencil-square me-1"></i>Correct
                    </button>
                    @if (last && currentShipmentStatus !== 'DELIVERED') {
                      <button
                        type="button"
                        class="btn btn-outline-danger btn-sm py-0 px-2"
                        title="Remove latest tracking event"
                        (click)="deleteEvent.emit(event)">
                        <i class="bi bi-trash me-1"></i>Remove
                      </button>
                    }
                  </div>
                }
              </div>
            </div>
          </div>
        }
      </div>
    }
  `,
  styles: [`
    .timeline-wrapper {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
    .timeline-item {
      display: flex;
      gap: 1rem;
      position: relative;
    }
    .timeline-rail {
      display: flex;
      flex-direction: column;
      align-items: center;
      flex-shrink: 0;
    }
    .timeline-node {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.95rem;
      border: 2px solid #ffffff;
      box-shadow: 0 0 0 2px #e2e8f0;
      z-index: 1;
    }
    .timeline-item.is-latest .timeline-node {
      box-shadow: 0 0 0 3px #bfdbfe;
    }
    .node-pending { background: #fef3c7; color: #b45309; }
    .node-picked_up { background: #e0e7ff; color: #4338ca; }
    .node-in_transit { background: #dbeafe; color: #1d4ed8; }
    .node-out_for_delivery { background: #ede9fe; color: #6d28d9; }
    .node-delivered { background: #d1fae5; color: #047857; }
    .node-cancelled { background: #f1f5f9; color: #475569; }

    .timeline-line {
      width: 2px;
      flex-grow: 1;
      background: #cbd5e1;
      margin: 4px 0;
      min-height: 20px;
    }
    .timeline-card {
      flex: 1;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 0.75rem;
      padding: 0.9rem 1rem;
      margin-bottom: 0.85rem;
    }
    .timeline-item.is-latest .timeline-card {
      background: #ffffff;
      border-color: #93c5fd;
      box-shadow: 0 2px 8px rgba(37, 99, 235, 0.08);
    }
  `]
})
export class TrackingTimelineComponent {
  @Input() events: TrackingEventResponse[] = [];
  @Input() currentShipmentStatus: ShipmentStatus = 'PENDING';
  @Input() editable = false;
  @Output() correctEvent = new EventEmitter<TrackingEventResponse>();
  @Output() deleteEvent = new EventEmitter<TrackingEventResponse>();

  iconFor(status: ShipmentStatus): string {
    switch (status) {
      case 'PENDING': return 'bi-hourglass-split';
      case 'PICKED_UP': return 'bi-box-arrow-up';
      case 'IN_TRANSIT': return 'bi-truck';
      case 'OUT_FOR_DELIVERY': return 'bi-geo-alt';
      case 'DELIVERED': return 'bi-check2-circle';
      case 'CANCELLED': return 'bi-slash-circle';
      default: return 'bi-circle';
    }
  }
}

