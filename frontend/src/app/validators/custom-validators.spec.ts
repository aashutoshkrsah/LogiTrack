import { FormControl, FormGroup } from '@angular/forms';
import {
  expectedDateAfterCreatedValidator,
  noWhitespaceValidator,
  phoneValidator,
  positiveNumberValidator
} from './custom-validators';

describe('CustomValidators', () => {
  it('validates phone numbers properly', () => {
    const validator = phoneValidator();
    expect(validator(new FormControl('+91-98201-11001'))).toBeNull();
    expect(validator(new FormControl('9876543210'))).toBeNull();
    expect(validator(new FormControl('123'))).toEqual({ invalidPhone: true });
    expect(validator(new FormControl('---'))).toEqual({ invalidPhone: true });
  });

  it('rejects whitespace-only input', () => {
    const validator = noWhitespaceValidator();
    expect(validator(new FormControl('   '))).toEqual({ whitespace: true });
    expect(validator(new FormControl('Valid'))).toBeNull();
  });

  it('validates positive shipment weights', () => {
    const validator = positiveNumberValidator(0.01);
    expect(validator(new FormControl(12.5))).toBeNull();
    expect(validator(new FormControl(0))).toEqual({ minPositive: { min: 0.01 } });
    expect(validator(new FormControl(-5))).toEqual({ minPositive: { min: 0.01 } });
  });

  it('rejects expected delivery date before created date', () => {
    const group = new FormGroup(
      {
        createdDate: new FormControl('2026-11-10'),
        expectedDeliveryDate: new FormControl('2026-11-08')
      },
      { validators: expectedDateAfterCreatedValidator() }
    );
    expect(group.errors).toEqual({ expectedBeforeCreated: true });

    group.patchValue({ expectedDeliveryDate: '2026-11-10' });
    expect(group.errors).toBeNull();
  });
});

