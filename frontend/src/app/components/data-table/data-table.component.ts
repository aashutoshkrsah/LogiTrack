import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { EmptyStateComponent } from '../empty-state/empty-state.component';
import { LoadingSpinnerComponent } from '../loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent, EmptyStateComponent],
  template: `
    <div class="ops-card overflow-hidden">
      @if (title) {
        <div class="ops-card-header">
          <div>
            <h6 class="mb-0 fw-bold text-dark">{{ title }}</h6>
            @if (subtitle) {
              <div class="small text-muted">{{ subtitle }}</div>
            }
          </div>
          <ng-content select="[table-actions]"></ng-content>
        </div>
      }

      @if (errorMessage) {
        <div class="alert alert-danger m-3 d-flex align-items-center justify-content-between gap-2 mb-3">
          <div><i class="bi bi-exclamation-octagon-fill me-2"></i>{{ errorMessage }}</div>
          <button type="button" class="btn btn-outline-danger btn-sm" (click)="retry.emit()">Retry</button>
        </div>
      }

      @if (loading) {
        <app-loading-spinner [message]="loadingMessage"></app-loading-spinner>
      } @else if (empty) {
        <app-empty-state
          [icon]="emptyIcon"
          [title]="emptyTitle"
          [description]="emptyDescription"
          [actionLabel]="emptyActionLabel"
          [actionLink]="emptyActionLink">
        </app-empty-state>
      } @else {
        <div class="table-responsive">
          <table class="table ops-table">
            <ng-content></ng-content>
          </table>
        </div>
      }
    </div>
  `
})
export class DataTableComponent {
  @Input() title?: string;
  @Input() subtitle?: string;
  @Input() loading = false;
  @Input() loadingMessage = 'Loading records...';
  @Input() empty = false;
  @Input() emptyIcon = 'bi-inbox';
  @Input() emptyTitle = 'No records found';
  @Input() emptyDescription = 'No matching entries were found.';
  @Input() emptyActionLabel?: string;
  @Input() emptyActionLink?: string | unknown[];
  @Input() errorMessage: string | null = null;
  @Output() retry = new EventEmitter<void>();
}

