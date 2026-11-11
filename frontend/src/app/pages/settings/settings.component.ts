import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { SettingsService } from '../../services/settings.service';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="mb-4">
      <h1 class="page-title">Settings</h1>
      <p class="page-subtitle">Appearance, list defaults and environment details</p>
    </div>

    <div class="row g-3">
      <div class="col-12 col-lg-6">
        <div class="ops-card">
          <div class="ops-card-header"><h6 class="mb-0 fw-bold">Appearance</h6></div>
          <div class="ops-card-body d-flex flex-column gap-3">
            <div>
              <label class="form-label" for="themeSelect">Theme</label>
              <select id="themeSelect" class="form-select" [ngModel]="themeService.theme()" (ngModelChange)="themeService.setTheme($event)">
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
              <div class="form-text">Saved in your browser (logitrack-theme) and applied before first paint.</div>
            </div>
            <div>
              <label class="form-label" for="densitySelect">Table density</label>
              <select id="densitySelect" class="form-select" [ngModel]="settingsService.settings().density" (ngModelChange)="settingsService.setDensity($event)">
                <option value="comfortable">Comfortable</option>
                <option value="compact">Compact</option>
              </select>
            </div>
            <div>
              <label class="form-label" for="pageSizeSelect">Default page size</label>
              <select id="pageSizeSelect" class="form-select" [ngModel]="settingsService.settings().pageSize" (ngModelChange)="settingsService.setPageSize(+$event)">
                <option [value]="5">5 rows</option>
                <option [value]="10">10 rows</option>
                <option [value]="20">20 rows</option>
                <option [value]="50">50 rows</option>
              </select>
              <div class="form-text">Applies to shipments, customers, drivers and hubs lists.</div>
            </div>
            <button type="button" class="btn btn-outline-secondary btn-sm align-self-start" (click)="resetPreferences()">
              Reset preferences to defaults
            </button>
          </div>
        </div>
      </div>

      <div class="col-12 col-lg-6">
        <div class="ops-card mb-3">
          <div class="ops-card-header"><h6 class="mb-0 fw-bold">Environment</h6></div>
          <div class="ops-card-body small d-flex flex-column gap-2">
            <div class="d-flex justify-content-between"><span class="text-muted">API base URL</span><code>{{ apiBaseUrl }}</code></div>
            <div class="d-flex justify-content-between"><span class="text-muted">Production build</span><strong>{{ isProduction ? 'Yes' : 'No (development)' }}</strong></div>
            <div class="d-flex justify-content-between"><span class="text-muted">Signed in as</span><strong>{{ auth.currentUser()?.name ?? '—' }} ({{ auth.currentUser()?.role ?? '—' }})</strong></div>
            <div class="d-flex justify-content-between"><span class="text-muted">App version</span><strong>LogiTrack 1.0.0</strong></div>
            <div class="d-flex justify-content-between"><span class="text-muted">Stack</span><strong>Angular 19 · Bootstrap 5.3.3 · Spring Boot API</strong></div>
          </div>
        </div>

        <div class="ops-card mb-3">
          <div class="ops-card-header"><h6 class="mb-0 fw-bold">Demo accounts</h6></div>
          <div class="ops-card-body small">
            <p class="mb-1"><strong>Admin:</strong> <code>admin&#64;logitrack.in</code> / <code>Admin&#64;123</code></p>
            <p class="mb-0"><strong>Dispatcher:</strong> <code>dispatcher&#64;logitrack.in</code> / <code>Dispatch&#64;123</code></p>
          </div>
        </div>

        <div class="ops-card">
          <div class="ops-card-header"><h6 class="mb-0 fw-bold">Demo data</h6></div>
          <div class="ops-card-body small text-muted">
            <p class="mb-0">
              When the Spring Boot API is unreachable, the dashboard and analytics show clearly labelled
              demo data. To reset demo data, restart the backend — there is no destructive reset action
              in this UI, and nothing here deletes live records.
            </p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class SettingsComponent {
  readonly themeService = inject(ThemeService);
  readonly settingsService = inject(SettingsService);
  readonly auth = inject(AuthService);
  private readonly notification = inject(NotificationService);

  readonly apiBaseUrl = environment.apiBaseUrl;
  readonly isProduction = environment.production;

  resetPreferences(): void {
    this.themeService.setTheme('light');
    this.settingsService.update({ pageSize: 10, density: 'comfortable' });
    this.notification.success('Preferences reset to defaults.');
  }
}
