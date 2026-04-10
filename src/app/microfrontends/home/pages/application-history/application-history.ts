import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { JobApplicationHistoryItem, JobMatchItem } from '../../models/home.models';
import { ResumeService } from '../../services/home.service';

type JobPlatform = {
  key: string;
  label: string;
  logoText: string;
};

@Component({
  selector: 'app-application-history',
  imports: [CommonModule, MatButtonModule, MatIconModule],
  templateUrl: './application-history.html',
  styleUrl: './application-history.css',
})
export class ApplicationHistory implements OnInit {
  private resumeService = inject(ResumeService);
  private cdr = inject(ChangeDetectorRef);

  carregando = true;
  mensagemErro = '';
  candidaturasMock: JobApplicationHistoryItem[] = [];
  matches: JobMatchItem[] = [];

  ngOnInit(): void {
    this.carregarHistorico();
  }

  carregarHistorico(): void {
    this.carregando = true;
    this.mensagemErro = '';
    this.candidaturasMock = this.resumeService.listarHistoricoCandidaturasMock();

    this.resumeService.listarMatchesSalvos().subscribe({
      next: (matches) => {
        this.matches = [...matches].sort((a, b) => b.score - a.score);
        this.carregando = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.matches = [];
        this.carregando = false;
        this.mensagemErro =
          error?.error?.mensagem ||
          error?.error?.message ||
          'Não foi possível carregar o histórico agora.';
        this.cdr.detectChanges();
      },
    });
  }

  abrirLink(url: string): void {
    if (!url) {
      return;
    }

    window.open(url, '_blank', 'noopener,noreferrer');
  }

  getPlatform(url: string): JobPlatform | null {
    const normalized = (url || '').toLowerCase();

    if (normalized.includes('linkedin.com')) {
      return { key: 'linkedin', label: 'LinkedIn', logoText: 'in' };
    }

    if (normalized.includes('indeed.com')) {
      return { key: 'indeed', label: 'Indeed', logoText: 'i' };
    }

    if (normalized.includes('catho.com')) {
      return { key: 'catho', label: 'Catho', logoText: 'C' };
    }

    if (normalized.includes('gupy.io') || normalized.includes('gupy.com')) {
      return { key: 'gupy', label: 'Gupy', logoText: 'G' };
    }

    if (normalized.includes('glassdoor.com')) {
      return { key: 'glassdoor', label: 'Glassdoor', logoText: 'G' };
    }

    if (normalized.includes('infojobs.com')) {
      return { key: 'infojobs', label: 'InfoJobs', logoText: 'iJ' };
    }

    return null;
  }

  getScoreClass(score: number): string {
    if (score >= 80) return 'strong';
    if (score >= 60) return 'medium';
    if (score >= 40) return 'light';
    return 'weak';
  }
}
