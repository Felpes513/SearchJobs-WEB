import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export type AppThemePreference = 'system' | 'light' | 'dark';

export interface AppSettingsValue {
  language: string;
  theme: AppThemePreference;
  termsAccepted: boolean;
  openAiApiKey: string;
  jsearchApiKey: string;
}

export interface AppSettingsResponse {
  language?: string | null;
  theme?: AppThemePreference | null;
  termsAccepted: boolean;
  openAiApiKeyMasked?: string | null;
  jsearchApiKeyMasked?: string | null;
  hasOpenAiApiKey: boolean;
  hasJsearchApiKey: boolean;
  updatedAt?: string | null;
}

@Component({
  selector: 'app-settings-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, MatButtonModule, MatIconModule],
  templateUrl: './settings-modal.html',
  styleUrl: './settings-modal.css',
})
export class SettingsModal {
  @Input() isOpen = false;
  @Input() language = 'pt-BR';
  @Input() theme: AppThemePreference = 'system';
  @Input() termsAccepted = false;
  @Input() openAiApiKey = '';
  @Input() jsearchApiKey = '';

  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<AppSettingsValue>();

  hideOpenAiApiKey = true;
  hideJsearchApiKey = true;

  onClose(): void {
    this.close.emit();
  }

  onSave(): void {
    this.save.emit({
      language: this.language,
      theme: this.theme,
      termsAccepted: this.termsAccepted,
      openAiApiKey: this.openAiApiKey.trim(),
      jsearchApiKey: this.jsearchApiKey.trim(),
    });
  }

  toggleOpenAiVisibility(): void {
    this.hideOpenAiApiKey = !this.hideOpenAiApiKey;
  }

  toggleJsearchVisibility(): void {
    this.hideJsearchApiKey = !this.hideJsearchApiKey;
  }
}
