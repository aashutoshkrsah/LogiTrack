import { Injectable, signal } from '@angular/core';

export type DensityName = 'comfortable' | 'compact';

export interface AppSettings {
  pageSize: number;
  density: DensityName;
}

const STORAGE_KEY = 'logitrack-settings';
const DEFAULTS: AppSettings = { pageSize: 10, density: 'comfortable' };

@Injectable({ providedIn: 'root' })
export class SettingsService {
  readonly settings = signal<AppSettings>(this.readStored());

  constructor() {
    this.apply(this.settings());
  }

  setPageSize(pageSize: number): void {
    this.update({ pageSize });
  }

  setDensity(density: DensityName): void {
    this.update({ density });
  }

  update(patch: Partial<AppSettings>): void {
    const next = { ...this.settings(), ...patch };
    this.settings.set(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* storage unavailable — settings still apply in-memory */
    }
    this.apply(next);
  }

  /** Apply settings to the DOM without changing the stored preference. */
  apply(settings: AppSettings): void {
    if (typeof document !== 'undefined') {
      document.body.setAttribute('data-density', settings.density);
    }
  }

  private readStored(): AppSettings {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { ...DEFAULTS };
      const parsed = JSON.parse(raw) as Partial<AppSettings>;
      return {
        pageSize: [5, 10, 20, 50].includes(parsed.pageSize ?? 0) ? (parsed.pageSize as number) : DEFAULTS.pageSize,
        density: parsed.density === 'compact' ? 'compact' : 'comfortable'
      };
    } catch {
      return { ...DEFAULTS };
    }
  }
}
