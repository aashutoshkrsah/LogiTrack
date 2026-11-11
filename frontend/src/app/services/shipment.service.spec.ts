import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ShipmentService } from './shipment.service';

describe('ShipmentService', () => {
  let service: ShipmentService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(ShipmentService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('sends query parameters for filtered shipment queries', () => {
    service
      .getAll({
        trackingNumber: 'TRK-2026',
        status: 'IN_TRANSIT',
        customerId: 1,
        delayedOnly: true
      })
      .subscribe((res) => {
        expect(res.length).toBe(0);
      });

    const req = httpMock.expectOne((r) => r.url === '/api/shipments');
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('trackingNumber')).toBe('TRK-2026');
    expect(req.request.params.get('status')).toBe('IN_TRANSIT');
    expect(req.request.params.get('customerId')).toBe('1');
    expect(req.request.params.get('delayedOnly')).toBe('true');
    req.flush([]);
  });

  it('requests timeline endpoint for a tracking number', () => {
    service.getTimelineByTrackingNumber('TRK-2026-0001').subscribe();
    const req = httpMock.expectOne('/api/shipments/TRK-2026-0001/timeline');
    expect(req.request.method).toBe('GET');
    req.flush({ shipment: {}, events: [] });
  });
});

