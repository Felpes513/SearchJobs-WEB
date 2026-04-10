import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { ResumeService } from '../../services/home.service';
import { ResumeItem, ResumeListResponse } from '../../models/home.models';

@Component({
  selector: 'app-my-resumes',
  imports: [CommonModule],
  templateUrl: './my-resumes.html',
  styleUrl: './my-resumes.css',
})
export class MyResumes implements OnInit {
  private resumeService = inject(ResumeService);
  private cdr = inject(ChangeDetectorRef);

  curriculo: ResumeItem | null = null;
  carregando = true;
  excluindo = false;
  mensagemErro = '';

  ngOnInit(): void {
    this.carregarCurriculos();
  }

  carregarCurriculos(): void {
    this.carregando = true;
    this.mensagemErro = '';

    this.resumeService.listarCurriculos().subscribe({
      next: (response) => {
        this.curriculo = this.extrairCurriculo(response);
        this.carregando = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.carregando = false;
        this.mensagemErro =
          error?.error?.mensagem ||
          error?.error?.message ||
          'Nao foi possivel carregar os curriculos.';
        this.cdr.detectChanges();
      },
    });
  }

  deletarCurriculo(): void {
    if (!this.curriculo?.id || this.excluindo) {
      return;
    }

    const confirmou = window.confirm(
      `Deseja deletar o currículo "${this.curriculo.fileName}"?`
    );

    if (!confirmou) {
      return;
    }

    this.excluindo = true;
    this.mensagemErro = '';

    this.resumeService.deletarCurriculo(this.curriculo.id).subscribe({
      next: () => {
        this.curriculo = null;
        this.excluindo = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.excluindo = false;
        this.mensagemErro =
          error?.error?.mensagem ||
          error?.error?.message ||
          'Não foi possível deletar o currículo.';
        this.cdr.detectChanges();
      },
    });
  }

  obterLocalizacao(): string {
    if (!this.curriculo?.cidade && !this.curriculo?.estado) {
      return 'Não informado';
    }

    return [this.curriculo?.cidade, this.curriculo?.estado]
      .filter(Boolean)
      .join(', ');
  }

  formatarPeriodo(dataInicio: string | null, dataFim: string | null): string {
    const inicio = dataInicio || 'Início não informado';
    const fim = dataFim || 'Atual';
    return `${inicio} - ${fim}`;
  }

  private extrairCurriculo(
    response: ResumeListResponse | ResumeItem[]
  ): ResumeItem | null {
    const curriculos = Array.isArray(response) ? response : response.content ?? [];
    return curriculos[0] ?? null;
  }

  formatarData(data: string): string {
    return new Date(data).toLocaleString('pt-BR');
  }
}
