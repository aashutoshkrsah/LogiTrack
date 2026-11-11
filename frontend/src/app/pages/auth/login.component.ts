import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="login-page">
      <section class="brand-panel">
        <div class="brand-inner">
          <div class="brand-mark"><i class="bi bi-box-seam-fill"></i> LogiTrack</div>
          <h1>Delivering Possibilities<br />Every Day</h1>
          <p>Real-time shipment tracking, fleet operations and hub management — one control tower for your whole network.</p>
          <ul class="brand-points">
            <li><i class="bi bi-check-circle-fill"></i> Live tracking timelines for every consignment</li>
            <li><i class="bi bi-check-circle-fill"></i> Delayed-shipment alerts and one-click workflows</li>
            <li><i class="bi bi-check-circle-fill"></i> Analytics across hubs, drivers and delivery times</li>
          </ul>
          <a routerLink="/track" class="btn btn-outline-light btn-sm mt-3">
            <i class="bi bi-upc-scan me-1"></i>Track a shipment without signing in
          </a>
        </div>
      </section>

      <section class="form-panel">
        <form class="login-card" #f="ngForm" (ngSubmit)="onSubmit(f)" novalidate>
          <h2 class="fw-bold mb-1">Sign in to Operations</h2>
          <p class="text-muted small mb-4">Use your LogiTrack staff account to access the dashboard.</p>

          @if (errorMessage) {
            <div class="alert alert-danger py-2 small" role="alert">
              <i class="bi bi-exclamation-octagon-fill me-1"></i>{{ errorMessage }}
            </div>
          }

          <label class="form-label" for="email">Work email</label>
          <input
            id="email" name="email" type="email" class="form-control mb-1" placeholder="you&#64;logitrack.in"
            [(ngModel)]="email" required email #emailCtrl="ngModel" autocomplete="username" />
          @if (emailCtrl.invalid && (emailCtrl.touched || f.submitted)) {
            <div class="text-danger small mb-2">Enter a valid email address.</div>
          }

          <label class="form-label mt-2" for="password">Password</label>
          <input
            id="password" name="password" type="password" class="form-control mb-1" placeholder="••••••••"
            [(ngModel)]="password" required minlength="6" #pwCtrl="ngModel" autocomplete="current-password" />
          @if (pwCtrl.invalid && (pwCtrl.touched || f.submitted)) {
            <div class="text-danger small mb-2">Password must be at least 6 characters.</div>
          }

          <button type="submit" class="btn btn-primary w-100 mt-3" [disabled]="loading || f.invalid">
            @if (loading) { <span class="spinner-border spinner-border-sm me-1"></span> Signing in… }
            @else { <i class="bi bi-box-arrow-in-right me-1"></i>Sign in }
          </button>

          <div class="divider"><span>Demo accounts</span></div>
          <div class="row g-2">
            <div class="col-6">
              <button type="button" class="btn btn-outline-secondary btn-sm w-100" (click)="quickFill('admin')">
                <i class="bi bi-shield-lock me-1"></i>Admin
              </button>
            </div>
            <div class="col-6">
              <button type="button" class="btn btn-outline-secondary btn-sm w-100" (click)="quickFill('dispatcher')">
                <i class="bi bi-truck me-1"></i>Dispatcher
              </button>
            </div>
          </div>
          <p class="text-muted small text-center mt-3 mb-0">
            Admin: admin&#64;logitrack.in / Admin&#64;123 &nbsp;·&nbsp; Dispatcher: dispatcher&#64;logitrack.in / Dispatch&#64;123
          </p>
        </form>
      </section>
    </div>
  `,
  styles: [`
    .login-page { display: flex; min-height: 100vh; background: var(--lt-bg-canvas); }
    .brand-panel {
      flex: 1 1 55%; display: flex; align-items: center; justify-content: center;
      background: linear-gradient(135deg, #0b2246 0%, #1d4ed8 100%); color: #fff; padding: 3rem;
    }
    .brand-inner { max-width: 480px; }
    .brand-mark { font-size: 1.5rem; font-weight: 700; margin-bottom: 1.5rem; }
    .brand-inner h1 { font-size: clamp(1.8rem, 3vw, 2.6rem); font-weight: 700; line-height: 1.15; letter-spacing: -0.02em; }
    .brand-inner p { color: #dbeafe; margin: 1rem 0; }
    .brand-points { list-style: none; padding: 0; display: grid; gap: 0.6rem; color: #e2e8f0; font-size: 0.92rem; }
    .brand-points i { color: #86efac; margin-right: 0.4rem; }
    .form-panel { flex: 1 1 45%; display: flex; align-items: center; justify-content: center; padding: 2rem; }
    .login-card { width: 100%; max-width: 400px; background: var(--lt-bg-surface); border: 1px solid var(--lt-border-color); border-radius: 1rem; padding: 2rem; box-shadow: var(--lt-shadow-md); }
    .divider { display: flex; align-items: center; gap: 0.75rem; color: var(--lt-text-muted); font-size: 0.78rem; margin: 1.25rem 0 0.75rem; }
    .divider::before, .divider::after { content: ''; flex: 1; height: 1px; background: var(--lt-border-color); }
    @media (max-width: 767.98px) {
      .login-page { flex-direction: column; }
      .brand-panel { padding: 2rem 1.5rem; }
      .brand-points { display: none; }
    }
  `]
})
export class LoginComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  email = '';
  password = '';
  loading = false;
  errorMessage: string | null = null;

  quickFill(role: 'admin' | 'dispatcher'): void {
    if (role === 'admin') {
      this.email = 'admin@logitrack.in';
      this.password = 'Admin@123';
    } else {
      this.email = 'dispatcher@logitrack.in';
      this.password = 'Dispatch@123';
    }
    this.errorMessage = null;
  }

  onSubmit(form: NgForm): void {
    if (form.invalid) return;
    this.loading = true;
    this.errorMessage = null;
    this.auth.login(this.email.trim(), this.password).subscribe({
      next: () => {
        this.loading = false;
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/dashboard';
        void this.router.navigateByUrl(returnUrl);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err?.message || 'Sign-in failed. Check your email and password.';
      }
    });
  }
}
