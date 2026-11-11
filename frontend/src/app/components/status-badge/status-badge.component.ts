import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="ops-badge" [ngClass]="badgeClass">
      <span class="ops-dot"></span>
      {{ displayLabel }}
    </span>
  `,
  styles: [`
    .ops-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
      padding: 0.25rem 0.625rem;
      font-size: 0.75rem;
      font-weight: 600;
      border-radius: 9999px;
      letter-spacing: 0.015em;
      white-space: nowrap;
      border: 1px solid transparent;
    }
    .ops-dot {
      width: 0.42rem;
      height: 0.42rem;
      border-radius: 50%;
      background-color: currentColor;
    }
    .badge-pending { background: #fef3c7; color: #92400e; border-color: #fde68a; }
    .badge-picked-up { background: #e0e7ff; color: #3730a3; border-color: #c7d2fe; }
    .badge-in-transit { background: #dbeafe; color: #1e40af; border-color: #bfdbfe; }
    .badge-out-for-delivery { background: #ede9fe; color: #5b21b6; border-color: #ddd6fe; }
    .badge-delivered { background: #d1fae5; color: #065f46; border-color: #a7f3d0; }
    .badge-cancelled { background: #f1f5f9; color: #475569; border-color: #cbd5e1; }
    .badge-delayed { background: #fee2e2; color: #991b1b; border-color: #fecaca; }
    .badge-available { background: #d1fae5; color: #065f46; border-color: #a7f3d0; }
    .badge-on-duty { background: #dbeafe; color: #1e40af; border-color: #bfdbfe; }
    .badge-on-leave { background: #fef3c7; color: #92400e; border-color: #fde68a; }
    .badge-inactive { background: #f1f5f9; color: #64748b; border-color: #cbd5e1; }
    .badge-corporate { background: #e0f2fe; color: #075985; border-color: #bae6fd; }
    .badge-ecommerce { background: #fae8ff; color: #86198f; border-color: #f5d0fe; }
    .badge-retail { background: #ffedd5; color: #9a3412; border-color: #fed7aa; }
    .badge-individual { background: #f1f5f9; color: #334155; border-color: #e2e8f0; }
  `]
})
export class StatusBadgeComponent {
  @Input({ required: true }) status!: string;
  @Input() delayed = false;

  get displayLabel(): string {
    if (this.delayed) {
      return 'DELAYED';
    }
    return (this.status || '').replace(/_/g, ' ');
  }

  get badgeClass(): string {
    if (this.delayed) {
      return 'badge-delayed';
    }
    switch (this.status) {
      case 'PENDING': return 'badge-pending';
      case 'PICKED_UP': return 'badge-picked-up';
      case 'IN_TRANSIT': return 'badge-in-transit';
      case 'OUT_FOR_DELIVERY': return 'badge-out-for-delivery';
      case 'DELIVERED': return 'badge-delivered';
      case 'CANCELLED': return 'badge-cancelled';
      case 'AVAILABLE': return 'badge-available';
      case 'ON_DUTY': return 'badge-on-duty';
      case 'ON_LEAVE': return 'badge-on-leave';
      case 'INACTIVE': return 'badge-inactive';
      case 'CORPORATE': return 'badge-corporate';
      case 'ECOMMERCE': return 'badge-ecommerce';
      case 'RETAIL': return 'badge-retail';
      default: return 'badge-individual';
    }
  }
}

