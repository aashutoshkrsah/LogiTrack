import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'danger' | 'warning' | 'info';

export interface ToastMessage {
  id: number;
  type: ToastType;
  title: string;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private nextId = 1;
  readonly toasts = signal<ToastMessage[]>([]);

  success(message: string, title = 'Success'): void {
    this.push('success', title, message);
  }

  error(message: string, title = 'Operation Failed'): void {
    this.push('danger', title, message, 6000);
  }

  warning(message: string, title = 'Warning'): void {
    this.push('warning', title, message);
  }

  info(message: string, title = 'Notice'): void {
    this.push('info', title, message);
  }

  dismiss(id: number): void {
    this.toasts.update((items) => items.filter((item) => item.id !== id));
  }

  private push(type: ToastType, title: string, message: string, durationMs = 4500): void {
    const id = this.nextId++;
    this.toasts.update((items) => [...items, { id, type, title, message }]);
    setTimeout(() => this.dismiss(id), durationMs);
  }
}

