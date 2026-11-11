import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (visible) {
      <div class="modal-backdrop fade show"></div>
      <div class="modal d-block fade show" tabindex="-1" role="dialog" aria-modal="true">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content border-0 shadow-lg rounded-3">
            <div class="modal-header border-bottom px-4 py-3">
              <h5 class="modal-title fw-bold fs-6 d-flex align-items-center gap-2">
                <i class="bi" [ngClass]="confirmVariant === 'danger' ? 'bi-exclamation-triangle-fill text-danger' : 'bi-question-circle-fill text-primary'"></i>
                {{ title }}
              </h5>
              <button type="button" class="btn-close" [disabled]="loading" (click)="cancelled.emit()" aria-label="Close"></button>
            </div>
            <div class="modal-body px-4 py-3 text-secondary">
              {{ message }}
            </div>
            <div class="modal-footer border-top px-4 py-3 bg-light rounded-bottom-3">
              <button type="button" class="btn btn-outline-secondary btn-sm" [disabled]="loading" (click)="cancelled.emit()">
                Cancel
              </button>
              <button
                type="button"
                class="btn btn-sm"
                [ngClass]="'btn-' + confirmVariant"
                [disabled]="loading"
                (click)="confirmed.emit()">
                @if (loading) {
                  <span class="spinner-border spinner-border-sm me-1"></span>
                }
                {{ confirmLabel }}
              </button>
            </div>
          </div>
        </div>
      </div>
    }
  `
})
export class ConfirmDialogComponent {
  @Input() visible = false;
  @Input() title = 'Confirm Action';
  @Input() message = 'Are you sure you want to proceed?';
  @Input() confirmLabel = 'Confirm';
  @Input() confirmVariant: 'danger' | 'primary' | 'warning' = 'danger';
  @Input() loading = false;
  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();
}

