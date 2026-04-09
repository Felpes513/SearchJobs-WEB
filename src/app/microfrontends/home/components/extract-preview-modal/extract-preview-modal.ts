import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ParsedResumeData } from '../../models/home.models';

@Component({
  selector: 'app-extract-preview-modal',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  templateUrl: './extract-preview-modal.html',
  styleUrl: './extract-preview-modal.css',
})
export class ExtractPreviewModal {
  @Input() isOpen = false;
  @Input() data: ParsedResumeData | null = null;
  @Input() mensagem = '';

  @Output() close = new EventEmitter<void>();

  onClose(): void {
    this.close.emit();
  }
}
