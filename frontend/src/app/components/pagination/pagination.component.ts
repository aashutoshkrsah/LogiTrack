import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="d-flex flex-wrap align-items-center justify-content-between gap-2 mt-3">
      <div class="small text-muted">
        Showing
        <strong class="text-dark">{{ totalElements === 0 ? 0 : page * pageSize + 1 }}–{{ endIndex }}</strong>
        of <strong class="text-dark">{{ totalElements }}</strong> record(s)
      </div>
      <div class="d-flex align-items-center gap-2">
        <label class="small text-muted mb-0" for="pageSizeSelect">Per page</label>
        <select
          id="pageSizeSelect"
          class="form-select form-select-sm"
          style="width: auto;"
          [ngModel]="pageSize"
          (ngModelChange)="onPageSizeChange($event)">
          @for (s of pageSizeOptions; track s) {
            <option [value]="s">{{ s }}</option>
          }
        </select>
        <nav aria-label="Pagination">
          <ul class="pagination pagination-sm mb-0">
            <li class="page-item" [class.disabled]="page <= 0">
              <button type="button" class="page-link" [disabled]="page <= 0" (click)="goTo(page - 1)" aria-label="Previous page">&laquo;</button>
            </li>
            @for (p of visiblePages; track p) {
              <li class="page-item" [class.active]="p === page">
                <button type="button" class="page-link" (click)="goTo(p)">{{ p + 1 }}</button>
              </li>
            }
            <li class="page-item" [class.disabled]="page >= totalPages - 1">
              <button type="button" class="page-link" [disabled]="page >= totalPages - 1" (click)="goTo(page + 1)" aria-label="Next page">&raquo;</button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  `
})
export class PaginationComponent {
  /** 0-based current page. */
  @Input() page = 0;
  @Input() totalPages = 0;
  @Input() totalElements = 0;
  @Input() pageSize = 10;
  @Input() pageSizeOptions: number[] = [5, 10, 20, 50];

  @Output() pageChange = new EventEmitter<number>();
  @Output() pageSizeChange = new EventEmitter<number>();

  get endIndex(): number {
    return Math.min((this.page + 1) * this.pageSize, this.totalElements);
  }

  /** Up to 5 page buttons centred on the current page. */
  get visiblePages(): number[] {
    const total = Math.max(0, this.totalPages);
    if (total === 0) return [];
    let start = Math.max(0, Math.min(this.page - 2, total - 5));
    const end = Math.min(total, start + 5);
    const pages: number[] = [];
    for (let i = start; i < end; i++) pages.push(i);
    return pages;
  }

  goTo(p: number): void {
    if (p < 0 || p >= this.totalPages || p === this.page) return;
    this.pageChange.emit(p);
  }

  onPageSizeChange(size: number | string): void {
    const n = Number(size);
    if (n !== this.pageSize && n > 0) this.pageSizeChange.emit(n);
  }
}
