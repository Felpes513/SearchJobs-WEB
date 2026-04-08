import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ParsedResumeData } from '../../models/home.models';

@Component({
  selector: 'app-extract-preview-modal',
  standalone: true,
  imports: [CommonModule],
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