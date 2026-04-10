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

  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<AppSettingsValue>();

  onClose(): void {
    this.close.emit();
  }

  onSave(): void {
    this.save.emit({
      language: this.language,
      theme: this.theme,
      termsAccepted: this.termsAccepted,
    });
  }
}
