import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { finalize } from 'rxjs/operators';
import { JobApplicationConfirmModal } from '../../../../shared/components/job-application-confirm-modal/job-application-confirm-modal';
import { JobItem, JobMatchItem } from '../../models/home.models';
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
export class Jobs implements OnInit, OnDestroy {
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
  hourglassIcon: 'hourglass_top' | 'hourglass_bottom' = 'hourglass_top';
  hourglassRotation = 0;
  private hourglassTimerId: ReturnType<typeof window.setTimeout> | null = null;
  private readonly hourglassFallDuration = 900;
  private readonly hourglassFlipDuration = 320;
  private readonly hourglassPauseDuration = 120;

  ngOnInit(): void {
    this.carregarVagas();
  }

  ngOnDestroy(): void {
    this.pararAnimacaoAmpulheta();
  }

  carregarVagas(): void {
    this.carregando = true;
    this.mensagemErro = '';

    this.resumeService.buscarVagas().subscribe({
      next: (response) => {
        this.vagas = response.vagas;
        this.sincronizarIdsDasVagas(this.resumeService.obterMatchesEmCache());
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
    this.iniciarAnimacaoAmpulheta();
    this.mensagemErro = '';
    this.mensagemSucesso = '';

    this.resumeService
      .analisarCompatibilidadeVagas()
      .pipe(
        finalize(() => {
          this.analisandoMatches = false;
          this.pararAnimacaoAmpulheta();
          this.cdr.detectChanges();
        }),
      )
      .subscribe({
        next: (matches) => {
          this.sincronizarIdsDasVagas(matches);
          this.mensagemSucesso =
            matches.length > 0
              ? 'Compatibilidade analisada com sucesso. As vagas analisadas agora já podem ser salvas no histórico.'
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

    const jobId = this.vagaSelecionada.id;

    if (jobId === null || jobId === undefined) {
      this.mensagemErro =
        'Esta vaga ainda não possui identificador interno válido. Clique em "Buscar vagas com IA" para sincronizar as vagas analisadas e tente novamente.';
      this.modalCandidaturaAberto = false;
      this.vagaSelecionada = null;
      this.cdr.detectChanges();
      return;
    }

    this.salvandoCandidatura = true;
    this.mensagemErro = '';

    this.resumeService.criarCandidatura(jobId).subscribe({
      next: () => {
        const titulo = this.vagaSelecionada?.titulo ?? 'a vaga';
        this.salvandoCandidatura = false;
        this.modalCandidaturaAberto = false;
        this.vagaSelecionada = null;
        this.mensagemSucesso = `Candidatura para "${titulo}" registrada no histórico com sucesso.`;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.salvandoCandidatura = false;
        this.mensagemErro =
          error?.error?.mensagem ||
          error?.error?.message ||
          'Não foi possível registrar a candidatura agora.';
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

  private sincronizarIdsDasVagas(matches: JobMatchItem[]): void {
    if (!matches.length || !this.vagas.length) {
      return;
    }

    const vagasAtualizadas = this.vagas.map((vaga) => {
      const matchRelacionado = matches.find((match) => this.ehMesmaVaga(vaga, match));

      if (!matchRelacionado) {
        return vaga;
      }

      return {
        ...vaga,
        id: matchRelacionado.jobId,
      };
    });

    this.vagas = vagasAtualizadas;
  }

  private ehMesmaVaga(vaga: JobItem, match: JobMatchItem): boolean {
    const jobUrlIgual =
      this.normalizarTexto(vaga.jobUrl) &&
      this.normalizarTexto(vaga.jobUrl) === this.normalizarTexto(match.jobUrl);

    if (jobUrlIgual) {
      return true;
    }

    const tituloIgual = this.normalizarTexto(vaga.titulo) === this.normalizarTexto(match.titulo);
    const empresaIgual = this.normalizarTexto(vaga.empresa) === this.normalizarTexto(match.empresa);

    return tituloIgual && empresaIgual;
  }

  private normalizarTexto(valor: string | null | undefined): string {
    return (valor ?? '').trim().toLowerCase();
  }

  private iniciarAnimacaoAmpulheta(): void {
    this.pararAnimacaoAmpulheta();
    this.hourglassIcon = 'hourglass_bottom';
    this.hourglassRotation = 0;
    this.cdr.detectChanges();
    this.executarCicloAmpulheta();
  }

  private executarCicloAmpulheta(): void {
    if (!this.analisandoMatches) {
      return;
    }

    this.agendarProximoPasso(this.hourglassFallDuration, () => {
      this.hourglassRotation += 180;
      this.cdr.detectChanges();

      this.agendarProximoPasso(this.hourglassFlipDuration, () => {
        this.hourglassIcon =
          this.hourglassIcon === 'hourglass_top' ? 'hourglass_bottom' : 'hourglass_top';
        this.cdr.detectChanges();

        this.agendarProximoPasso(this.hourglassPauseDuration, () => {
          this.executarCicloAmpulheta();
        });
      });
    });
  }

  private agendarProximoPasso(delay: number, callback: () => void): void {
    this.hourglassTimerId = window.setTimeout(() => {
      this.hourglassTimerId = null;

      if (!this.analisandoMatches) {
        return;
      }

      callback();
    }, delay);
  }

  private pararAnimacaoAmpulheta(): void {
    if (this.hourglassTimerId !== null) {
      window.clearTimeout(this.hourglassTimerId);
      this.hourglassTimerId = null;
    }

    this.hourglassIcon = 'hourglass_top';
    this.hourglassRotation = 0;
  }
}
