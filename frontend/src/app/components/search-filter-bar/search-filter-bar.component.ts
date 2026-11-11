import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search-filter-bar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="ops-card mb-3">
      <div class="ops-card-body py-3">
        <div class="row g-2 align-items-end">
          <div class="col-12 col-md-4 col-lg-4">
            <label class="form-label small text-muted mb-1">{{ searchLabel }}</label>
            <div class="input-group input-group-sm">
              <span class="input-group-text bg-white border-end-0 text-muted">
                <i class="bi bi-search"></i>
              </span>
              <input
                type="text"
                class="form-control border-start-0 ps-0"
                [placeholder]="placeholder"
                [(ngModel)]="searchTerm"
                (keyup.enter)="searchSubmit.emit(searchTerm)" />
            </div>
          </div>

          <ng-content></ng-content>

          <div class="col-12 col-md-auto ms-md-auto d-flex gap-2">
            <button type="button" class="btn btn-primary btn-sm px-3" (click)="searchSubmit.emit(searchTerm)">
              <i class="bi bi-funnel me-1"></i>Apply
            </button>
            <button type="button" class="btn btn-outline-secondary btn-sm" (click)="onReset()">
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class SearchFilterBarComponent {
  @Input() searchLabel = 'Search';
  @Input() placeholder = 'Type to search...';
  @Input() searchTerm = '';
  @Output() searchTermChange = new EventEmitter<string>();
  @Output() searchSubmit = new EventEmitter<string>();
  @Output() resetFilters = new EventEmitter<void>();

  onReset(): void {
    this.searchTerm = '';
    this.searchTermChange.emit('');
    this.resetFilters.emit();
  }
}

