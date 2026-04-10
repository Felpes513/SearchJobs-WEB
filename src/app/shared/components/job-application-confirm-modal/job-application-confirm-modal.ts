import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { JobItem } from '../../../microfrontends/home/models/home.models';

@Component({
  selector: 'app-job-application-confirm-modal',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  templateUrl: './job-application-confirm-modal.html',
  styleUrl: './job-application-confirm-modal.css',
})
export class JobApplicationConfirmModal {
  @Input() isOpen = false;
  @Input() vaga: JobItem | null = null;
  @Input() salvando = false;

  @Output() close = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<void>();
  @Output() decline = new EventEmitter<void>();

  onClose(): void {
    this.close.emit();
  }

  onConfirm(): void {
    this.confirm.emit();
  }

  onDecline(): void {
    this.decline.emit();
  }
}
