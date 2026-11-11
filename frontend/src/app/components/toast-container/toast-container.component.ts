import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-stack">
      @for (toast of notificationService.toasts(); track toast.id) {
        <div class="ops-toast shadow-lg" [ngClass]="'toast-' + toast.type" role="alert">
          <div class="d-flex align-items-start gap-2">
            <i class="bi fs-5" [ngClass]="iconFor(toast.type)"></i>
            <div class="flex-grow-1">
              <div class="fw-semibold small">{{ toast.title }}</div>
              <div class="small opacity-90">{{ toast.message }}</div>
            </div>
            <button type="button" class="btn-close btn-close-sm ms-2" (click)="notificationService.dismiss(toast.id)" aria-label="Close"></button>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-stack {
      position: fixed;
      top: 1.25rem;
      right: 1.25rem;
      z-index: 1090;
      display: flex;
      flex-direction: column;
      gap: 0.65rem;
      max-width: 390px;
      width: calc(100vw - 2rem);
      pointer-events: none;
    }
    .ops-toast {
      pointer-events: auto;
      background: #ffffff;
      border-radius: 0.65rem;
      padding: 0.85rem 1rem;
      border-left: 4px solid #2563eb;
      border-top: 1px solid #e2e8f0;
      border-right: 1px solid #e2e8f0;
      border-bottom: 1px solid #e2e8f0;
    }
    .toast-success { border-left-color: #10b981; }
    .toast-success i { color: #10b981; }
    .toast-danger { border-left-color: #ef4444; }
    .toast-danger i { color: #ef4444; }
    .toast-warning { border-left-color: #f59e0b; }
    .toast-warning i { color: #f59e0b; }
    .toast-info { border-left-color: #3b82f6; }
    .toast-info i { color: #3b82f6; }
  `]
})
export class ToastContainerComponent {
  readonly notificationService = inject(NotificationService);

  iconFor(type: string): string {
    switch (type) {
      case 'success': return 'bi-check-circle-fill';
      case 'danger': return 'bi-x-circle-fill';
      case 'warning': return 'bi-exclamation-triangle-fill';
      default: return 'bi-info-circle-fill';
    }
  }
}

