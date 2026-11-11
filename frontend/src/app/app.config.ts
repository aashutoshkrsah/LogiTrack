import { APP_INITIALIZER, ApplicationConfig, inject, provideZoneChangeDetection } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { httpErrorInterceptor } from './core/interceptors/http-error.interceptor';
import { SettingsService } from './services/settings.service';
import { ThemeService } from './services/theme.service';

function initThemeAndSettings(): () => void {
  const theme = inject(ThemeService);
  const settings = inject(SettingsService);
  return () => {
    theme.apply(theme.theme());
    settings.apply(settings.settings());
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor, httpErrorInterceptor])),
    { provide: APP_INITIALIZER, useFactory: initThemeAndSettings, multi: true }
  ]
};
