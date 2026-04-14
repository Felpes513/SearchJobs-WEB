import { Injectable } from '@angular/core';
import { AppThemePreference } from '../../shared/components/settings-modal/settings-modal';

const STORAGE_KEY = 'appThemePreference';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  private currentPreference: AppThemePreference = 'system';

  init(): void {
    const stored = localStorage.getItem(STORAGE_KEY) as AppThemePreference | null;
    this.apply(stored ?? 'system');

    this.mediaQuery.addEventListener('change', () => {
      if (this.currentPreference === 'system') {
        this.applyToDOM(this.mediaQuery.matches ? 'dark' : 'light');
      }
    });
  }

  apply(preference: AppThemePreference): void {
    this.currentPreference = preference;
    localStorage.setItem(STORAGE_KEY, preference);

    if (preference === 'system') {
      this.applyToDOM(this.mediaQuery.matches ? 'dark' : 'light');
    } else {
      this.applyToDOM(preference);
    }
  }

  private applyToDOM(theme: 'light' | 'dark'): void {
    document.documentElement.setAttribute('data-app-theme', theme);
  }
}
