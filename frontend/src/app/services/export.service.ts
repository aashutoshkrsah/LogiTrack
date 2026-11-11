import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ExportService {
  /** Trigger a browser download of an in-memory Blob (e.g. a CSV from the API). */
  downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  /** Build a CSV Blob from header + rows and download it (client-side fallback). */
  downloadCsv(filename: string, headers: string[], rows: (string | number | null | undefined)[][]): void {
    const esc = (v: string | number | null | undefined): string => {
      const s = v === null || v === undefined ? '' : String(v);
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const lines = [headers.map(esc).join(','), ...rows.map((r) => r.map(esc).join(','))];
    this.downloadBlob(new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' }), filename);
  }
}
