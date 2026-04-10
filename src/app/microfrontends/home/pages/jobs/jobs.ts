import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { finalize } from 'rxjs/operators';
import { JobApplicationConfirmModal } from '../../../../shared/components/job-application-confirm-modal/job-application-confirm-modal';
import { JobItem } from '../../models/home.models';
import { ResumeService } from '../../services/home.service';

type JobPlatform = {
  key: string;
  label: string;
  logoText: string;
};

@Component({
  selector: 'app-jobs',
  imports: [CommonModule, MatButtonModule, MatIconModule, JobApplicationConfirmModal],
  templateUrl: './jobs.html',
  styleUrl: './jobs.css',
})
export class Jobs implements OnInit {
  private resumeService = inject(ResumeService);
  private cdr = inject(ChangeDetectorRef);

  vagas: JobItem[] = [];
  carregando = true;
  analisandoMatches = false;
  salvandoCandidatura = false;
  mensagemErro = '';
  mensagemSucesso = '';
  modalCandidaturaAberto = false;
  vagaSelecionada: JobItem | null = null;

  ngOnInit(): void {
    this.carregarVagas();
  }

  carregarVagas(): void {
    this.carregando = true;
    this.mensagemErro = '';

    this.resumeService.buscarVagas().subscribe({
      next: (response) => {
        this.vagas = response.vagas;
        this.carregando = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.vagas = [];
        this.carregando = false;
        this.mensagemErro =
          error?.error?.mensagem ||
          error?.error?.message ||
          'Não foi possível carregar as vagas agora.';
        this.cdr.detectChanges();
      },
    });
  }

  buscarVagasComIA(): void {
    if (this.analisandoMatches) {
      return;
    }

    this.analisandoMatches = true;
    this.mensagemErro = '';
    this.mensagemSucesso = '';

    this.resumeService.analisarCompatibilidadeVagas().pipe(
      finalize(() => {
        this.analisandoMatches = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (matches) => {
        this.mensagemSucesso = matches.length > 0
          ? 'Compatibilidade analisada com sucesso. Confira os matches no histórico.'
          : 'A análise foi executada, mas nenhum match foi gerado.';
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.mensagemErro =
          error?.error?.mensagem ||
          error?.error?.message ||
          'Não foi possível analisar a compatibilidade das vagas agora.';
        this.cdr.detectChanges();
      },
    });
  }

  abrirVaga(vaga: JobItem): void {
    if (!vaga.jobUrl) {
      return;
    }

    window.open(vaga.jobUrl, '_blank', 'noopener,noreferrer');
    this.vagaSelecionada = vaga;
    this.modalCandidaturaAberto = true;
    this.mensagemSucesso = '';
    this.cdr.detectChanges();
  }

  fecharModalCandidatura(): void {
    if (this.salvandoCandidatura) {
      return;
    }

    this.modalCandidaturaAberto = false;
    this.vagaSelecionada = null;
    this.cdr.detectChanges();
  }

  informarQueNaoSeCandidatou(): void {
    this.modalCandidaturaAberto = false;
    this.vagaSelecionada = null;
    this.mensagemSucesso = '';
    this.cdr.detectChanges();
  }

  confirmarCandidatura(): void {
    if (!this.vagaSelecionada || this.salvandoCandidatura) {
      return;
    }

    this.salvandoCandidatura = true;
    this.mensagemErro = '';

    this.resumeService.registrarCandidaturaMock(this.vagaSelecionada).subscribe({
      next: () => {
        const titulo = this.vagaSelecionada?.titulo ?? 'a vaga';
        this.salvandoCandidatura = false;
        this.modalCandidaturaAberto = false;
        this.vagaSelecionada = null;
        this.mensagemSucesso = `Candidatura para "${titulo}" salva no histórico mockado.`;
        this.cdr.detectChanges();
      },
      error: () => {
        this.salvandoCandidatura = false;
        this.mensagemErro = 'Não foi possível registrar a candidatura no histórico.';
        this.cdr.detectChanges();
      },
    });
  }

  formatarData(data: string): string {
    if (!data) {
      return 'Data não informada';
    }

    const parsed = new Date(`${data}T00:00:00`);
    if (Number.isNaN(parsed.getTime())) {
      return data;
    }

    return parsed.toLocaleDateString('pt-BR');
  }

  resumirDescricao(descricao: string): string {
    if (!descricao) {
      return 'Descrição não informada.';
    }

    return descricao.length > 220 ? `${descricao.slice(0, 220)}...` : descricao;
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
}
