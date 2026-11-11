import { TestBed } from '@angular/core/testing';
import { StatusBadgeComponent } from './status-badge.component';

describe('StatusBadgeComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatusBadgeComponent]
    }).compileComponents();
  });

  it('displays formatted status label', () => {
    const fixture = TestBed.createComponent(StatusBadgeComponent);
    fixture.componentInstance.status = 'OUT_FOR_DELIVERY';
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('OUT FOR DELIVERY');
  });

  it('displays DELAYED badge when delayed flag is true', () => {
    const fixture = TestBed.createComponent(StatusBadgeComponent);
    fixture.componentInstance.status = 'IN_TRANSIT';
    fixture.componentInstance.delayed = true;
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('DELAYED');
  });
});

