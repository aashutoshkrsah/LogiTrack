import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { DashboardSummaryResponse } from '../../models/dashboard.model';
import { DashboardService } from '../../services/dashboard.service';
import { DashboardComponent } from './dashboard.component';

describe('DashboardComponent', () => {
  const mockSummary: DashboardSummaryResponse = {
    totalShipments: 10,
    pendingShipments: 2,
    pickedUpShipments: 1,
    inTransitShipments: 3,
    outForDeliveryShipments: 1,
    deliveredShipments: 3,
    cancelledShipments: 0,
    delayedShipmentsCount: 2,
    totalCustomers: 5,
    totalDrivers: 5,
    availableDrivers: 2,
    totalHubs: 5,
    statusDistribution: [],
    delayedShipments: [],
    recentTrackingEvents: []
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        {
          provide: DashboardService,
          useValue: { getSummary: () => of(mockSummary) }
        }
      ]
    }).compileComponents();
  });

  it('renders hero banner, KPI cards, donut chart, and quick actions from backend summary', () => {
    const fixture = TestBed.createComponent(DashboardComponent);
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Logistics Shipment');
    expect(text).toContain('Shipment Status Distribution');
    expect(text).toContain('Quick Actions');
    expect(text).toContain('Delayed Shipments');
    expect(text).toContain('10');
  });
});

