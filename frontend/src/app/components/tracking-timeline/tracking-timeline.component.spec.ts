import { TestBed } from '@angular/core/testing';
import { TrackingTimelineComponent } from './tracking-timeline.component';

describe('TrackingTimelineComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrackingTimelineComponent]
    }).compileComponents();
  });

  it('renders empty state when there are no events', () => {
    const fixture = TestBed.createComponent(TrackingTimelineComponent);
    fixture.componentInstance.events = [];
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('No tracking milestones recorded yet.');
  });

  it('shows Remove button only on latest event when not DELIVERED', () => {
    const fixture = TestBed.createComponent(TrackingTimelineComponent);
    fixture.componentInstance.editable = true;
    fixture.componentInstance.currentShipmentStatus = 'IN_TRANSIT';
    fixture.componentInstance.events = [
      {
        eventId: 1,
        shipmentId: 10,
        trackingNumber: 'TRK-1',
        eventDateTime: '2026-11-10T10:00:00',
        eventStatus: 'PICKED_UP',
        hubId: 1,
        hubCode: 'HUB-1',
        hubName: 'Mumbai Hub',
        hubCity: 'Mumbai',
        remarks: 'Picked up',
        updatedBy: 'Ops 1'
      },
      {
        eventId: 2,
        shipmentId: 10,
        trackingNumber: 'TRK-1',
        eventDateTime: '2026-11-11T12:00:00',
        eventStatus: 'IN_TRANSIT',
        hubId: 2,
        hubCode: 'HUB-2',
        hubName: 'Pune Hub',
        hubCity: 'Pune',
        remarks: 'Arrived hub',
        updatedBy: 'Ops 2'
      }
    ];
    fixture.detectChanges();
    const removeButtons = fixture.nativeElement.querySelectorAll('button[title="Remove latest tracking event"]');
    expect(removeButtons.length).toBe(1);
  });
});

