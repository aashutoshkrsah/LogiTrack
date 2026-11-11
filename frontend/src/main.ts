import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

// Apply the persisted theme/density before first paint (avoids a light flash).
try {
  const theme = localStorage.getItem('logitrack-theme') === 'dark' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', theme);
  const settings = JSON.parse(localStorage.getItem('logitrack-settings') ?? '{}') as { density?: string };
  document.body.setAttribute('data-density', settings.density === 'compact' ? 'compact' : 'comfortable');
} catch {
  document.documentElement.setAttribute('data-theme', 'light');
}

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
