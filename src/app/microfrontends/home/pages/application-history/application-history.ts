import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { forkJoin } from 'rxjs';
import { JobApplicationConfirmModal } from '../../../../shared/components/job-application-confirm-modal/job-application-confirm-modal';
import {
  ApplicationItem,
  ApplicationKanbanResponse,
  ApplicationStatus,
  JobItem,
  JobMatchItem,
} from '../../models/home.models';
import { ResumeService } from '../../services/home.service';

type JobPlatform = {
  key: string;
  label: string;
  logoText: string;
};

type KanbanColumnKey = keyof ApplicationKanbanResponse;

type KanbanColumn = {
  key: KanbanColumnKey;
  label: string;
  description: string;
  status: ApplicationStatus;
};

type StatusFilterOption = {
  value: 'ALL' | ApplicationStatus;
  label: string;
};

@Component({
  selector: 'app-application-history',
  imports: [CommonModule, MatButtonModule, MatIconModule, JobApplicationConfirmModal],
  templateUrl: './application-history.html',
  styleUrl: './application-history.css',
})
export class ApplicationHistory implements OnInit {
  private resumeService = inject(ResumeService);
  private cdr = inject(ChangeDetectorRef);

  carregando = true;
  mensagemErro = '';
  mensagemSucesso = '';
  atualizandoIds = new Set<number>();
  removendoIds = new Set<number>();
  matches: JobMatchItem[] = [];
  modalMatchAberto = false;
  salvandoCandidaturaMatch = false;
  matchSelecionado: JobMatchItem | null = null;

  kanban: ApplicationKanbanResponse = {
    pendente: [],
    salva: [],
    emFila: [],
    candidatado: [],
    emAnalise: [],
    entrevista: [],
    aprovado: [],
    rejeitado: [],
    ignorado: [],
  };

  readonly statusOptions: Array<{ value: ApplicationStatus; label: string }> = [
    { value: 'PENDENTE', label: 'Pendente' },
    { value: 'SALVA', label: 'Salva' },
    { value: 'EM_FILA', label: 'Em fila' },
    { value: 'CANDIDATADO', label: 'Candidatado' },
    { value: 'EM_ANALISE', label: 'Em análise' },
    { value: 'ENTREVISTA', label: 'Entrevista' },
    { value: 'APROVADO', label: 'Aprovado' },
    { value: 'REJEITADO', label: 'Rejeitado' },
    { value: 'IGNORADO', label: 'Ignorado' },
  ];

  readonly statusFilterOptions: StatusFilterOption[] = [
    { value: 'ALL', label: 'Todos os status' },
    { value: 'PENDENTE', label: 'Pendentes' },
    { value: 'SALVA', label: 'Salvas' },
    { value: 'EM_FILA', label: 'Em fila' },
    { value: 'CANDIDATADO', label: 'Candidatadas' },
    { value: 'EM_ANALISE', label: 'Em análise' },
    { value: 'ENTREVISTA', label: 'Entrevistas' },
    { value: 'APROVADO', label: 'Aprovadas' },
    { value: 'REJEITADO', label: 'Rejeitadas' },
    { value: 'IGNORADO', label: 'Ignoradas' },
  ];

  filtroStatus: 'ALL' | ApplicationStatus = 'ALL';

  readonly columns: KanbanColumn[] = [
    { key: 'pendente', label: 'Pendentes', description: 'Candidaturas criadas e ainda não trabalhadas.', status: 'PENDENTE' },
    { key: 'salva', label: 'Salvas', description: 'Vagas guardadas para avaliar com calma.', status: 'SALVA' },
    { key: 'emFila', label: 'Em fila', description: 'Candidaturas separadas para envio.', status: 'EM_FILA' },
    { key: 'candidatado', label: 'Candidatadas', description: 'Vagas em que você já aplicou.', status: 'CANDIDATADO' },
    { key: 'emAnalise', label: 'Em análise', description: 'Processos em andamento com recrutadores.', status: 'EM_ANALISE' },
    { key: 'entrevista', label: 'Entrevistas', description: 'Etapas com conversa ou avaliação agendada.', status: 'ENTREVISTA' },
    { key: 'aprovado', label: 'Aprovadas', description: 'Processos concluídos com retorno positivo.', status: 'APROVADO' },
    { key: 'rejeitado', label: 'Rejeitadas', description: 'Vagas encerradas com retorno negativo.', status: 'REJEITADO' },
    { key: 'ignorado', label: 'Ignoradas', description: 'Vagas descartadas por você.', status: 'IGNORADO' },
  ];

  ngOnInit(): void {
    this.carregarHistorico();
  }

  carregarHistorico(): void {
    this.carregando = true;
    this.mensagemErro = '';

    forkJoin({
      kanban: this.resumeService.listarKanbanCandidaturas(),
      matches: this.resumeService.listarMatchesSalvos(),
    }).subscribe({
      next: ({ kanban, matches }) => {
        this.kanban = this.normalizarKanban(kanban);
        this.matches = [...matches].sort((a, b) => b.score - a.score);
        this.carregando = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.kanban = this.normalizarKanban();
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

  abrirVagaPorMatch(match: JobMatchItem): void {
    if (!match.jobUrl) {
      return;
    }

    window.open(match.jobUrl, '_blank', 'noopener,noreferrer');
    this.matchSelecionado = match;
    this.modalMatchAberto = true;
    this.mensagemSucesso = '';
    this.cdr.detectChanges();
  }

  fecharModalMatch(): void {
    if (this.salvandoCandidaturaMatch) {
      return;
    }

    this.modalMatchAberto = false;
    this.matchSelecionado = null;
    this.cdr.detectChanges();
  }

  informarQueNaoSeCandidatouNoMatch(): void {
    this.modalMatchAberto = false;
    this.matchSelecionado = null;
    this.mensagemSucesso = '';
    this.cdr.detectChanges();
  }

  confirmarCandidaturaPorMatch(): void {
    if (!this.matchSelecionado || this.salvandoCandidaturaMatch) {
      return;
    }

    this.salvandoCandidaturaMatch = true;
    this.mensagemErro = '';

    this.resumeService.criarCandidatura(this.matchSelecionado.jobId).subscribe({
      next: () => {
        const titulo = this.matchSelecionado?.titulo ?? 'a vaga';
        this.salvandoCandidaturaMatch = false;
        this.modalMatchAberto = false;
        this.matchSelecionado = null;
        this.mensagemSucesso = `Candidatura para "${titulo}" registrada no histórico com sucesso.`;
        this.carregarHistorico();
      },
      error: (error) => {
        this.salvandoCandidaturaMatch = false;
        this.mensagemErro =
          error?.error?.mensagem ||
          error?.error?.message ||
          'Não foi possível registrar a candidatura a partir do match.';
        this.cdr.detectChanges();
      },
    });
  }

  atualizarStatus(candidatura: ApplicationItem, event: Event): void {
    const select = event.target as HTMLSelectElement;
    const novoStatus = select.value as ApplicationStatus;

    if (!novoStatus || novoStatus === candidatura.status || this.estaProcessando(candidatura.id)) {
      select.value = candidatura.status;
      return;
    }

    this.atualizandoIds.add(candidatura.id);
    this.mensagemErro = '';

    this.resumeService.atualizarStatusCandidatura(candidatura.id, novoStatus).subscribe({
      next: () => {
        this.moverCandidatura(candidatura, novoStatus);
        this.atualizandoIds.delete(candidatura.id);
        this.cdr.detectChanges();
      },
      error: (error) => {
        select.value = candidatura.status;
        this.atualizandoIds.delete(candidatura.id);
        this.mensagemErro =
          error?.error?.mensagem ||
          error?.error?.message ||
          'Não foi possível atualizar o status da candidatura.';
        this.cdr.detectChanges();
      },
    });
  }

  deletarCandidatura(candidatura: ApplicationItem): void {
    if (this.estaProcessando(candidatura.id)) {
      return;
    }

    this.removendoIds.add(candidatura.id);
    this.mensagemErro = '';

    this.resumeService.deletarCandidatura(candidatura.id).subscribe({
      next: () => {
        this.removerCandidatura(candidatura.id);
        this.removendoIds.delete(candidatura.id);
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.removendoIds.delete(candidatura.id);
        this.mensagemErro =
          error?.error?.mensagem ||
          error?.error?.message ||
          'Não foi possível remover a candidatura.';
        this.cdr.detectChanges();
      },
    });
  }

  getApplicationsByColumn(columnKey: KanbanColumnKey): ApplicationItem[] {
    return this.kanban[columnKey] ?? [];
  }

  getApplicationsCountByColumn(columnKey: KanbanColumnKey): number {
    return this.getApplicationsByColumn(columnKey).length;
  }

  getVisibleColumns(): KanbanColumn[] {
    if (this.filtroStatus === 'ALL') {
      return this.columns;
    }

    return this.columns.filter((column) => column.status === this.filtroStatus);
  }

  getTotalCandidaturas(): number {
    return this.getVisibleColumns().reduce(
      (total, column) => total + this.getApplicationsByColumn(column.key).length,
      0
    );
  }

  estaProcessando(id: number): boolean {
    return this.atualizandoIds.has(id) || this.removendoIds.has(id);
  }

  onFiltroStatusChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.filtroStatus = (select.value as 'ALL' | ApplicationStatus) || 'ALL';
  }

  formatarDataHora(data: string): string {
    if (!data) {
      return 'Data não informada';
    }

    const parsed = new Date(data);
    if (Number.isNaN(parsed.getTime())) {
      return data;
    }

    return parsed.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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

  get matchSelecionadoComoVaga(): JobItem | null {
    if (!this.matchSelecionado) {
      return null;
    }

    return {
      id: this.matchSelecionado.jobId,
      externalId: '',
      titulo: this.matchSelecionado.titulo,
      empresa: this.matchSelecionado.empresa,
      localizacao: this.matchSelecionado.localizacao,
      modeloTrabalho: this.matchSelecionado.modeloTrabalho,
      senioridade: '',
      descricao: this.matchSelecionado.justificativa,
      salario: null,
      jobUrl: this.matchSelecionado.jobUrl,
      dataPublicacao: '',
    };
  }

  private normalizarKanban(
    kanban?: Partial<ApplicationKanbanResponse> | null
  ): ApplicationKanbanResponse {
    return {
      pendente: kanban?.pendente ?? [],
      salva: kanban?.salva ?? [],
      emFila: kanban?.emFila ?? [],
      candidatado: kanban?.candidatado ?? [],
      emAnalise: kanban?.emAnalise ?? [],
      entrevista: kanban?.entrevista ?? [],
      aprovado: kanban?.aprovado ?? [],
      rejeitado: kanban?.rejeitado ?? [],
      ignorado: kanban?.ignorado ?? [],
    };
  }

  private moverCandidatura(candidatura: ApplicationItem, novoStatus: ApplicationStatus): void {
    this.removerCandidatura(candidatura.id);

    const colunaDestino = this.getColumnKeyByStatus(novoStatus);
    const candidaturaAtualizada: ApplicationItem = {
      ...candidatura,
      status: novoStatus,
    };

    this.kanban[colunaDestino] = [candidaturaAtualizada, ...this.kanban[colunaDestino]];
  }

  private removerCandidatura(id: number): void {
    this.columns.forEach((column) => {
      this.kanban[column.key] = this.kanban[column.key].filter((item) => item.id !== id);
    });
  }

  private getColumnKeyByStatus(status: ApplicationStatus): KanbanColumnKey {
    const column = this.columns.find((item) => item.status === status);
    return column?.key ?? 'pendente';
  }
}
