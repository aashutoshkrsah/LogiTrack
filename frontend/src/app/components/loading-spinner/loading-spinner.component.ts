import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  template: `
    <div class="d-flex flex-column align-items-center justify-content-center py-5 text-muted">
      <div class="spinner-border text-primary mb-2" role="status" aria-hidden="true"></div>
      <div class="small fw-medium">{{ message }}</div>
    </div>
  `
})
export class LoadingSpinnerComponent {
  @Input() message = 'Loading operational data...';
}

