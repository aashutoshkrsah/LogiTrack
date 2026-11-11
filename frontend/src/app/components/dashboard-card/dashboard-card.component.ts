import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

export type CardVariant = 'primary' | 'amber' | 'indigo' | 'blue' | 'violet' | 'emerald' | 'danger' | 'slate';

@Component({
  selector: 'app-dashboard-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div
      class="kpi-card h-100"
      [class.clickable]="!!link"
      [ngClass]="'kpi-' + variant"
      [routerLink]="link ?? null"
      [queryParams]="queryParams ?? null">
      <div class="d-flex justify-content-between align-items-start gap-2">
        <div>
          <div class="kpi-label">{{ label }}</div>
          <div class="kpi-value tabular-nums">{{ value }}</div>
          @if (subtitle) {
            <div class="kpi-subtitle">{{ subtitle }}</div>
          }
        </div>
        <div class="kpi-icon">
          <i class="bi" [ngClass]="icon"></i>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .kpi-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 0.875rem;
      padding: 1.1rem 1.2rem;
      box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
      transition: transform 0.15s ease, box-shadow 0.15s ease;
    }
    .kpi-card.clickable {
      cursor: pointer;
    }
    .kpi-card.clickable:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(15, 23, 42, 0.08);
    }
    .kpi-label {
      font-size: 0.76rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.045em;
      color: #64748b;
    }
    .kpi-value {
      font-size: 1.75rem;
      font-weight: 700;
      line-height: 1.2;
      margin-top: 0.35rem;
      color: #0f172a;
    }
    .kpi-subtitle {
      font-size: 0.78rem;
      color: #64748b;
      margin-top: 0.25rem;
    }
    .kpi-icon {
      width: 42px;
      height: 42px;
      border-radius: 0.65rem;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2rem;
      flex-shrink: 0;
    }
    .kpi-primary .kpi-icon { background: #eff6ff; color: #1d4ed8; }
    .kpi-amber .kpi-icon { background: #fef3c7; color: #b45309; }
    .kpi-indigo .kpi-icon { background: #e0e7ff; color: #4338ca; }
    .kpi-blue .kpi-icon { background: #dbeafe; color: #1d4ed8; }
    .kpi-violet .kpi-icon { background: #ede9fe; color: #6d28d9; }
    .kpi-emerald .kpi-icon { background: #d1fae5; color: #047857; }
    .kpi-danger { border-color: #fecaca; background: #fffafb; }
    .kpi-danger .kpi-icon { background: #fee2e2; color: #dc2626; }
    .kpi-danger .kpi-value { color: #b91c1c; }
    .kpi-slate .kpi-icon { background: #f1f5f9; color: #475569; }
  `]
})
export class DashboardCardComponent {
  @Input({ required: true }) label!: string;
  @Input({ required: true }) value!: number | string;
  @Input() icon = 'bi-box-seam';
  @Input() variant: CardVariant = 'primary';
  @Input() subtitle?: string;
  @Input() link?: string | unknown[];
  @Input() queryParams?: Record<string, string>;
}

