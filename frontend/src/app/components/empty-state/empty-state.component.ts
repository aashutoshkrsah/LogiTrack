import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="text-center py-5 px-3">
      <div class="empty-icon mx-auto mb-3">
        <i class="bi" [ngClass]="icon"></i>
      </div>
      <h6 class="fw-semibold text-dark mb-1">{{ title }}</h6>
      <p class="text-muted small mb-3 mx-auto" style="max-width: 420px;">{{ description }}</p>
      @if (actionLabel && actionLink) {
        <a [routerLink]="actionLink" class="btn btn-primary btn-sm">
          <i class="bi bi-plus-lg me-1"></i>{{ actionLabel }}
        </a>
      } @else if (actionLabel) {
        <button type="button" class="btn btn-primary btn-sm" (click)="actionClicked.emit()">
          {{ actionLabel }}
        </button>
      }
    </div>
  `,
  styles: [`
    .empty-icon {
      width: 52px;
      height: 52px;
      border-radius: 50%;
      background-color: #f1f5f9;
      color: #64748b;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.4rem;
    }
  `]
})
export class EmptyStateComponent {
  @Input() icon = 'bi-inbox';
  @Input() title = 'No records found';
  @Input() description = 'Try adjusting your search criteria or add a new record.';
  @Input() actionLabel?: string;
  @Input() actionLink?: string | unknown[];
  @Output() actionClicked = new EventEmitter<void>();
}

