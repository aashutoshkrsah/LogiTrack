import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const PHONE_REGEX = /^(?=(?:.*\d){7,15})[+]?[0-9\s\-()]{7,20}$/;

export function noWhitespaceValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const val = control.value;
    if (typeof val === 'string' && val.length > 0 && val.trim().length === 0) {
      return { whitespace: true };
    }
    return null;
  };
}

export function phoneValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const val = control.value;
    if (!val || typeof val !== 'string' || val.trim() === '') {
      return null;
    }
    return PHONE_REGEX.test(val.trim()) ? null : { invalidPhone: true };
  };
}

export function positiveNumberValidator(min = 0.01): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (control.value === null || control.value === undefined || control.value === '') {
      return null;
    }
    const num = Number(control.value);
    if (Number.isNaN(num) || num < min) {
      return { minPositive: { min } };
    }
    return null;
  };
}

export function expectedDateAfterCreatedValidator(
  createdKey = 'createdDate',
  expectedKey = 'expectedDeliveryDate'
): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const created = group.get(createdKey)?.value;
    const expected = group.get(expectedKey)?.value;
    if (!created || !expected) {
      return null;
    }
    if (expected < created) {
      return { expectedBeforeCreated: true };
    }
    return null;
  };
}

